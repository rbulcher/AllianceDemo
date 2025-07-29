// Custom hook for Socket.IO communication
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { getServerUrl, getSocketOptions } from "../utils/serverConfig";

const SERVER_URL = getServerUrl();

console.log("🔗 Socket connecting to:", SERVER_URL);

export const useSocket = (deviceType = "controller") => {
	const [socket, setSocket] = useState(null);
	const [isConnected, setIsConnected] = useState(false);
	const [demoState, setDemoState] = useState({
		currentScenario: null,
		currentStep: 0,
		isVideoPlaying: false,
	});
	const socketRef = useRef(null);

	useEffect(() => {
		// Create socket connection with proper security settings
		const socketOptions = getSocketOptions();
		const newSocket = io(SERVER_URL, socketOptions);
		socketRef.current = newSocket;
		setSocket(newSocket);

		// Register device type
		newSocket.emit("register-device", deviceType);

		// Connection event handlers
		newSocket.on("connect", () => {
			console.log(`✅ Connected to server as ${deviceType}`);
			setIsConnected(true);
		});

		newSocket.on("disconnect", () => {
			console.log(`❌ Disconnected from server`);
			setIsConnected(false);
		});

		// Demo state updates
		newSocket.on("state-update", (state) => {
			console.log("📊 State update received:", state);
			setDemoState(state);
		});

		newSocket.on("scenario-started", (data) => {
			console.log("🎬 Scenario started:", data);
			setDemoState((prev) => ({
				...prev,
				currentScenario: data.scenarioId,
				currentStep: data.step,
				isVideoPlaying: false,
			}));
		});

		newSocket.on("step-updated", (stepData) => {
			console.log("➡️ Step updated:", stepData);
			setDemoState((prev) => ({
				...prev,
				currentStep: stepData.stepNumber,
				isVideoPlaying: false,
			}));
		});

		newSocket.on("play-video", (videoData) => {
			console.log("🎥 Play video:", videoData);
			setDemoState((prev) => ({
				...prev,
				isVideoPlaying: true,
				currentStep: videoData.step,
			}));
		});

		newSocket.on("video-status", (status) => {
			console.log("📹 Video status:", status);
			setDemoState((prev) => ({
				...prev,
				isVideoPlaying: status.status === "playing",
			}));
		});

		newSocket.on("demo-reset", () => {
			console.log("🔄 Demo reset");
			setDemoState({
				currentScenario: null,
				currentStep: 0,
				isVideoPlaying: false,
			});
		});

		newSocket.on("step-jumped", (data) => {
			console.log("🎯 Step jumped:", data);
			setDemoState((prev) => ({
				...prev,
				currentStep: data.stepNumber,
			}));
		});

		// Cleanup on unmount
		return () => {
			newSocket.close();
		};
	}, [deviceType]);

	// Socket methods
	const startScenario = (scenarioId, options = {}) => {
		if (socket) {
			socket.emit("start-scenario", { scenarioId, ...options });
		}
	};

	const nextStep = (stepData) => {
		if (socket) {
			socket.emit("next-step", stepData);
		}
	};

	const videoStarted = (videoData) => {
		if (socket) {
			socket.emit("video-started", videoData);
		}
	};

	const videoEnded = (videoData) => {
		if (socket) {
			socket.emit("video-ended", videoData);
		}
	};

	const adminReset = () => {
		if (socket) {
			socket.emit("admin-reset");
		}
	};

	const adminGotoStep = (stepNumber) => {
		if (socket) {
			socket.emit("admin-goto-step", stepNumber);
		}
	};

	const playVideo = (videoData) => {
		if (socket) {
			socket.emit("play-video-manual", videoData);
		}
	};

	return {
		socket,
		isConnected,
		demoState,
		startScenario,
		nextStep,
		videoStarted,
		videoEnded,
		adminReset,
		adminGotoStep,
		playVideo,
	};
};
