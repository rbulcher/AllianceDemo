// Image preloader utility
import cacheBuster from './cacheBuster';

class ImagePreloader {
	constructor() {
		this.preloadedImages = new Map();
		this.preloadPromises = new Map();
	}

	// Preload a single image
	preloadImage(src) {
		// Add cache busting to the source URL
		const cacheBustedSrc = cacheBuster.addCacheBuster(src);
		
		if (this.preloadedImages.has(cacheBustedSrc)) {
			return Promise.resolve(); // Already preloaded
		}

		if (this.preloadPromises.has(cacheBustedSrc)) {
			return this.preloadPromises.get(cacheBustedSrc); // Already preloading
		}

		const promise = new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				this.preloadedImages.set(cacheBustedSrc, img);
				// Also store with original src for lookups
				this.preloadedImages.set(src, img);
				this.preloadPromises.delete(cacheBustedSrc);
				console.log(`✅ Preloaded: ${cacheBustedSrc}`);
				resolve(img);
			};
			img.onerror = () => {
				this.preloadPromises.delete(cacheBustedSrc);
				console.error(`❌ Failed to preload: ${cacheBustedSrc}`);
				reject(new Error(`Failed to preload image: ${cacheBustedSrc}`));
			};
			img.src = cacheBustedSrc;
		});

		this.preloadPromises.set(cacheBustedSrc, promise);
		return promise;
	}

	// Preload multiple images
	async preloadImages(imageSources) {
		console.log(`🚀 Starting preload of ${imageSources.length} images...`);
		const startTime = performance.now();
		
		try {
			await Promise.all(imageSources.map(src => this.preloadImage(src)));
			const endTime = performance.now();
			console.log(`✅ All images preloaded in ${Math.round(endTime - startTime)}ms`);
		} catch (error) {
			console.error('Some images failed to preload:', error);
		}
	}

	// Get all unique images from a scenario
	getScenarioImages(scenario) {
		const images = new Set();

		scenario.steps.forEach(step => {
			// Add screenshot assets
			if (step.screenAsset) {
				images.add(step.screenAsset);
			}

			// Add end frame assets
			if (step.endFrameAsset) {
				images.add(step.endFrameAsset);
			}

			// Add scrollable report images
			if (step.scrollableReport?.reportImage) {
				images.add(step.scrollableReport.reportImage);
			}

			// Add scroll complete screen assets
			if (step.scrollableReport?.scrollCompleteScreenAsset) {
				images.add(step.scrollableReport.scrollCompleteScreenAsset);
			}
		});

		// Add scenario-specific overlay images
		if (scenario.id === 'scenario6') {
			images.add('/assets/screenshots/scenario6/12.5.png'); // Step 14 overlay
		}

		if (scenario.id === 'scenario2') {
			images.add('/assets/screenshots/scenario2/12.5.png'); // Report overlay
		}

		return Array.from(images);
	}

	// Preload all images for a scenario
	async preloadScenario(scenario) {
		const images = this.getScenarioImages(scenario);
		await this.preloadImages(images);
	}

	// Preload all images for all scenarios plus background images
	async preloadAllScenarios(scenarios) {
		const allImages = new Set();

		// Add background images used across the app
		allImages.add('/assets/Background.png');
		allImages.add('/assets/scenarioBackground.png');
		allImages.add('/assets/Top_Bar.png');

		// Add all scenario images
		scenarios.forEach(scenario => {
			const scenarioImages = this.getScenarioImages(scenario);
			scenarioImages.forEach(img => allImages.add(img));
		});

		console.log(`🚀 Starting preload of ALL scenarios: ${allImages.size} total images...`);
		await this.preloadImages(Array.from(allImages));
	}

	// Check if image is preloaded
	isPreloaded(src) {
		return this.preloadedImages.has(src);
	}

	// Clear preloaded images (optional, for memory management)
	clear() {
		this.preloadedImages.clear();
		this.preloadPromises.clear();
		console.log('🗑️ Preloader cache cleared');
	}
}

// Create singleton instance
const imagePreloader = new ImagePreloader();

export default imagePreloader;