// Centralized server configuration

/**
 * Gets the appropriate server URL based on environment
 * - Production: Uses current origin (HTTPS)
 * - Development: Uses env variable or fallback to local IP
 */
export const getServerUrl = () => {
	if (process.env.NODE_ENV === 'production') {
		return window.location.origin;
	}
	
	return process.env.REACT_APP_SERVER_URL || "http://192.168.86.31:5000";
};

/**
 * Gets Socket.IO options based on environment
 */
export const getSocketOptions = () => {
	if (process.env.NODE_ENV === 'production') {
		return {
			secure: true,
			transports: ['websocket', 'polling']
		};
	}
	
	return {};
};

// Export the server URL for immediate use
export const SERVER_URL = getServerUrl();