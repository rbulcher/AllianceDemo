// Audio feedback utility for iOS PWA
// Creates subtle sound effects since iOS Safari doesn't support vibration API

class AudioFeedback {
	constructor() {
		this.audioContext = null;
		this.initialized = false;
	}

	// Initialize audio context (must be called after user interaction)
	async init() {
		if (this.initialized) return;

		try {
			// Create audio context
			this.audioContext = new (window.AudioContext ||
				window.webkitAudioContext)();
			this.initialized = true;
			console.log("Audio feedback initialized");
		} catch (error) {
			console.warn("Audio feedback initialization failed:", error);
		}
	}

	// Play a subtle click sound
	playClick() {
		if (!this.initialized || !this.audioContext) {
			console.warn("Audio feedback not initialized");
			return;
		}

		try {
			// Resume audio context if suspended
			if (this.audioContext.state === "suspended") {
				this.audioContext.resume();
			}

			const oscillator = this.audioContext.createOscillator();
			const gainNode = this.audioContext.createGain();
			const now = this.audioContext.currentTime;

			oscillator.connect(gainNode);
			gainNode.connect(this.audioContext.destination);

			// --- Configuration for a soft, clean tap ---

			oscillator.type = "sine";

			// 1. Raised the pitch slightly for a lighter feel.
			oscillator.frequency.setValueAtTime(160, now); // Was 130
			oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1); // Was 70

			// 2. Shortened the decay for a tighter, "snappier" sound.
			gainNode.gain.setValueAtTime(0, now);
			gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01); // Slightly louder gain
			gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08); // Was 0.1

			// --- Play and Stop ---
			oscillator.start(now);
			oscillator.stop(now + 0.15);
		} catch (error) {
			console.warn("Failed to play click sound:", error);
		}
	}

	// Play the same vibraty sound for all interactions
	playTap() {
		// Just call playClick() to use the same sound everywhere
		this.playClick();
	}
}

// Create singleton instance
const audioFeedback = new AudioFeedback();

export default audioFeedback;
