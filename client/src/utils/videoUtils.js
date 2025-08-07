// Video URL utilities for handling local vs cloud storage

// Cloud storage URLs for online demo
const CLOUD_VIDEO_URLS = {
	'scenario1-video1': 'https://storage.googleapis.com/alliance-demo-bucket/Scenario1Video1.mp4',
	'scenario1-video2': 'https://storage.googleapis.com/alliance-demo-bucket/Scenario1Video2NEW.mp4',
	'scenario2-video1': 'https://storage.googleapis.com/alliance-demo-bucket/Scenario2Video1.mp4',
	'scenario2-video2': 'https://storage.googleapis.com/alliance-demo-bucket/Scenario2Video2.mp4',
	'scenario2-video3': 'https://storage.googleapis.com/alliance-demo-bucket/Scenario2Video3.mp4',
	'scenario4-video1': 'https://storage.googleapis.com/alliance-demo-bucket/Scenario4Video1.mp4',
	'scenario4-video2': 'https://storage.googleapis.com/alliance-demo-bucket/Scenario4Video2.mp4',
	// Add more cloud URLs as needed
};

// Local video paths for offline demo
const LOCAL_VIDEO_URLS = {
	'scenario1-video1': '/assets/videos/scenario1/1.mp4',
	'scenario1-video2': '/assets/videos/scenario1/2.mp4',
	'scenario2-video1': '/assets/videos/scenario2/1.mp4',
	'scenario2-video2': '/assets/videos/scenario2/2.mp4',
	'scenario2-video3': '/assets/videos/scenario2/3.mp4',
	'scenario4-video1': '/assets/videos/scenario4/1.mp4',
	'scenario4-video2': '/assets/videos/scenario4/2.mp4',
	// Add more local URLs as needed
};

/**
 * Determines if we should use cloud storage for videos
 * - Production AND online environment = use cloud storage
 * - Development OR offline demo = use local files
 */
export const shouldUseCloudStorage = () => {
	// Check if we're in production
	const isProduction = process.env.NODE_ENV === 'production';
	
	// Check if we're using a cloud URL (indicates online demo)
	const isOnlineDemo = window.location.origin.includes('run.app') || 
	                     window.location.origin.includes('googleapis.com') ||
	                     window.location.origin.includes('cloudflare') ||
	                     window.location.origin.includes('vercel') ||
	                     window.location.origin.includes('netlify');
	
	return isProduction && isOnlineDemo;
};

/**
 * Gets the appropriate video URL based on environment
 * @param {string} videoKey - The video identifier (e.g., 'scenario1-video1')
 * @returns {string} The video URL
 */
export const getVideoUrl = (videoKey) => {
	const useCloud = shouldUseCloudStorage();
	
	if (useCloud && CLOUD_VIDEO_URLS[videoKey]) {
		console.log(`🌥️ Using cloud storage for video: ${videoKey}`);
		return CLOUD_VIDEO_URLS[videoKey];
	}
	
	if (LOCAL_VIDEO_URLS[videoKey]) {
		console.log(`💻 Using local storage for video: ${videoKey}`);
		return LOCAL_VIDEO_URLS[videoKey];
	}
	
	// Fallback to the local URL if key not found
	console.warn(`⚠️ Video key not found: ${videoKey}, falling back to local`);
	return LOCAL_VIDEO_URLS[videoKey] || `/assets/videos/${videoKey}.mp4`;
};

/**
 * Helper function to create video asset object for scenarios
 * This returns the video key, not the resolved URL, so URL resolution happens at runtime
 * @param {string} videoKey - The video identifier
 * @returns {string} The video key for runtime resolution
 */
export const createVideoAsset = (videoKey) => {
	return `VIDEO_KEY:${videoKey}`;
};

/**
 * Resolves a video asset at runtime
 * @param {string} videoAsset - The video asset (could be a URL or VIDEO_KEY:key format)
 * @returns {string} The resolved video URL
 */
export const resolveVideoAsset = (videoAsset) => {
	if (!videoAsset) return null;
	
	// If it's a VIDEO_KEY format, resolve it
	if (videoAsset.startsWith('VIDEO_KEY:')) {
		const videoKey = videoAsset.replace('VIDEO_KEY:', '');
		return getVideoUrl(videoKey);
	}
	
	// Otherwise, return as-is (backward compatibility)
	return videoAsset;
};

// Export video keys for easy reference
export const VIDEO_KEYS = {
	SCENARIO1_VIDEO1: 'scenario1-video1',
	SCENARIO1_VIDEO2: 'scenario1-video2',
	SCENARIO2_VIDEO1: 'scenario2-video1',
	SCENARIO2_VIDEO2: 'scenario2-video2',
	SCENARIO2_VIDEO3: 'scenario2-video3',
	SCENARIO4_VIDEO1: 'scenario4-video1',
	SCENARIO4_VIDEO2: 'scenario4-video2',
};