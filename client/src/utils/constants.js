// App constants and configuration
import { getServerUrl } from './serverConfig';

export const APP_CONFIG = {
	SERVER_URL: getServerUrl(),
	DEVICE_TYPES: {
		CONTROLLER: "controller",
		DISPLAY: "display",
		ADMIN: "admin",
	},
	STEP_TYPES: {
		INTERACTION: "interaction",
		VIDEO: "video",
		COMPLETION: "completion",
	},
	INTERACTION_TYPES: {
		BUTTON: "button",
		HOTSPOT: "hotspot",
		SWIPE: "swipe",
		TAP: "tap",
	},
};

export const ROUTES = {
	HOME: "/",
	CONTROLLER: "/controller",
	DISPLAY: "/display",
	ADMIN: "/admin",
	SCENARIO_SELECT: "/select-scenario",
};

export const DEMO_STATES = {
	IDLE: "idle",
	SCENARIO_RUNNING: "scenario_running",
	VIDEO_PLAYING: "video_playing",
	STEP_WAITING: "step_waiting",
	COMPLETED: "completed",
};

export const ASSETS = {
	SCREENSHOTS_PATH: "/assets/screenshots",
	VIDEOS_PATH: "/assets/videos",
	SOUNDS_PATH: "/assets/sounds",
	ICONS_PATH: "/assets/icons",
};

export const TIMING = {
	TRANSITION_DURATION: 500, // milliseconds
	BUTTON_FEEDBACK_DURATION: 200,
	VIDEO_LOAD_TIMEOUT: 10000,
	SOCKET_RECONNECT_DELAY: 3000,
};

export const STYLES = {
	PHONE_ASPECT_RATIO: 0.5625, // 9:16 aspect ratio
	INTERACTION_HIGHLIGHT_COLOR: "#007AFF",
	SUCCESS_COLOR: "#34C759",
	WARNING_COLOR: "#FF9500",
	ERROR_COLOR: "#FF3B30",
};

export const MESSAGES = {
	CONNECTING: "Connecting to demo system...",
	CONNECTED: "Connected successfully!",
	DISCONNECTED: "Connection lost. Reconnecting...",
	SCENARIO_LOADING: "Loading scenario...",
	VIDEO_LOADING: "Press continue on iPad to play video.",
	STEP_COMPLETE: "Step completed!",
	DEMO_COMPLETE: "Demo completed successfully!",
};
