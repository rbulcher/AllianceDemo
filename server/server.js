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

// Configure Socket.IO with CORS settings for local network
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
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
		console.log(`📱 Device registered as: ${deviceType}`);
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

// Catch-all handler: send back React's index.html file for client-side routing
const path = require("path");
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
