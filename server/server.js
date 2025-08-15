const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { connectDB } = require("./config/database");
const AnalyticsService = require("./services/analyticsService");

// Load environment variables
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS settings and production timeouts
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
	// Production settings for Cloud Run
	pingTimeout: 60000, // 60 seconds - how long to wait for ping response
	pingInterval: 25000, // 25 seconds - how often to send ping packets
	transports: ["websocket", "polling"], // Ensure fallback transport
	upgradeTimeout: 30000, // 30 seconds for websocket upgrade
	allowEIO3: true, // Backwards compatibility
});

const PORT = process.env.PORT || 5000;
const HOST_IP = process.env.HOST_IP || "localhost";

// Initialize analytics service
let analyticsService;
let isOfflineMode = false;

// Initialize database and analytics service
const initializeServices = async () => {
	try {
		console.log("🚀 Initializing services...");
		const dbConnection = await connectDB();

		if (dbConnection) {
			// Database connected successfully
			analyticsService = new AnalyticsService();
			console.log("📊 Analytics service initialized");
			console.log("🌐 Running in ONLINE MODE with database analytics");
		} else {
			// Database failed to connect
			isOfflineMode = true;
			analyticsService = null;
			console.log("🔄 Running in OFFLINE MODE - analytics disabled");
		}
	} catch (error) {
		console.error("❌ Error initializing services:", error);
		isOfflineMode = true;
		analyticsService = null;
		console.log("🔄 Falling back to OFFLINE MODE - analytics disabled");
	}
};

// Middleware
app.use(cors());
app.use(express.json());

// Simple admin password - no session storage needed

// Serve static files (videos now served from Cloud Storage)
app.use(express.static("public"));

// Store current demo state
let demoState = {
	currentScenario: null,
	currentStep: 0,
	isVideoPlaying: false, // Videos never auto-play - only manual triggers allowed
	connectedDevices: {
		display: null,
		controller: null,
		admin: null,
	},
};

// Connected devices tracking for analytics
let connectedDevicesForAnalytics = [];

// Socket.IO connection handling
io.on("connection", (socket) => {
	console.log(`🔌 Device connected: ${socket.id}`);

	// Device registration
	socket.on("register-device", (deviceType) => {
		console.log(`📱 Device registration attempt: ${deviceType}`);
		
		// Check if device type is already connected (limit 1 per type except admin)
		if ((deviceType === "display" || deviceType === "controller") && 
			demoState.connectedDevices[deviceType] !== null) {
			console.log(`❌ ${deviceType} already connected. Rejecting: ${socket.id}`);
			socket.emit("connection-rejected", { 
				reason: `Maximum ${deviceType}s currently open`,
				deviceType: deviceType
			});
			socket.disconnect();
			return;
		}

		console.log(`✅ Device registered as: ${deviceType}`);
		demoState.connectedDevices[deviceType] = socket.id;
		socket.deviceType = deviceType; // Store for later reference

		// Add to analytics tracking
		const deviceInfo = {
			id: socket.id,
			type: deviceType,
			connectedAt: new Date(),
			lastActive: new Date(),
		};

		// Remove existing device of same type and add new one
		connectedDevicesForAnalytics = connectedDevicesForAnalytics.filter(
			(d) => d.type !== deviceType
		);
		connectedDevicesForAnalytics.push(deviceInfo);

		// Notify admin panels about device connection
		io.to("admin-room").emit("device-connected", deviceInfo);

		// Send current state to newly connected device
		socket.emit("state-update", demoState);

		// If this is an admin device, add to admin room
		if (deviceType === "admin") {
			socket.join("admin-room");
		}
	});

	// Force connect - take over existing connection
	socket.on("force-connect", (deviceType) => {
		console.log(`Force connect attempt: ${deviceType} from ${socket.id}`);
		
		// Find and disconnect existing device of this type
		const existingSocketId = demoState.connectedDevices[deviceType];
		if (existingSocketId) {
			const existingSocket = io.sockets.sockets.get(existingSocketId);
			if (existingSocket) {
				console.log(`🔥 Disconnecting existing ${deviceType}: ${existingSocketId}`);
				existingSocket.emit("force-disconnected", { 
					reason: "Another device has taken over this connection",
					takenOver: true
				});
				existingSocket.disconnect();
			}
		}

		// Register this socket as the new device
		console.log(`✅ Force registered as: ${deviceType}`);
		demoState.connectedDevices[deviceType] = socket.id;
		socket.deviceType = deviceType;

		// Add to analytics tracking
		const deviceInfo = {
			id: socket.id,
			type: deviceType,
			connectedAt: new Date(),
			lastActive: new Date(),
		};

		// Remove existing device of same type and add new one
		connectedDevicesForAnalytics = connectedDevicesForAnalytics.filter(
			(d) => d.type !== deviceType
		);
		connectedDevicesForAnalytics.push(deviceInfo);

		// Notify admin panels about device connection
		io.to("admin-room").emit("device-connected", deviceInfo);

		// Send current state to newly connected device
		socket.emit("state-update", demoState);
		socket.emit("force-connect-success", { deviceType });

		// If this is an admin device, add to admin room
		if (deviceType === "admin") {
			socket.join("admin-room");
		}
	});

	// Scenario control from controller
	socket.on("start-scenario", (data) => {
		const scenarioId = typeof data === "string" ? data : data.scenarioId;
		const options = typeof data === "string" ? {} : data;

		console.log(`🎬 Starting scenario: ${scenarioId}`, options);
		console.log(`📊 Analytics service available: ${!!analyticsService}`);
		demoState.currentScenario = scenarioId;
		demoState.currentStep = 0;
		demoState.isVideoPlaying = false;

		// Record in analytics database
		if (analyticsService) {
			analyticsService
				.recordScenarioStart(scenarioId)
				.then(async (result) => {
					if (result.success) {
						console.log(`📊 Analytics recorded for scenario: ${scenarioId}`);
						// Send updated analytics to admin panels - get complete data
						const allAnalytics = await analyticsService.getAllAnalytics();
						if (allAnalytics.success) {
							allAnalytics.data.connectedDevices = connectedDevicesForAnalytics;
							console.log(
								`📡 Sending analytics update to admin room with data:`,
								{
									totalScenarios: allAnalytics.data.totalScenarios,
									scenarioStats: allAnalytics.data.scenarioStats,
								}
							);
							io.to("admin-room").emit("analytics-update", allAnalytics.data);
						}
					} else {
						console.error("❌ Analytics recording failed:", result.error);
					}
				})
				.catch((error) => {
					console.error("❌ Failed to record analytics:", error);
				});
		} else {
			console.warn("⚠️ Analytics service not available");
		}

		// Always broadcast normally - no auto-play videos
		io.emit("scenario-started", {
			scenarioId,
			step: 0,
		});
	});

	// Step progression
	socket.on("next-step", (stepData) => {
		console.log(`➡️ Next step: ${JSON.stringify(stepData)}`);

		// Don't allow progression beyond reasonable bounds
		if (stepData.stepNumber >= 0 && stepData.stepNumber < 50) {
			demoState.currentStep = stepData.stepNumber;

			// Always just update the step - no auto-play videos
			io.emit("step-updated", stepData);
		} else {
			console.log(`❌ Invalid step number: ${stepData.stepNumber}`);
		}
	});

	// Manual video play trigger from controller
	socket.on("play-video-manual", (videoData) => {
		console.log(`🎬 Manual video play: ${JSON.stringify(videoData)}`);
		demoState.isVideoPlaying = true;
		io.emit("play-video", videoData);
	});

	// Video events from display
	socket.on("video-started", (data) => {
		console.log(`🎥 Video started: ${data?.videoId || "unknown"}`);
		demoState.isVideoPlaying = true;
		io.emit("video-status", { status: "playing", ...data });
	});

	socket.on("video-ended", (data) => {
		console.log(`🎥 Video ended: ${data.videoId}`, data);
		console.log(`📊 Server state update: isVideoPlaying = false`);
		demoState.isVideoPlaying = false;

		// Only auto-progress for pure video steps, not controller-message steps
		if (data.autoProgress !== false) {
			// Auto-progress to next step after video ends, but don't go beyond reasonable bounds
			const nextStep = data.step + 1;
			if (nextStep < 50) {
				demoState.currentStep = nextStep;

				io.emit("video-status", { status: "ended", ...data });
				io.emit("step-updated", {
					stepNumber: demoState.currentStep,
					autoProgressed: true,
				});
			} else {
				console.log(
					`❌ Video ended but next step would be beyond bounds: ${nextStep}`
				);
				io.emit("video-status", { status: "ended", ...data });
			}
		} else {
			// Just update video status, don't auto-progress
			io.emit("video-status", { status: "ended", ...data });
			// Send updated state to all clients so they know video stopped
			io.emit("state-update", demoState);
			// Send step-updated event so controller knows step is ready for interaction
			io.emit("step-updated", {
				stepNumber: demoState.currentStep,
				videoEnded: true,
				readyForInteraction: true,
			});
		}
	});

	// Admin controls
	socket.on("admin-reset", async () => {
		console.log("🔄 Admin reset triggered");

		// Record scenario completion if there was an active scenario
		if (demoState.currentScenario && analyticsService) {
			try {
				const result = await analyticsService.recordScenarioCompletion(
					demoState.currentScenario
				);
				if (result.success) {
					console.log(
						`📊 Analytics recorded completion for scenario: ${demoState.currentScenario}`
					);
					// Send updated analytics to admin panels
					const allAnalytics = await analyticsService.getAllAnalytics();
					if (allAnalytics.success) {
						allAnalytics.data.connectedDevices = connectedDevicesForAnalytics;
						io.to("admin-room").emit("analytics-update", allAnalytics.data);
					}
				}
			} catch (error) {
				console.error("❌ Failed to record scenario completion:", error);
			}
		}

		demoState = {
			currentScenario: null,
			currentStep: 0,
			isVideoPlaying: false,
			connectedDevices: demoState.connectedDevices, // Keep connections
		};
		io.emit("demo-reset");
	});

	socket.on("admin-goto-step", (stepNumber) => {
		console.log(`🎯 Admin jumping to step: ${stepNumber}`);
		demoState.currentStep = stepNumber;
		io.emit("step-jumped", { stepNumber });
	});

	// Analytics endpoints for admin
	socket.on("admin-get-analytics", async () => {
		if (socket.deviceType === "admin" && analyticsService) {
			try {
				const result = await analyticsService.getAllAnalytics();
				if (result.success) {
					// Add current connected devices
					result.data.connectedDevices = connectedDevicesForAnalytics;
					socket.emit("analytics-update", result.data);
				}
			} catch (error) {
				console.error("❌ Error getting analytics:", error);
			}
		}
	});

	socket.on("admin-get-system-stats", async () => {
		if (socket.deviceType === "admin") {
			const stats = {
				uptime: process.uptime(),
				memory: process.memoryUsage().heapUsed,
				status: "healthy",
			};
			socket.emit("system-stats", stats);

			// Update database with current uptime
			if (analyticsService) {
				analyticsService.updateSystemUptime(process.uptime());
			}
		}
	});

	socket.on("admin-get-connected-devices", () => {
		if (socket.deviceType === "admin") {
			socket.emit("device-list", connectedDevicesForAnalytics);
		}
	});

	socket.on("admin-clear-errors", () => {
		if (socket.deviceType === "admin") {
			// For now, just acknowledge - could implement error logging later
			socket.emit("errors-cleared");
		}
	});

	// Handle state requests (for reconnection recovery)
	socket.on("request-current-state", () => {
		console.log(`📡 State request from ${socket.deviceType || 'unknown'}: ${socket.id}`);
		// Send current demo state
		socket.emit("state-update", demoState);
	});

	// Handle disconnection
	socket.on("disconnect", () => {
		console.log(`📴 Device disconnected: ${socket.id}`);

		// Remove from connected devices
		Object.keys(demoState.connectedDevices).forEach((deviceType) => {
			if (demoState.connectedDevices[deviceType] === socket.id) {
				demoState.connectedDevices[deviceType] = null;
			}
		});

		// Remove from analytics tracking
		const deviceInfo = connectedDevicesForAnalytics.find(
			(d) => d.id === socket.id
		);
		if (deviceInfo) {
			connectedDevicesForAnalytics = connectedDevicesForAnalytics.filter(
				(d) => d.id !== socket.id
			);
			// Notify admin panels about device disconnection
			io.to("admin-room").emit("device-disconnected", socket.id);
		}
	});
});

// Simple admin password check endpoint
app.post("/api/admin/auth", (req, res) => {
	const { password } = req.body;
	const correctPassword = "7913";
	
	if (password === correctPassword) {
		res.json({ 
			success: true,
			message: "Authentication successful"
		});
	} else {
		res.status(401).json({ 
			success: false, 
			message: "Invalid password" 
		});
	}
});

// REST API endpoints for admin
app.get("/api/status", (req, res) => {
	res.json({
		...demoState,
		connectedDevices: Object.keys(demoState.connectedDevices).reduce(
			(acc, key) => {
				acc[key] = demoState.connectedDevices[key] !== null;
				return acc;
			},
			{}
		),
	});
});

app.post("/api/reset", async (req, res) => {
	// Record scenario completion if there was an active scenario
	if (demoState.currentScenario && analyticsService) {
		try {
			const result = await analyticsService.recordScenarioCompletion(
				demoState.currentScenario
			);
			if (result.success) {
				console.log(
					`📊 Analytics recorded completion for scenario: ${demoState.currentScenario}`
				);
			}
		} catch (error) {
			console.error("❌ Failed to record scenario completion:", error);
		}
	}

	demoState = {
		currentScenario: null,
		currentStep: 0,
		isVideoPlaying: false,
		connectedDevices: demoState.connectedDevices,
	};
	io.emit("demo-reset");
	res.json({ success: true });
});

// Health check
app.get("/health", (req, res) => {
	res.json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		connectedDevices: Object.keys(demoState.connectedDevices).filter(
			(key) => demoState.connectedDevices[key] !== null
		).length,
	});
});

// REST API endpoints for analytics
app.get("/api/analytics", async (req, res) => {
	if (isOfflineMode || !analyticsService) {
		// Return minimal data for offline mode
		console.log("📊 Serving offline analytics data");
		res.json({
			dailyData: {},
			totalScenarios: 0,
			totalSessions: 0,
			systemUptime: Math.floor(process.uptime()),
			lastActivity: null,
			connectedDevices: connectedDevicesForAnalytics,
			offline: true,
		});
		return;
	}

	try {
		const result = await analyticsService.getAllAnalytics();
		if (result.success || result.offline) {
			// Add current connected devices
			const data = result.data || result;
			data.connectedDevices = connectedDevicesForAnalytics;
			res.json(data);
		} else {
			res.status(500).json({ error: result.error });
		}
	} catch (error) {
		console.error("❌ Analytics API error:", error.message);
		// Fallback to offline mode response
		res.json({
			dailyData: {},
			totalScenarios: 0,
			totalSessions: 0,
			systemUptime: Math.floor(process.uptime()),
			lastActivity: null,
			connectedDevices: connectedDevicesForAnalytics,
			offline: true,
			error: error.message,
		});
	}
});

app.get("/api/analytics/:date", async (req, res) => {
	if (analyticsService) {
		try {
			const result = await analyticsService.getAnalyticsForDate(
				req.params.date
			);
			if (result.success) {
				res.json(result.data);
			} else {
				res.status(500).json({ error: result.error });
			}
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	} else {
		res.status(503).json({ error: "Analytics service not initialized" });
	}
});

app.delete("/api/analytics", async (req, res) => {
	if (analyticsService) {
		try {
			const result = await analyticsService.clearAllAnalytics();
			if (result.success) {
				res.json({ success: true, message: "All analytics data cleared" });
			} else {
				res.status(500).json({ error: result.error });
			}
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	} else {
		res.status(503).json({ error: "Analytics service not initialized" });
	}
});

// Simple handler for admin route - serve React app and let client-side handle auth
const path = require("path");
app.get("/admin*", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Also serve the login form at a specific endpoint
app.get("/admin-login", (req, res) => {
	const loginHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Alliance Demo - Admin Login</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #ffffff;
        }
        .login-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            width: 400px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .login-title {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #00d4ff, #ffffff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: bold;
        }
        .login-subtitle {
            font-size: 1.1rem;
            margin-bottom: 30px;
            opacity: 0.8;
        }
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            opacity: 0.9;
        }
        .form-input {
            width: 100%;
            padding: 15px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            font-size: 1.1rem;
            box-sizing: border-box;
            transition: all 0.3s ease;
        }
        .form-input:focus {
            outline: none;
            border-color: #00d4ff;
            background: rgba(255, 255, 255, 0.15);
        }
        .form-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }
        .login-button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(45deg, #00d4ff, #0099cc);
            border: none;
            border-radius: 10px;
            color: white;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 10px;
        }
        .login-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
        }
        .login-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .error-message {
            background: rgba(220, 53, 69, 0.2);
            border: 1px solid rgba(220, 53, 69, 0.4);
            border-radius: 8px;
            padding: 12px;
            margin-top: 15px;
            color: #ff6b6b;
            font-size: 0.95rem;
        }
        .success-message {
            background: rgba(40, 167, 69, 0.2);
            border: 1px solid rgba(40, 167, 69, 0.4);
            border-radius: 8px;
            padding: 12px;
            margin-top: 15px;
            color: #51cf66;
            font-size: 0.95rem;
        }
        .loading {
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1 class="login-title">Alliance Demo</h1>
        <p class="login-subtitle">Admin Access Required</p>
        
        <form id="loginForm">
            <div class="form-group">
                <label class="form-label" for="password">Enter Admin Password:</label>
                <input 
                    type="password" 
                    id="password" 
                    class="form-input" 
                    placeholder="Password"
                    required 
                    autocomplete="current-password"
                />
            </div>
            
            <button type="submit" class="login-button" id="loginButton">
                Access Admin Panel
            </button>
        </form>
        
        <div id="message" style="display: none;"></div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const button = document.getElementById('loginButton');
            const messageDiv = document.getElementById('message');
            const form = document.getElementById('loginForm');
            
            // Show loading state
            button.disabled = true;
            button.textContent = 'Authenticating...';
            form.classList.add('loading');
            messageDiv.style.display = 'none';
            
            try {
                const response = await fetch('/api/admin/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    messageDiv.className = 'success-message';
                    messageDiv.textContent = 'Authentication successful! Redirecting...';
                    messageDiv.style.display = 'block';
                    
                    // Store authentication in localStorage and redirect
                    localStorage.setItem('adminAuth', 'true');
                    setTimeout(() => {
                        window.location.href = '/admin';
                    }, 1000);
                } else {
                    messageDiv.className = 'error-message';
                    messageDiv.textContent = result.message || 'Authentication failed';
                    messageDiv.style.display = 'block';
                }
            } catch (error) {
                messageDiv.className = 'error-message';
                messageDiv.textContent = 'Connection error. Please try again.';
                messageDiv.style.display = 'block';
            }
            
            // Reset button state
            button.disabled = false;
            button.textContent = 'Access Admin Panel';
            form.classList.remove('loading');
        });
        
        // Auto-focus password field
        document.getElementById('password').focus();
        
        // Clear any error messages when user starts typing
        document.getElementById('password').addEventListener('input', () => {
            const messageDiv = document.getElementById('message');
            if (messageDiv.classList.contains('error-message')) {
                messageDiv.style.display = 'none';
            }
        });
    </script>
</body>
</html>
		`;
		
		res.send(loginHtml);
});

// Connection error page for rejected devices (DISABLED - using React route now)
/*
app.get("/connection-error", (req, res) => {
	const deviceType = req.query.device || "device";
	const reason = req.query.reason || "Connection limit reached";
	
	const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Alliance Demo - Connection Error</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #ffffff;
        }
        .error-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            width: 500px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .error-title {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #ff6b6b, #ffffff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: bold;
        }
        .error-subtitle {
            font-size: 1.3rem;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .error-message {
            background: rgba(220, 53, 69, 0.2);
            border: 1px solid rgba(220, 53, 69, 0.4);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            font-size: 1.1rem;
            color: #ff6b6b;
        }
        .instructions {
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        .instructions h3 {
            margin-top: 0;
            color: #00d4ff;
        }
        .instructions ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .instructions li {
            margin: 8px 0;
            opacity: 0.9;
        }
        .retry-button {
            background: linear-gradient(45deg, #00d4ff, #0099cc);
            border: none;
            border-radius: 10px;
            color: white;
            font-size: 1.1rem;
            font-weight: bold;
            padding: 15px 30px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 20px;
        }
        .retry-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
        }
        .device-icon {
            font-size: 4rem;
            margin-bottom: 20px;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="device-icon">
            ${deviceType === "controller" ? "📱" : deviceType === "display" ? "🖥️" : "📟"}
        </div>
        <h1 class="error-title">Connection Blocked</h1>
        <p class="error-subtitle">Maximum ${deviceType}s currently open</p>
        
        <div class="error-message">
            <strong>Reason:</strong> ${reason}
        </div>
        
        <div class="instructions">
            <h3>What to do:</h3>
            <ul>
                <li><strong>Force Connect</strong> - Take over the existing connection (recommended for tradeshow)</li>
                <li><strong>Close other ${deviceType} windows/tabs</strong> - Only one ${deviceType} can be connected at a time</li>
                <li><strong>Wait and retry</strong> - The connection may become available shortly</li>
            </ul>
        </div>
        
        <button class="retry-button force-connect-btn" onclick="forceConnect('${deviceType}')">
            Force Connect
        </button>
        
        <script src="/socket.io/socket.io.js"></script>
        <script>
            function forceConnect(deviceType) {
                const button = document.querySelector('.force-connect-btn');
                button.disabled = true;
                button.textContent = 'Connecting...';
                
                // Connect to server and request force connection
                const socket = io();
                
                socket.on('connect', () => {
                    console.log('Connected, requesting force connect for:', deviceType);
                    socket.emit('force-connect', deviceType);
                });
                
                socket.on('force-connect-success', () => {
                    console.log('Force connect successful, redirecting...');
                    // Redirect back to React app (determine the client URL)
                    const clientUrl = window.location.protocol + '//' + window.location.hostname + ':3000';
                    window.location.href = clientUrl + '/' + deviceType;
                });
                
                socket.on('connect_error', (error) => {
                    console.error('Connection error:', error);
                    button.disabled = false;
                    button.textContent = '🔥 Force Connect';
                    alert('Connection failed. Please try again.');
                });
                
                // Timeout fallback
                setTimeout(() => {
                    if (button.disabled) {
                        button.disabled = false;
                        button.textContent = '🔥 Force Connect';
                        alert('Connection timeout. Please try again.');
                    }
                }, 10000);
            }
        </script>
    </div>
</body>
</html>
	`;
	
	res.send(errorHtml);
});
*/

// Catch-all handler: send back React's index.html file for client-side routing
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Initialize services and start server
const startServer = async () => {
	try {
		await initializeServices();

		server.listen(PORT, () => {
			console.log(`✅ Alliance Demo Server running on port ${PORT}`);
			if (isOfflineMode) {
				console.log(`🔄 Running in OFFLINE MODE - analytics disabled`);
			} else {
				console.log(`🌐 Running in ONLINE MODE with database analytics`);
			}
			console.log(`🌐 Local URLs:`);
			console.log(`   Display: http://localhost:${PORT}/display`);
			console.log(`   Controller: http://localhost:${PORT}/controller`);
			console.log(`   Admin: http://localhost:${PORT}/admin`);
			console.log(`📱 Network URLs (for iPad/mobile):`);
			console.log(`   Display: http://${HOST_IP}:${PORT}/display`);
			console.log(`   Controller: http://${HOST_IP}:${PORT}/controller`);
			console.log(`   Admin: http://${HOST_IP}:${PORT}/admin`);
			console.log(`📊 MongoDB analytics enabled`);
		});
	} catch (error) {
		console.error("❌ Failed to start server:", error);
		process.exit(1);
	}
};

startServer();
