// Centralized server configuration

// Centralized server configuration

/**
 * Gets the appropriate server URL based on environment
 * - Production: Uses current origin (HTTPS)
 * - Development: Uses env variable or constructs from HOST_IP
 */
export const getServerUrl = () => {
	if (process.env.NODE_ENV === "production") {
		return window.location.origin;
	}

	// Use REACT_APP_SERVER_URL if set, otherwise construct from HOST_IP and PORT
	if (process.env.REACT_APP_SERVER_URL) {
		return process.env.REACT_APP_SERVER_URL;
	}

	const hostIp = process.env.REACT_APP_SERVER_HOST_IP || "localhost";
	const port = process.env.REACT_APP_SERVER_PORT || "5000";
	return `http://${hostIp}:${port}`;
};

/**
 * Gets Socket.IO options based on environment
 */
export const getSocketOptions = () => {
	if (process.env.NODE_ENV === "production") {
		return {
			secure: true,
			transports: ["websocket", "polling"],
		};
	}

	return {};
};

// Export the server URL for immediate use
export const SERVER_URL = getServerUrl();
