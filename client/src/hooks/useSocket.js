// Custom hook for Socket.IO communication
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { getServerUrl, getSocketOptions } from "../utils/serverConfig";

const SERVER_URL = getServerUrl();

console.log("🔗 Socket connecting to:", SERVER_URL);

export const useSocket = (deviceType = "controller") => {
	const [socket, setSocket] = useState(null);
	const [isConnected, setIsConnected] = useState(false);
	const [connectionAttempts, setConnectionAttempts] = useState(0);
	const [demoState, setDemoState] = useState({
		currentScenario: null,
		currentStep: 0,
		isVideoPlaying: false,
	});
	const socketRef = useRef(null);
	const reconnectTimeoutRef = useRef(null);
	const maxReconnectAttempts = 10; // Limit reconnection attempts
	const reconnectDelay = 3000; // 3 seconds

	// Helper function to attempt reconnection
	const attemptReconnection = () => {
		if (connectionAttempts < maxReconnectAttempts) {
			console.log(`🔄 Attempting reconnection (${connectionAttempts + 1}/${maxReconnectAttempts})...`);
			setConnectionAttempts(prev => prev + 1);
			
			reconnectTimeoutRef.current = setTimeout(() => {
				if (socketRef.current) {
					socketRef.current.connect();
				}
			}, reconnectDelay);
		} else {
			console.log('❌ Max reconnection attempts reached. Manual refresh may be required.');
		}
	};

	useEffect(() => {
		// Create socket connection with enhanced options for tradeshow environment
		const socketOptions = {
			...getSocketOptions(),
			timeout: 10000, // 10 second connection timeout
			forceNew: true, // Always create a new connection
			reconnection: true, // Enable auto-reconnection
			reconnectionAttempts: 5, // Built-in socket.io reconnection attempts
			reconnectionDelay: 2000, // Start with 2 second delay
			reconnectionDelayMax: 5000, // Max 5 second delay
			randomizationFactor: 0.5, // Add some randomization to avoid thundering herd
		};
		
		const newSocket = io(SERVER_URL, socketOptions);
		socketRef.current = newSocket;
		setSocket(newSocket);

		// Register device type on successful connection
		const registerDevice = () => {
			newSocket.emit("register-device", deviceType);
			console.log(`📱 Registered as ${deviceType}`);
		};

		// Connection event handlers
		newSocket.on("connect", () => {
			console.log(`✅ Connected to server as ${deviceType}`);
			setIsConnected(true);
			setConnectionAttempts(0); // Reset connection attempts on successful connection
			
			// Clear any pending reconnection timeout
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
			
			registerDevice();
		});

		newSocket.on("disconnect", (reason) => {
			console.log(`❌ Disconnected from server. Reason: ${reason}`);
			console.log(`📊 Current demo state before disconnect:`, demoState);
			setIsConnected(false);
			
			// Log different disconnect reasons for debugging Cloud Run issues
			switch(reason) {
				case 'transport error':
					console.log('🌐 Network transport error - likely Cloud Run timeout');
					break;
				case 'ping timeout':
					console.log('⏱️ Ping timeout - server didn\'t respond to ping');
					break;
				case 'transport close':
					console.log('🔌 Transport closed - connection dropped');
					break;
				case 'io server disconnect':
					console.log('🖥️ Server initiated disconnect');
					break;
				case 'io client disconnect':
					console.log('📱 Client initiated disconnect');
					break;
				default:
					console.log(`❓ Unknown disconnect reason: ${reason}`);
			}
			
			// Only attempt manual reconnection for certain disconnect reasons
			// Let socket.io handle automatic reconnection for transport issues
			if (reason === 'io server disconnect' || reason === 'io client disconnect') {
				console.log('🔄 Server or client initiated disconnect, attempting manual reconnection...');
				attemptReconnection();
			}
		});

		// Handle reconnection attempts
		newSocket.on("reconnect_attempt", (attemptNumber) => {
			console.log(`🔄 Socket.io reconnection attempt ${attemptNumber}`);
		});

		newSocket.on("reconnect", (attemptNumber) => {
			console.log(`✅ Reconnected after ${attemptNumber} attempts`);
			setConnectionAttempts(0);
			registerDevice(); // Re-register device after reconnection
			
			// Request current state explicitly after reconnection
			setTimeout(() => {
				if (newSocket.connected) {
					console.log("📡 Requesting state update after reconnection");
					newSocket.emit("request-current-state");
				}
			}, 1000); // Small delay to ensure registration completes
		});

		newSocket.on("reconnect_failed", () => {
			console.log('❌ Socket.io auto-reconnection failed, trying manual reconnection...');
			attemptReconnection();
		});

		// Handle connection errors
		newSocket.on("connect_error", (error) => {
			console.log(`❌ Connection error: ${error.message}`);
			// Don't attempt reconnection on connect_error - let socket.io handle it
		});

		// Handle connection rejection (too many devices)
		newSocket.on("connection-rejected", (data) => {
			console.log(`❌ Connection rejected: ${data.reason}`);
			// Navigate to React error page with device type and reason
			const errorUrl = `/connection-error?device=${encodeURIComponent(data.deviceType)}&reason=${encodeURIComponent(data.reason)}`;
			window.location.href = errorUrl;
		});

		// Handle force disconnection by admin
		newSocket.on("force-disconnected", (data) => {
			console.log(`🔌 Force disconnected by admin: ${data.reason}`);
			// Show a brief message then reload to reconnect
			alert(`${data.reason}\n\nClick OK to reconnect.`);
			window.location.reload();
		});

		// Demo state updates
		newSocket.on("state-update", (state) => {
			console.log("📊 State update received:", state);
			console.log("📊 Previous state:", demoState);
			setDemoState(state);
			console.log("✅ Demo state updated successfully");
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
			// Clear any pending reconnection timeout
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
			newSocket.close();
		};
	}, [deviceType]);

	// Enhanced socket methods with connection checking and queuing
	const safeEmit = (eventName, data) => {
		if (socket && isConnected) {
			socket.emit(eventName, data);
			return true;
		} else {
			console.warn(`⚠️ Cannot emit '${eventName}' - socket not connected. Event queued for retry.`);
			// For tradeshow environment, we'll retry once after a short delay
			setTimeout(() => {
				if (socket && isConnected) {
					console.log(`🔄 Retrying queued event: ${eventName}`);
					socket.emit(eventName, data);
				}
			}, 1000);
			return false;
		}
	};

	const startScenario = (scenarioId, options = {}) => {
		safeEmit("start-scenario", { scenarioId, ...options });
	};

	const nextStep = (stepData) => {
		safeEmit("next-step", stepData);
	};

	const videoStarted = (videoData) => {
		safeEmit("video-started", videoData);
	};

	const videoEnded = (videoData) => {
		safeEmit("video-ended", videoData);
	};

	const adminReset = () => {
		safeEmit("admin-reset");
	};

	const adminGotoStep = (stepNumber) => {
		safeEmit("admin-goto-step", stepNumber);
	};

	const playVideo = (videoData) => {
		safeEmit("play-video-manual", videoData);
	};

	// Manual reconnection trigger for emergency use
	const forceReconnect = () => {
		console.log("🔄 Force reconnecting...");
		setConnectionAttempts(0); // Reset attempts counter
		if (socketRef.current) {
			socketRef.current.disconnect();
			socketRef.current.connect();
		}
	};

	return {
		socket,
		isConnected,
		connectionAttempts,
		demoState,
		startScenario,
		nextStep,
		videoStarted,
		videoEnded,
		adminReset,
		adminGotoStep,
		playVideo,
		forceReconnect, // Emergency reconnection method
	};
};
