const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

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

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (videos now served from Cloud Storage)
app.use(express.static('public'));

// Store current demo state
let demoState = {
	currentScenario: null,
	currentStep: 0,
	isVideoPlaying: false, // Videos never auto-play - only manual triggers allowed
	connectedDevices: {
		display: null,
		controller: null,
	},
};

// Socket.IO connection handling
io.on("connection", (socket) => {
	console.log(`🔌 Device connected: ${socket.id}`);

	// Device registration
	socket.on("register-device", (deviceType) => {
		console.log(`📱 Device registered as: ${deviceType}`);
		demoState.connectedDevices[deviceType] = socket.id;

		// Send current state to newly connected device
		socket.emit("state-update", demoState);
	});

	// Scenario control from controller
	socket.on("start-scenario", (data) => {
		const scenarioId = typeof data === "string" ? data : data.scenarioId;
		const options = typeof data === "string" ? {} : data;

		console.log(`🎬 Starting scenario: ${scenarioId}`, options);
		demoState.currentScenario = scenarioId;
		demoState.currentStep = 0;
		demoState.isVideoPlaying = false;

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
				readyForInteraction: true
			});
		}
	});

	// Admin controls
	socket.on("admin-reset", () => {
		console.log("🔄 Admin reset triggered");
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

	// Handle disconnection
	socket.on("disconnect", () => {
		console.log(`📴 Device disconnected: ${socket.id}`);

		// Remove from connected devices
		Object.keys(demoState.connectedDevices).forEach((deviceType) => {
			if (demoState.connectedDevices[deviceType] === socket.id) {
				demoState.connectedDevices[deviceType] = null;
			}
		});
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

app.post("/api/reset", (req, res) => {
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

// Catch-all handler: send back React's index.html file for client-side routing
const path = require('path');
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
	console.log(`✅ Alliance Demo Server running on port ${PORT}`);
	console.log(`🌐 Local URLs:`);
	console.log(`   Display: http://localhost:${PORT}/display`);
	console.log(`   Controller: http://localhost:${PORT}/controller`);
	console.log(`   Admin: http://localhost:${PORT}/admin`);
	console.log(`📱 Network URLs (for iPad/mobile):`);
	console.log(`   Display: http://192.168.86.31:${PORT}/display`);
	console.log(`   Controller: http://192.168.86.31:${PORT}/controller`);
	console.log(`   Admin: http://192.168.86.31:${PORT}/admin`);
});
