/**
 * FULL APPLICATION CACHE BUSTING UTILITY
 * 
 * Handles both ASSETS (images/videos) AND CODE (JS/CSS/HTML) cache busting
 * 
 * What gets cache busted:
 * 1. ASSETS: Images, videos get ?v=timestamp parameters
 * 2. CODE: React build files, service worker caches, browser caches
 * 3. DATA: localStorage, sessionStorage cleared
 * 4. FULL RELOAD: Forces page reload from server (not browser cache)
 * 
 * When to use:
 * - Deploy new images/videos → Users see fresh assets
 * - Deploy code changes (steps, text, logic) → Users see updated app
 * - Change scenarios.js → Users get new step definitions
 * - Update any React component → Users get new functionality
 * 
 * Usage:
 * - Admin clicks "Reset Menu" → Full cache bust + page reload
 * - Skips cloud URLs (they handle their own versioning)
 * - Auto-detects deployments (if REACT_APP_BUILD_TIME is set)
 */

class CacheBuster {
	constructor() {
		this.version = this.getOrCreateVersion();
		this.enabled = true;
	}

	// Get or create a cache version
	getOrCreateVersion() {
		const stored = localStorage.getItem('demo-cache-version');
		if (stored) {
			return stored;
		}
		
		// Create new version based on timestamp
		const newVersion = Date.now().toString();
		localStorage.setItem('demo-cache-version', newVersion);
		console.log('📅 Created new cache version:', newVersion);
		return newVersion;
	}

	// Force refresh the cache version
	refreshVersion() {
		const oldVersion = this.version;
		this.version = Date.now().toString();
		localStorage.setItem('demo-cache-version', this.version);
		console.log(`🔄 Cache version updated: ${oldVersion} → ${this.version}`);
		return this.version;
	}

	// Add cache buster parameter to URL
	addCacheBuster(url) {
		if (!this.enabled || !url) return url;

		// Don't cache bust external URLs (cloud storage handles its own versioning)
		if (url.includes('googleapis.com') || url.includes('storage.cloud.google.com')) {
			return url;
		}

		const separator = url.includes('?') ? '&' : '?';
		return `${url}${separator}v=${this.version}`;
	}

	// Clear all cached data and refresh version
	async fullCacheBust() {
		console.log('💥 Performing FULL application cache bust...');
		
		// 1. Clear localStorage cache data
		const keysToRemove = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && (key.startsWith('demo-') || key.startsWith('preload-'))) {
				keysToRemove.push(key);
			}
		}
		keysToRemove.forEach(key => localStorage.removeItem(key));
		console.log('🗑️ localStorage cleared');

		// 2. Clear sessionStorage
		sessionStorage.clear();
		console.log('🗑️ sessionStorage cleared');

		// 3. Refresh asset version
		this.refreshVersion();

		// 4. Clear any cached images in the preloader
		if (window.imagePreloader) {
			window.imagePreloader.clear();
		}

		// 5. Clear Service Worker cache (for React builds)
		if ('serviceWorker' in navigator && 'caches' in window) {
			try {
				const cacheNames = await caches.keys();
				await Promise.all(
					cacheNames.map(cacheName => {
						console.log('🗑️ Clearing cache:', cacheName);
						return caches.delete(cacheName);
					})
				);
				console.log('🗑️ Service Worker caches cleared');
			} catch (error) {
				console.warn('⚠️ Could not clear Service Worker caches:', error);
			}
		}

		// 6. Force reload from server (bypasses ALL browser caching)
		console.log('🔄 Forcing full page reload from server...');
		
		// Use location.reload(true) if available, otherwise use cache-busting reload
		if (typeof window.location.reload === 'function') {
			// Add cache bust parameter and reload
			const url = new URL(window.location.href);
			url.searchParams.set('cacheBust', Date.now().toString());
			window.location.href = url.toString();
		} else {
			// Fallback for older browsers
			window.location.reload(true);
		}

		return this.version;
	}

	// Enable/disable cache busting
	setEnabled(enabled) {
		this.enabled = enabled;
		console.log(`Cache busting ${enabled ? 'enabled' : 'disabled'}`);
	}

	// Get current version
	getVersion() {
		return this.version;
	}

	// Check if we need to update based on deployment timestamp
	checkDeploymentVersion() {
		// This could be enhanced to check a deployment version from the server
		// For now, we'll use the build timestamp if available
		if (process.env.REACT_APP_BUILD_TIME) {
			const buildTime = process.env.REACT_APP_BUILD_TIME;
			const storedBuildTime = localStorage.getItem('demo-build-time');
			
			if (storedBuildTime !== buildTime) {
				console.log(`🚀 New deployment detected: ${storedBuildTime} → ${buildTime}`);
				localStorage.setItem('demo-build-time', buildTime);
				this.refreshVersion();
				return true;
			}
		}
		return false;
	}
}

// Create singleton instance
const cacheBuster = new CacheBuster();

// Make it globally available for debugging
window.cacheBuster = cacheBuster;

export default cacheBuster;