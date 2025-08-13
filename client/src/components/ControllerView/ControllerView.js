import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../../hooks/useSocket";
import { getScenario, getAllScenarios } from "../../data/scenarios";
import { resolveVideoAsset } from "../../utils/videoUtils";
import audioFeedback from "../../utils/audioFeedback";
import imagePreloader from "../../utils/imagePreloader";
import cacheBuster from "../../utils/cacheBuster";
import "./ControllerView.css";

const ControllerView = () => {
	// 🎯 DEBUG TOOL TOGGLE - Set to true to enable coordinate debugging
	const ENABLE_DEBUG_TOOL = true;

	const {
		demoState,
		nextStep,
		startScenario,
		adminReset,
		isConnected,
		playVideo,
	} = useSocket("controller");

	const [currentScenario, setCurrentScenario] = useState(null);
	const [currentStep, setCurrentStep] = useState(null);
	const [adminClickCount, setAdminClickCount] = useState(0);
	const [showAdminFeedback, setShowAdminFeedback] = useState(false);
	const [buttonFeedback, setButtonFeedback] = useState({});
	const [showZones, setShowZones] = useState(true);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [showPreVideoButton, setShowPreVideoButton] = useState(false);
	const [showPostVideoButton, setShowPostVideoButton] = useState(false);
	const [showNonVideoButton, setShowNonVideoButton] = useState(false);
	const [completedScenarios, setCompletedScenarios] = useState(new Set());
	const [videoManuallyStarted, setVideoManuallyStarted] = useState(false);
	const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
	const [showMouseCoords, setShowMouseCoords] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });
	const [selectionRect, setSelectionRect] = useState(null);
	const [scrollableReportState, setScrollableReportState] = useState({
		scrollPosition: 0,
		isDragging: false,
		dragStartY: 0,
		scrollProgress: 0,
		isScrollComplete: false,
	});
	const [scenario6Step14State, setScenario6Step14State] = useState({
		showSecondImage: false,
		startAnimation: false,
	});
	const [isPreloading, setIsPreloading] = useState(false);
	const [preloadComplete, setPreloadComplete] = useState(false);
	const pulseTimerRef = useRef(null);
	const phoneScreenRef = useRef(null);
	const continueButtonTriggeredRef = useRef(false);
	const videoHasStartedRef = useRef(false);
	const continueButtonTimerRef = useRef(null);
	const reportImageRef = useRef(null);

	// Initialize cache busting on component mount
	useEffect(() => {
		// Check for new deployment version on app start
		const newDeployment = cacheBuster.checkDeploymentVersion();
		if (newDeployment) {
			console.log("🚀 New deployment detected, cache bust applied");
		}
	}, []);

	// Use button positions and sizes directly from scenarios without scaling
	const getButtonProps = (interaction) => {
		return {
			left: `${interaction.position.x}px`,
			top: `${interaction.position.y}px`,
			width: `${interaction.size.width}px`,
			height: `${interaction.size.height}px`,
		};
	};

	// Scrollable Report Event Handlers
	const handleReportScrollStart = (clientY) => {
		setScrollableReportState((prev) => ({
			...prev,
			isDragging: true,
			dragStartY: clientY,
		}));
	};

	const handleReportScrollMove = (clientY) => {
		if (
			!scrollableReportState.isDragging ||
			!reportImageRef.current ||
			!currentStep?.scrollableReport
		)
			return;

		const deltaY = scrollableReportState.dragStartY - clientY;
		const newScrollPosition = Math.max(
			0,
			Math.min(
				scrollableReportState.scrollPosition + deltaY,
				getMaxScrollPosition()
			)
		);

		const scrollProgress =
			getMaxScrollPosition() > 0
				? newScrollPosition / getMaxScrollPosition()
				: 0;
		const isScrollComplete =
			scrollProgress >=
			(currentStep.scrollableReport.scrollCompleteThreshold || 0.8);

		setScrollableReportState((prev) => ({
			...prev,
			scrollPosition: newScrollPosition,
			dragStartY: clientY,
			scrollProgress,
			isScrollComplete,
		}));
	};

	// Get the appropriate screen asset based on scroll progress
	const getScreenAsset = () => {
		// Custom logic for scenario6 step14 - always show base image 12.png
		// The 12.5.png overlay will be handled separately for animation
		if (
			currentStep.id === "step14" &&
			currentStep.screenAsset === "/assets/screenshots/scenario6/12.png"
		) {
			return "/assets/screenshots/scenario6/12.png";
		}

		if (
			currentStep.id === "step14" &&
			currentStep.screenAsset === "/assets/screenshots/scenario2/12.png"
		) {
			// For step14, swap to 12.5.png when scroll reaches the bottom (>=80%)
			if (scrollableReportState.scrollProgress >= 0.8) {
				return "/assets/screenshots/scenario2/12.5.png";
			}
		}

		// Handle scrollCompleteScreenAsset for any step that has it
		if (
			currentStep.scrollableReport?.scrollCompleteScreenAsset &&
			scrollableReportState.isScrollComplete
		) {
			return currentStep.scrollableReport.scrollCompleteScreenAsset;
		}

		return currentStep.screenAsset;
	};

	const handleReportScrollEnd = () => {
		setScrollableReportState((prev) => ({
			...prev,
			isDragging: false,
		}));
	};

	const getMaxScrollPosition = () => {
		if (!reportImageRef.current || !currentStep?.scrollableReport) return 0;

		// Get the actual rendered dimensions of the image element
		const imgElement = reportImageRef.current;
		const actualRenderedHeight =
			imgElement.offsetHeight || imgElement.clientHeight;
		const containerHeight = currentStep.scrollableReport.viewportBounds.height;

		console.log(
			"Scroll calc - Rendered height:",
			actualRenderedHeight,
			"Container height:",
			containerHeight,
			"Max scroll:",
			Math.max(0, actualRenderedHeight - containerHeight)
		);

		return Math.max(0, actualRenderedHeight - containerHeight);
	};

	// Mouse events for scrollable report
	const handleReportMouseDown = (e) => {
		e.preventDefault();
		handleReportScrollStart(e.clientY);
	};

	const handleReportMouseMove = (e) => {
		if (scrollableReportState.isDragging) {
			e.preventDefault();
			handleReportScrollMove(e.clientY);
		}
	};

	const handleReportMouseUp = (e) => {
		if (scrollableReportState.isDragging) {
			e.preventDefault();
			handleReportScrollEnd();
		}
	};

	// Touch events for scrollable report
	const handleReportTouchStart = (e) => {
		e.preventDefault();
		const touch = e.touches[0];
		handleReportScrollStart(touch.clientY);
	};

	const handleReportTouchMove = (e) => {
		if (scrollableReportState.isDragging && e.touches.length === 1) {
			e.preventDefault();
			const touch = e.touches[0];
			handleReportScrollMove(touch.clientY);
		}
	};

	const handleReportTouchEnd = (e) => {
		if (scrollableReportState.isDragging) {
			e.preventDefault();
			handleReportScrollEnd();
		}
	};

	// Preload images when scenario starts
	useEffect(() => {
		if (demoState.currentScenario) {
			const scenario = getScenario(demoState.currentScenario);
			setCurrentScenario(scenario);

			// Start preloading all scenario images immediately
			if (scenario && !preloadComplete) {
				console.log(`🎬 Starting preload for ${scenario.title}`);
				setIsPreloading(true);
				setPreloadComplete(false);

				imagePreloader
					.preloadScenario(scenario)
					.then(() => {
						console.log(`✅ Preload complete for ${scenario.title}`);
						setPreloadComplete(true);
						setIsPreloading(false);
					})
					.catch((error) => {
						console.error(`❌ Preload failed for ${scenario.title}:`, error);
						setPreloadComplete(true); // Continue anyway
						setIsPreloading(false);
					});
			}

			if (scenario && scenario.steps && scenario.steps.length > 0) {
				const stepIndex = Math.min(
					demoState.currentStep || 0,
					scenario.steps.length - 1
				);
				const step = scenario.steps[stepIndex];
				if (step) {
					setCurrentStep(step);
					// Don't show zones immediately - wait for image to load
					setShowZones(false);
					// Show mouse coordinates for image mapper steps (only if debug tool is enabled)
					setShowMouseCoords(
						(step.useImageMapper || false) && ENABLE_DEBUG_TOOL
					);
					// Reset continue button trigger flag for new step
					continueButtonTriggeredRef.current = false;
					// Only reset video started flag if we're actually changing steps
					if (step.id !== currentStep?.id) {
						console.log("🆕 NEW STEP - Resetting video flag for:", step.id);
						videoHasStartedRef.current = false;
						setVideoManuallyStarted(false); // Reset manual video start flag

						// Reset scenario6 step14 state for new step
						setScenario6Step14State({
							showSecondImage: false,
							startAnimation: false,
						});

						// Custom logic for scenario6 step14 - trigger image transition with immediate timing
						if (
							step.id === "step14" &&
							step.screenAsset === "/assets/screenshots/scenario6/12.png"
						) {
							// Start animation immediately - no delay to see base chart
							setTimeout(() => {
								// First show the overlay image (but still hidden with CSS)
								setScenario6Step14State({
									showSecondImage: true,
									startAnimation: false,
								});

								// Then trigger the animation immediately
								setTimeout(() => {
									setScenario6Step14State({
										showSecondImage: true,
										startAnimation: true,
									});
								}, 50); // Minimal delay just for state update
							}, 200); // Brief delay to ensure base image is loaded

							// Hardcoded auto-advance for scenario6 step14 only - advance faster after animation
							setTimeout(() => {
								if (
									currentScenario?.id === "scenario6" &&
									step.id === "step14"
								) {
									console.log(
										"🚀 Scenario6 Step14: Auto-advancing to step15 after animation"
									);
									handleInteraction({
										id: "auto-advance-step14",
										action: "next-step",
									});
								}
							}, 4000); // 4 seconds total wait time (much faster)
						}

						// Reset scrollable report state for new step
						setScrollableReportState({
							scrollPosition: 0,
							isDragging: false,
							dragStartY: 0,
							scrollProgress: 0,
							isScrollComplete: false,
						});
						// Only reset imageLoaded for steps that actually have images
						if (step.screenAsset) {
							// If image is already preloaded, mark as loaded immediately
							if (
								preloadComplete &&
								imagePreloader.isPreloaded(step.screenAsset)
							) {
								console.log(
									"Image already preloaded, marking as loaded:",
									step.id
								);
								setImageLoaded(true);
							} else {
								setImageLoaded(false); // Reset image loaded state for new step
							}
						}
					}

					// For controller-message steps, manage button states
					if (step.type === "controller-message") {
						// Only reset buttons if this is actually a new step, not just a video-end update
						if (step.id !== currentStep?.id) {
							// This is truly a new step - hide all buttons and reset
							console.log(
								"🔴 HIDING all continue buttons for new step transition"
							);
							setShowPreVideoButton(false);
							setShowPostVideoButton(false);
							setShowNonVideoButton(false);
							continueButtonTriggeredRef.current = false;
						} else {
							// Same step, might be video-end update - preserve button states
							console.log(
								"📹 Same step update - preserving continue button states"
							);
						}
						// Don't reset videoHasStartedRef here - let it persist for video end detection
					} else {
						// Reset all buttons for non-controller-message steps
						console.log(
							"🔄 Resetting all continue buttons for non-controller-message step"
						);
						setShowPreVideoButton(false);
						setShowPostVideoButton(false);
						setShowNonVideoButton(false);
						continueButtonTriggeredRef.current = false;
					}
				}
			}
		}
	}, [demoState]);

	// Track when video starts playing (for manual and auto video start)
	useEffect(() => {
		if (
			demoState.isVideoPlaying &&
			currentStep?.videoAsset &&
			!videoHasStartedRef.current
		) {
			console.log("🎥 VIDEO STARTED - Setting flag for step:", currentStep.id);
			videoHasStartedRef.current = true;
		}
		// Don't reset the flag when video stops - we need it for continue button logic
	}, [demoState.isVideoPlaying, currentStep]);

	// Global event listeners for scrollable report dragging
	useEffect(() => {
		if (scrollableReportState.isDragging) {
			document.addEventListener("mousemove", handleReportMouseMove);
			document.addEventListener("mouseup", handleReportMouseUp);
			document.addEventListener("touchmove", handleReportTouchMove, {
				passive: false,
			});
			document.addEventListener("touchend", handleReportTouchEnd);

			return () => {
				document.removeEventListener("mousemove", handleReportMouseMove);
				document.removeEventListener("mouseup", handleReportMouseUp);
				document.removeEventListener("touchmove", handleReportTouchMove);
				document.removeEventListener("touchend", handleReportTouchEnd);
			};
		}
	}, [scrollableReportState.isDragging]);

	// Show POST-VIDEO Continue button after video ends
	useEffect(() => {
		const isVideoActuallyEnded =
			!demoState.isVideoPlaying &&
			currentStep?.videoAsset &&
			videoHasStartedRef.current &&
			videoManuallyStarted;

		console.log("🔍 POST-VIDEO Continue button logic:", {
			stepId: currentStep?.id,
			isVideoActuallyEnded,
			videoHasStarted: videoHasStartedRef.current,
			videoManuallyStarted,
			isVideoPlaying: demoState.isVideoPlaying,
			showPostVideoButton,
			continueButtonTriggered: continueButtonTriggeredRef.current,
		});

		if (
			currentStep &&
			currentStep.type === "controller-message" &&
			currentStep.videoAsset &&
			isVideoActuallyEnded &&
			demoState.currentScenario &&
			!showPostVideoButton
		) {
			console.log("✅ POST-VIDEO - Showing Continue button after delay");

			setTimeout(() => {
				console.log("🎬 POST-VIDEO CONTINUE BUTTON ANIMATION STARTED");
				setShowPostVideoButton(true);
			}, 1000);
		}
	}, [
		demoState.isVideoPlaying,
		currentStep,
		demoState.currentScenario,
		videoManuallyStarted,
	]);

	// Show NON-VIDEO Continue button for non-video controller-message steps
	useEffect(() => {
		if (
			currentStep &&
			currentStep.type === "controller-message" &&
			!currentStep.videoAsset &&
			!currentStep.autoAdvanceDelay &&
			demoState.currentScenario &&
			!showNonVideoButton &&
			!continueButtonTriggeredRef.current
		) {
			console.log("✅ NON-VIDEO - Showing Continue button after delay");
			continueButtonTriggeredRef.current = true;

			const timer = setTimeout(() => {
				if (currentStep && !currentStep.videoAsset && !showNonVideoButton) {
					console.log("🎬 NON-VIDEO CONTINUE BUTTON ANIMATION STARTED");
					setShowNonVideoButton(true);
				}
			}, 500);

			return () => clearTimeout(timer);
		}
	}, [currentStep, demoState.currentScenario]);

	// Show PRE-VIDEO "Continue on TV" button for video steps that haven't started
	useEffect(() => {
		console.log("📺 PRE-VIDEO 'Continue on TV' button logic:", {
			stepId: currentStep?.id,
			hasVideoAsset: !!currentStep?.videoAsset,
			videoManuallyStarted,
			isVideoPlaying: demoState.isVideoPlaying,
			videoHasStarted: videoHasStartedRef.current,
			showPreVideoButton,
			continueButtonTriggered: continueButtonTriggeredRef.current,
		});

		if (
			currentStep &&
			currentStep.type === "controller-message" &&
			currentStep.videoAsset &&
			!videoManuallyStarted &&
			!demoState.isVideoPlaying &&
			!videoHasStartedRef.current &&
			demoState.currentScenario &&
			!showPreVideoButton &&
			!continueButtonTriggeredRef.current
		) {
			console.log("✅ PRE-VIDEO - Showing 'Continue on TV' button");
			continueButtonTriggeredRef.current = true;

			const timer = setTimeout(() => {
				if (
					currentStep &&
					currentStep.videoAsset &&
					!videoManuallyStarted &&
					!demoState.isVideoPlaying &&
					!videoHasStartedRef.current &&
					!showPreVideoButton
				) {
					console.log("🎬 PRE-VIDEO 'Continue on TV' BUTTON ANIMATION STARTED");
					setShowPreVideoButton(true);
				}
			}, 500);

			return () => clearTimeout(timer);
		}
	}, [
		currentStep,
		demoState.currentScenario,
		videoManuallyStarted,
		demoState.isVideoPlaying,
	]);

	// Auto-advance for controller-message steps with autoAdvanceDelay
	useEffect(() => {
		if (
			currentStep &&
			currentStep.type === "controller-message" &&
			currentStep.autoAdvanceDelay &&
			!currentStep.videoAsset &&
			demoState.currentScenario
		) {
			// Auto advance after specified delay
			const timer = setTimeout(() => {
				handleInteraction({ id: "auto-advance", action: "next-step" });
			}, currentStep.autoAdvanceDelay);

			return () => clearTimeout(timer);
		}
	}, [currentStep, demoState.currentScenario]);

	// Show interaction zones based on image load status and preload status
	useEffect(() => {
		const shouldShowZones =
			currentStep?.useImageMapper &&
			(imageLoaded ||
				(preloadComplete &&
					imagePreloader.isPreloaded(currentStep?.screenAsset)));

		if (shouldShowZones) {
			console.log("Showing interaction zones for:", currentStep.id, {
				imageLoaded,
				preloadComplete,
				isPreloaded: imagePreloader.isPreloaded(currentStep?.screenAsset),
			});
			setShowZones(true);
		} else if (!currentStep?.useImageMapper) {
			setShowZones(false);
		} else {
			setShowZones(false);
		}
	}, [imageLoaded, currentStep, preloadComplete]);

	// Debug: Track showZones changes
	useEffect(() => {
		console.log("showZones changed to:", showZones);
	}, [showZones]);

	// Mouse coordinate tracking for debugging image mapper positions
	const handleMouseMove = (e) => {
		if (!showMouseCoords) return;

		// Get the image element
		const img = e.currentTarget.querySelector("img");
		if (!img) return;

		// Get the bounding rect of the image
		const rect = img.getBoundingClientRect();

		// Calculate coordinates relative to the image
		const x = Math.round(e.clientX - rect.left);
		const y = Math.round(e.clientY - rect.top);

		// Calculate scaled coordinates for scenarios.js (laptop: scale to 1400x810, phone: scale to 400x800)
		const isLaptop = currentStep?.layoutType === "laptop";
		const scaleX = isLaptop ? (x / rect.width) * 1400 : (x / rect.width) * 400;
		const scaleY = isLaptop ? (y / rect.height) * 810 : (y / rect.height) * 800;

		setMouseCoords({
			x,
			y,
			scaledX: Math.round(scaleX),
			scaledY: Math.round(scaleY),
			actualWidth: Math.round(rect.width),
			actualHeight: Math.round(rect.height),
		});

		// Update drag end position if dragging
		if (isDragging) {
			setDragEnd({ x, y });

			// Calculate selection rectangle
			const startX = Math.min(dragStart.x, x);
			const startY = Math.min(dragStart.y, y);
			const width = Math.abs(x - dragStart.x);
			const height = Math.abs(y - dragStart.y);

			// Calculate scaled selection rectangle for scenarios.js
			const scaledStartX = isLaptop
				? (startX / rect.width) * 1400
				: (startX / rect.width) * 400;
			const scaledStartY = isLaptop
				? (startY / rect.height) * 810
				: (startY / rect.height) * 800;
			const scaledWidth = isLaptop
				? (width / rect.width) * 1400
				: (width / rect.width) * 400;
			const scaledHeight = isLaptop
				? (height / rect.height) * 810
				: (height / rect.height) * 800;

			setSelectionRect({
				x: startX,
				y: startY,
				width,
				height,
				scaledX: Math.round(scaledStartX),
				scaledY: Math.round(scaledStartY),
				scaledWidth: Math.round(scaledWidth),
				scaledHeight: Math.round(scaledHeight),
			});
		}
	};

	const handleMouseDown = (e) => {
		if (!showMouseCoords) return;

		// Get the image element
		const img = e.currentTarget.querySelector("img");
		if (!img) return;

		// Get the bounding rect of the image
		const rect = img.getBoundingClientRect();

		// Calculate coordinates relative to the image
		const x = Math.round(e.clientX - rect.left);
		const y = Math.round(e.clientY - rect.top);

		setIsDragging(true);
		setDragStart({ x, y });
		setDragEnd({ x, y });
		setSelectionRect(null);

		// Prevent default to avoid text selection
		e.preventDefault();
	};

	const handleMouseUp = (e) => {
		if (!showMouseCoords || !isDragging) return;

		setIsDragging(false);

		// Final selection rectangle is already set in handleMouseMove
		console.log("🎯 Selection Rectangle:", selectionRect);
	};

	// Copy to clipboard functions
	const copyToClipboard = async (text) => {
		try {
			await navigator.clipboard.writeText(text);
			console.log("Copied to clipboard:", text);
		} catch (err) {
			console.error("Failed to copy to clipboard:", err);
		}
	};

	const copyPosition = () => {
		if (selectionRect) {
			const positionText = `{ x: ${selectionRect.scaledX}, y: ${selectionRect.scaledY} }`;
			copyToClipboard(positionText);
		}
	};

	const copySize = () => {
		if (selectionRect) {
			const sizeText = `{ width: ${selectionRect.scaledWidth}, height: ${selectionRect.scaledHeight} }`;
			copyToClipboard(sizeText);
		}
	};

	const copyBoth = () => {
		if (selectionRect) {
			const bothText = `position: { x: ${selectionRect.scaledX}, y: ${selectionRect.scaledY} },\nsize: { width: ${selectionRect.scaledWidth}, height: ${selectionRect.scaledHeight} },`;
			copyToClipboard(bothText);
		}
	};

	const handleInteraction = async (interaction, e) => {
		if (!currentStep || !currentScenario) return;

		// Stop event propagation to prevent page click handler
		e?.stopPropagation();

		// Handle video start action
		if (interaction.action === "start-video") {
			console.log("🎬 Starting video manually - hiding pre-video button");
			setVideoManuallyStarted(true);
			setShowPreVideoButton(false);
			continueButtonTriggeredRef.current = false;

			const resolvedVideoUrl = resolveVideoAsset(currentStep.videoAsset);
			console.log("🎬 Calling playVideo with:", {
				videoId: resolvedVideoUrl,
				step: demoState.currentStep,
				stepId: currentStep.id,
			});

			playVideo({
				videoId: resolvedVideoUrl,
				step: demoState.currentStep,
				stepId: currentStep.id,
			});

			// Initialize audio feedback if needed and play tap sound
			await audioFeedback.init();
			audioFeedback.playTap();
			return;
		}

		console.log(
			"Handle interaction:",
			interaction,
			"Current step:",
			demoState.currentStep,
			"Total steps:",
			currentScenario.totalSteps
		);

		// Initialize audio feedback if needed and play tap sound
		await audioFeedback.init();
		audioFeedback.playTap();
		console.log("Playing tap sound for interaction");

		// Show button feedback
		setButtonFeedback((prev) => ({
			...prev,
			[interaction.id]: true,
		}));

		// Clear button feedback after 1 second
		setTimeout(() => {
			setButtonFeedback((prev) => ({
				...prev,
				[interaction.id]: false,
			}));
		}, 1000);

		// Handle completion step special actions
		if (currentStep.type === "completion") {
			console.log("Completion step detected, going back to scenarios");
			if (
				interaction.action === "select-scenario" ||
				interaction.action === "restart-scenario"
			) {
				handleBackToScenarios(true);
				return;
			}
		}

		// Check if current step has no next step (end of scenario)
		if (!currentStep.nextStep) {
			console.log(
				"No next step defined, going back to scenarios - COMPLETION PATH"
			);
			handleBackToScenarios(true);
			return;
		}

		// Check if we're at the last step
		if (demoState.currentStep >= currentScenario.totalSteps - 1) {
			console.log("At last step, going back to scenarios - COMPLETION PATH");
			// This is the last step, go back to scenario selector
			handleBackToScenarios(true);
			return;
		}

		const nextStepIndex = demoState.currentStep + 1;
		const nextStepData = currentScenario.steps[nextStepIndex];

		const stepData = {
			stepNumber: nextStepIndex,
			stepId: currentStep.id,
			interaction: interaction,
		};

		console.log("Sending nextStep with data:", stepData);
		console.log("Next step data:", nextStepData);

		nextStep(stepData);
	};

	const handleScenarioSelect = async (scenarioId, e) => {
		// Stop event propagation to prevent double-firing
		e?.stopPropagation();

		// Initialize audio feedback on first user interaction (required for iOS)
		await audioFeedback.init();

		// Play click sound instead of haptic feedback
		audioFeedback.playClick();
		console.log("Playing click sound for scenario selection");

		// Start all scenarios normally - let DisplayView handle video timing
		startScenario(scenarioId);
	};

	const handleBackToScenarios = async (scenarioCompleted = false) => {
		// Play tap sound for back navigation
		await audioFeedback.init();
		audioFeedback.playTap();

		// Clear preloader cache when going back to scenarios
		imagePreloader.clear();
		setIsPreloading(false);
		setPreloadComplete(false);

		// Mark scenario as completed if it finished successfully
		if (scenarioCompleted && currentScenario) {
			console.log("Marking scenario as completed:", currentScenario.id);
			setCompletedScenarios((prev) => {
				const newCompleted = new Set(prev);
				newCompleted.add(currentScenario.id);
				console.log("Updated completed scenarios:", Array.from(newCompleted));

				// Auto-reset if all 5 scenarios are complete
				if (newCompleted.size >= 5) {
					console.log("All scenarios complete, resetting");
					return new Set(); // Reset all completions
				}

				return newCompleted;
			});
		} else {
			console.log(
				"Not marking as completed - scenarioCompleted:",
				scenarioCompleted,
				"currentScenario:",
				currentScenario?.id
			);
		}

		// Reset the demo state via socket
		adminReset();
		// Reset local state to show scenario selector
		setCurrentScenario(null);
		setCurrentStep(null);
		setAdminClickCount(0);
		setShowAdminFeedback(false);
	};

	const handleResetMenu = async () => {
		// Play tap sound for reset
		await audioFeedback.init();
		audioFeedback.playTap();

		console.log(
			"🔄 Reset Menu: Performing FULL cache bust (including code)..."
		);

		// Perform full cache bust - this will reload the page
		await cacheBuster.fullCacheBust();

		// Note: Code below won't execute because fullCacheBust() reloads the page
		// But keeping it for safety in case reload fails
		imagePreloader.clear();
		setCompletedScenarios(new Set());
		setIsPreloading(false);
		setPreloadComplete(false);
		adminReset();
		setCurrentScenario(null);
		setCurrentStep(null);
		setAdminClickCount(0);
		setShowAdminFeedback(false);
	};

	const handleAdminClick = () => {
		const newCount = adminClickCount + 1;
		setAdminClickCount(newCount);

		// Show temporary feedback
		setShowAdminFeedback(true);
		setTimeout(() => {
			setShowAdminFeedback(false);
		}, 1000);

		if (newCount >= 5) {
			// Navigate to admin panel
			window.location.href = "/admin";
		}
	};

	if (!isConnected) {
		return (
			<div className="controller-view connecting">
				<div className="connection-message">
					<h2>Connecting to Demo System...</h2>
					<div className="spinner"></div>
				</div>
			</div>
		);
	}

	if (!currentScenario) {
		// Show scenario selector directly in the controller view
		const scenarios = getAllScenarios();

		return (
			<div className="controller-view scenario-selector">
				<div className="header" style={{ marginTop: "60px" }}>
					<h1>Explore Insights to make your laundromat easier</h1>

					{/* Reset Menu Button - Admin only */}
					<button
						className="reset-menu-button"
						onClick={handleResetMenu}
						title="Admin: Reset menu and clear all caches"
					>
						Reset Menu
					</button>
				</div>

				<div className="scenarios-grid">
					{scenarios.map((scenario) => {
						const isCompleted = completedScenarios.has(scenario.id);
						return (
							<div
								key={scenario.id}
								className={`scenario-card ${isCompleted ? "completed" : ""}`}
							>
								<div className="scenario-header">
									<h3>{scenario.title}</h3>
								</div>
								<button
									className={`start-button ${isCompleted ? "completed" : ""}`}
									disabled={isCompleted}
									onClick={(e) =>
										!isCompleted && handleScenarioSelect(scenario.id, e)
									}
								>
									{isCompleted ? "Completed" : "Explore"}
								</button>
							</div>
						);
					})}
				</div>

				{/* Hidden admin button */}
				<button
					className={`admin-secret-button ${
						showAdminFeedback ? "feedback" : ""
					}`}
					onClick={handleAdminClick}
					aria-label="Admin access"
				></button>
			</div>
		);
	}

	// For scenario1 step10 video, show the same step11-style layout during video playback
	if (
		demoState.isVideoPlaying &&
		currentStep?.type === "video" &&
		currentScenario?.id === "scenario1" &&
		currentStep?.id === "step10"
	) {
		return (
			<div
				className="controller-view"
				style={{
					backgroundImage: "url(/assets/Background.png)",
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
				}}
			>
				<div className="controller-main">
					<div className="controller-header">
						<h2>{currentScenario.title}</h2>
						<div className="progress">
							Step {demoState.currentStep + 1} of {currentScenario.totalSteps}
						</div>
					</div>

					<div className="step-content-container">
						<div className="step-content">
							<div className="controller-message-step relative-wrapper">
								<div className="step-header">
									<div className="highlight-text">{currentStep.title}</div>
									<div className="secondary-text">
										{currentStep.description}
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="controller-footer">
						<button className="back-button" onClick={handleBackToScenarios}>
							Back to Scenarios
						</button>
					</div>

					<button
						className="admin-reset-button"
						onClick={handleBackToScenarios}
						aria-label="Admin reset"
					></button>
				</div>
			</div>
		);
	}

	// Default video playing screen for other scenarios
	if (demoState.isVideoPlaying && currentStep?.type === "video") {
		return (
			<div className="controller-view video-playing">
				<div className="video-status">
					<h2>Video Playing</h2>
					<p>Please watch the main display</p>
					<div className="video-spinner"></div>
				</div>

				{/* Hidden admin reset button */}
				<button
					className="admin-reset-button"
					onClick={adminReset}
					aria-label="Admin reset"
				></button>
			</div>
		);
	}

	return (
		<div
			className="controller-view"
			style={{
				backgroundImage: "url(/assets/Background.png)",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			{/* Mouse Coordinate Debug Display */}
			{showMouseCoords && (
				<div className="mouse-coords-debug">
					<div className="coords-display">
						Raw: X: {mouseCoords.x}, Y: {mouseCoords.y}
					</div>
					<div className="coords-display">
						Scaled: X: {mouseCoords.scaledX}, Y: {mouseCoords.scaledY}
					</div>
					<div
						className="coords-display"
						style={{ fontSize: "0.8rem", opacity: 0.7 }}
					>
						Image: {mouseCoords.actualWidth} × {mouseCoords.actualHeight}
					</div>
					{selectionRect && (
						<div className="selection-display">
							<div className="selection-title">🎯 Selection Rectangle:</div>
							<div className="selection-data">
								Raw position:{" "}
								{`{ x: ${selectionRect.x}, y: ${selectionRect.y} }`}
							</div>
							<div className="selection-data">
								Raw size:{" "}
								{`{ width: ${selectionRect.width}, height: ${selectionRect.height} }`}
							</div>
							<div
								className="selection-data"
								style={{
									backgroundColor: "rgba(0, 255, 255, 0.1)",
									borderLeft: "3px solid #00ffff",
								}}
							>
								Scaled position:{" "}
								{`{ x: ${selectionRect.scaledX}, y: ${selectionRect.scaledY} }`}
								<button
									onClick={copyPosition}
									style={{
										marginLeft: "10px",
										padding: "2px 6px",
										fontSize: "0.7rem",
										backgroundColor: "#00ffff",
										color: "#000",
										border: "none",
										borderRadius: "3px",
										cursor: "pointer",
									}}
								>
									Copy
								</button>
							</div>
							<div
								className="selection-data"
								style={{
									backgroundColor: "rgba(0, 255, 255, 0.1)",
									borderLeft: "3px solid #00ffff",
								}}
							>
								Scaled size:{" "}
								{`{ width: ${selectionRect.scaledWidth}, height: ${selectionRect.scaledHeight} }`}
								<button
									onClick={copySize}
									style={{
										marginLeft: "10px",
										padding: "2px 6px",
										fontSize: "0.7rem",
										backgroundColor: "#00ffff",
										color: "#000",
										border: "none",
										borderRadius: "3px",
										cursor: "pointer",
									}}
								>
									Copy
								</button>
							</div>
							<div style={{ marginTop: "10px", textAlign: "center" }}>
								<button
									onClick={copyBoth}
									style={{
										padding: "4px 12px",
										fontSize: "0.8rem",
										backgroundColor: "#00ff00",
										color: "#000",
										border: "none",
										borderRadius: "5px",
										cursor: "pointer",
										fontWeight: "bold",
									}}
								>
									Copy Both for scenarios.js
								</button>
							</div>
						</div>
					)}
					<div className="coords-help">
						{isDragging
							? "Drag to select area..."
							: "Click and drag to select interaction area"}
					</div>
					<div
						className="coords-help"
						style={{ color: "#00ffff", marginTop: "0.5rem" }}
					>
						Use SCALED values in scenarios.js
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="controller-main">
				<div className="controller-header">
					<h2>{currentScenario.title}</h2>
					<div className="progress">
						Step {demoState.currentStep + 1} of {currentScenario.totalSteps}
					</div>
				</div>

				<div className="step-content-container">
					{currentStep ? (
						<div className="step-content">
							{/* Controller Message Step */}
							{currentStep.type === "controller-message" && (
								<div
									className={`controller-message-step relative-wrapper ${
										currentStep.layoutType === "laptop" ? "laptop-layout" : ""
									}`}
								>
									{currentStep.screenAsset ? (
										currentStep.layoutType === "laptop" ? (
											// Laptop layout for controller-message with screenAsset
											<div className="laptop-interaction-layout">
												<div className="laptop-interaction-header">
													<div className="step-header">
														<h2>{currentStep.title}</h2>
														<p className="step-description">
															{currentStep.description}
														</p>
													</div>
												</div>
												<div className="laptop-screenshot-section">
													<div
														className="laptop-screenshot-container"
														style={{ position: "relative" }}
													>
														<img
															src={cacheBuster.addCacheBuster(getScreenAsset())}
															alt={currentStep.title}
															className={imageLoaded ? "loaded" : ""}
															onLoad={() => setImageLoaded(true)}
															onError={() => setImageLoaded(true)}
															style={{
																position: "absolute",
																top: 0,
																left: 0,
																width: "100%",
																height: "100%",
																objectFit: "contain",
																display: "block",
															}}
														/>

														{/* Scenario6 Step14 Overlay Image - shows bar graph growth animation */}
														{currentStep.id === "step14" &&
															currentStep.screenAsset ===
																"/assets/screenshots/scenario6/12.png" &&
															scenario6Step14State.showSecondImage && (
																<img
																	src={cacheBuster.addCacheBuster(
																		"/assets/screenshots/scenario6/12.5.png"
																	)}
																	alt="Updated bar graph with growth"
																	className={`scenario6-step14-overlay ${
																		scenario6Step14State.startAnimation
																			? "reveal-up"
																			: ""
																	}`}
																	style={{
																		position: "absolute",
																		top: 0,
																		left: 0,
																		width: "100%",
																		height: "100%",
																		objectFit: "contain",
																		pointerEvents: "none",
																		zIndex: 5,
																	}}
																/>
															)}
													</div>
												</div>
											</div>
										) : (
											// Original phone layout for controller-message
											<div className="interaction-layout">
												<div className="interaction-text">
													<div className="step-header">
														<h2>{currentStep.title}</h2>
													</div>
													<div className="step-description">
														{currentStep.description}
													</div>
												</div>
												<div className="interaction-screenshot">
													<div className="screen-asset">
														<img
															src={getScreenAsset()}
															alt={currentStep.title}
														/>
													</div>
												</div>
											</div>
										)
									) : (
										<div className="step-header">
											<div className="highlight-text">{currentStep.title}</div>
											<div className="secondary-text">
												{currentStep.description}
											</div>
										</div>
									)}
									<div className="continue-button-container">
										{currentStep.type === "controller-message" && (
											<>
												{/* Pre-video button - "Continue on TV" */}
												{currentStep.videoAsset && (
													<button
														className={`continue-button pre-video-button ${
															showPreVideoButton ? "show" : "hide"
														}`}
														onClick={() => {
															handleInteraction({
																id: "start-video",
																action: "start-video",
															});
														}}
													>
														Continue on TV ➜
													</button>
												)}

												{/* Post-video button - "Continue" */}
												{currentStep.videoAsset && (
													<button
														className={`continue-button post-video-button ${
															showPostVideoButton ? "show" : "hide"
														}`}
														onClick={() => {
															handleInteraction({
																id: "continue",
																action: "next-step",
															});
														}}
													>
														Continue ➜
													</button>
												)}

												{/* Non-video button - regular "Continue" */}
												{!currentStep.videoAsset &&
													!currentStep.scrollableReport && (
														<button
															className={`continue-button non-video-button ${
																showNonVideoButton ? "show" : "hide"
															}`}
															onClick={() => {
																handleInteraction({
																	id: "continue",
																	action: "next-step",
																});
															}}
														>
															Continue ➜
														</button>
													)}

												{/* Scroll-complete button - appears after scrolling through report */}
												{currentStep.scrollableReport && (
													<button
														className={`continue-button scroll-complete-button ${
															scrollableReportState.isScrollComplete
																? "show"
																: "hide"
														}`}
														onClick={() => {
															const scrollCompleteInteraction =
																currentStep.interactions?.find(
																	(interaction) =>
																		interaction.type === "scroll-complete"
																);
															if (scrollCompleteInteraction) {
																handleInteraction(scrollCompleteInteraction);
															}
														}}
													>
														Continue ➜
													</button>
												)}
											</>
										)}
									</div>
								</div>
							)}

							{/* Interaction Step with Screenshot */}
							{currentStep.type === "interaction" && (
								<div
									className={`interaction-step ${
										currentStep.layoutType === "laptop" ? "laptop-layout" : ""
									}`}
								>
									{currentStep.layoutType === "laptop" ? (
										// New laptop layout: title/description on top, image below
										<div className="laptop-interaction-layout">
											{/* Top section - Title and Description centered */}
											<div className="laptop-interaction-header">
												<div className="step-header">
													<h2>{currentStep.title}</h2>
													<p className="step-description">
														{currentStep.description}
													</p>
												</div>
											</div>

											{/* Bottom section - Full width screenshot */}
											<div className="laptop-interaction-screenshot">
												{currentStep.screenAsset && (
													<div className="screen-asset">
														<div
															style={{
																position: "relative",
																display: "inline-block",
															}}
															onMouseMove={handleMouseMove}
															onMouseDown={handleMouseDown}
															onMouseUp={handleMouseUp}
														>
															<img
																src={cacheBuster.addCacheBuster(
																	getScreenAsset()
																)}
																alt={currentStep.title}
																className={`${
																	currentStep.id === "step14" &&
																	currentStep.screenAsset ===
																		"/assets/screenshots/scenario6/12.png"
																		? "scenario6-step14-image fade-transition"
																		: ""
																} ${imageLoaded ? "loaded" : ""}`}
																onLoad={() => {
																	console.log(
																		"Image onLoad fired for:",
																		currentStep.id
																	);
																	setImageLoaded(true);
																}}
																onError={(e) => {
																	console.error(
																		"Image failed to load:",
																		currentStep.id
																	);
																	e.target.style.display = "none";
																	setImageLoaded(true);
																}}
																style={{
																	display: "block",
																	maxWidth: "100%",
																	height: "auto",
																}}
															/>

															{/* Scenario6 Step14 Overlay Image - shows bar graph growth animation */}
															{currentStep.id === "step14" &&
																currentStep.screenAsset ===
																	"/assets/screenshots/scenario6/12.png" &&
																scenario6Step14State.showSecondImage && (
																	<img
																		src={cacheBuster.addCacheBuster(
																			"/assets/screenshots/scenario6/12.5.png"
																		)}
																		alt="Updated bar graph with growth"
																		className={`scenario6-step14-overlay ${
																			scenario6Step14State.startAnimation
																				? "reveal-up"
																				: ""
																		}`}
																		style={{
																			position: "absolute",
																			top: 0,
																			left: 0,
																			width: "100%",
																			height: "100%",
																			objectFit: "contain",
																			pointerEvents: "none",
																			zIndex: 5,
																		}}
																	/>
																)}

															{/* Scrollable Report Overlay */}
															{currentStep.scrollableReport &&
																(console.log(
																	"🔄 Rendering scrollable report container:",
																	{
																		stepId: currentStep.id,
																		layoutType: currentStep.layoutType,
																		reportImage:
																			currentStep.scrollableReport.reportImage,
																		viewportBounds:
																			currentStep.scrollableReport
																				.viewportBounds,
																		calculatedDimensions: {
																			left: `${
																				(currentStep.scrollableReport
																					.viewportBounds.x /
																					(currentStep.layoutType === "laptop"
																						? 1200
																						: 400)) *
																				100
																			}%`,
																			top: `${
																				(currentStep.scrollableReport
																					.viewportBounds.y /
																					(currentStep.layoutType === "laptop"
																						? 675
																						: 800)) *
																				100
																			}%`,
																			width: `${
																				(currentStep.scrollableReport
																					.viewportBounds.width /
																					(currentStep.layoutType === "laptop"
																						? 1200
																						: 400)) *
																				100
																			}%`,
																			height: `${
																				(currentStep.scrollableReport
																					.viewportBounds.height /
																					(currentStep.layoutType === "laptop"
																						? 675
																						: 800)) *
																				100
																			}%`,
																		},
																	}
																),
																(
																	<div
																		style={{
																			position: "absolute",
																			left: `${
																				(currentStep.scrollableReport
																					.viewportBounds.x /
																					(currentStep.layoutType === "laptop"
																						? 1200
																						: 400)) *
																				100
																			}%`,
																			top: `${
																				(currentStep.scrollableReport
																					.viewportBounds.y /
																					(currentStep.layoutType === "laptop"
																						? 675
																						: 800)) *
																				100
																			}%`,
																			width: `${
																				(currentStep.scrollableReport
																					.viewportBounds.width /
																					(currentStep.layoutType === "laptop"
																						? 1200
																						: 400)) *
																				100
																			}%`,
																			height: `${
																				(currentStep.scrollableReport
																					.viewportBounds.height /
																					(currentStep.layoutType === "laptop"
																						? 675
																						: 800)) *
																				100
																			}%`,
																			overflow: "hidden",
																			cursor: scrollableReportState.isDragging
																				? "grabbing"
																				: "grab",
																			willChange: "contents",
																			contain: "layout",
																			zIndex: 100,
																			
																		}}
																		onMouseDown={handleReportMouseDown}
																		onTouchStart={handleReportTouchStart}
																	>
																		<img
																			ref={reportImageRef}
																			src="/assets/screenshots/scenario2/report_1.png"
																			alt="Scrollable Report - DEBUG HARDCODED"
																			style={{
																				position: "absolute",
																				top: `-${scrollableReportState.scrollPosition}px`,
																				left: 0,
																				width: "100%",
																				height: "auto",
																				minHeight: "2250px", // Match working OLD.js implementation
																				objectFit: "cover",
																				objectPosition: "top left",
																				pointerEvents: "none",
																				userSelect: "none",
																				willChange: "transform",
																				transform: "translateZ(0)",
																				// Temporary debugging styles for laptop layout
																				...(currentStep.layoutType ===
																					"laptop" && {
																					zIndex: 999,
																					opacity: "1", // Force visibility
																					display: "block", // Force display
																					minWidth: "200px", // Force minimum size
																					minHeight: "1940px", // Force minimum size
																				}),
																			}}
																			onLoad={() => {
																				console.log(
																					"📊 Scrollable report image loaded:",
																					{
																						src: currentStep.scrollableReport
																							.reportImage,
																						naturalHeight:
																							reportImageRef.current
																								?.naturalHeight,
																						naturalWidth:
																							reportImageRef.current
																								?.naturalWidth,
																						offsetHeight:
																							reportImageRef.current
																								?.offsetHeight,
																						offsetWidth:
																							reportImageRef.current
																								?.offsetWidth,
																						layoutType: currentStep.layoutType,
																						stepId: currentStep.id,
																					}
																				);
																			}}
																			onError={(e) => {
																				console.error(
																					"❌ Scrollable report image failed to load:",
																					{
																						src: currentStep.scrollableReport
																							.reportImage,
																						error: e,
																						stepId: currentStep.id,
																					}
																				);
																			}}
																		/>
																	</div>
																))}

															{/* Standard interaction button for step14 when scroll is complete - OUTSIDE scrollable container */}
															{currentStep.id === "step14" &&
																currentStep.scrollableReport &&
																currentStep.scrollableReport
																	.interactionButton &&
																scrollableReportState.scrollProgress >= 0.8 && (
																	<button
																		className="interaction-button box-indicator assistance-zone-visible"
																		onClick={(e) => {
																			e.preventDefault();
																			e.stopPropagation();
																			console.log(
																				"Step14 interaction button clicked"
																			);
																			handleInteraction({
																				id: "step14-complete",
																				action: "next-step",
																			});
																		}}
																		style={{
																			position: "absolute",
																			left: `${
																				(currentStep.scrollableReport
																					.interactionButton.position.x /
																					1400) *
																				100
																			}%`,
																			top: `${
																				(currentStep.scrollableReport
																					.interactionButton.position.y /
																					810) *
																				100
																			}%`,
																			width: `${
																				(currentStep.scrollableReport
																					.interactionButton.size.width /
																					1400) *
																				100
																			}%`,
																			height: `${
																				(currentStep.scrollableReport
																					.interactionButton.size.height /
																					810) *
																				100
																			}%`,
																			zIndex: 30,
																		}}
																	></button>
																)}

															{currentStep.useImageMapper &&
																currentStep.interactions
																	?.filter(
																		(interaction) =>
																			interaction.type !== "scroll-complete" &&
																			interaction.position &&
																			interaction.size
																	)
																	.map((interaction) => (
																		<div
																			key={interaction.id}
																			data-interaction-zone="true"
																			onClick={(e) =>
																				handleInteraction(interaction, e)
																			}
																			className={
																				showZones
																					? `assistance-zone-visible ${
																							interaction.indicatorType || "box"
																					  }-indicator`
																					: "assistance-zone-hidden"
																			}
																			style={{
																				position: "absolute",
																				left: `${
																					(interaction.position.x /
																						(currentStep.layoutType === "laptop"
																							? 1400
																							: 400)) *
																					100
																				}%`,
																				top: `${
																					(interaction.position.y /
																						(currentStep.layoutType === "laptop"
																							? 810
																							: 800)) *
																					100
																				}%`,
																				width: `${
																					(interaction.size.width /
																						(currentStep.layoutType === "laptop"
																							? 1400
																							: 400)) *
																					100
																				}%`,
																				height: `${
																					(interaction.size.height /
																						(currentStep.layoutType === "laptop"
																							? 810
																							: 800)) *
																					100
																				}%`,
																				borderRadius:
																					interaction.indicatorType === "circle"
																						? "50%"
																						: "8px",
																				cursor: "pointer",
																				zIndex: 10,
																			}}
																		/>
																	))}

															{/* Selection rectangle overlay */}
															{isDragging && selectionRect && (
																<div
																	style={{
																		position: "absolute",
																		left: `${selectionRect.x}px`,
																		top: `${selectionRect.y}px`,
																		width: `${selectionRect.width}px`,
																		height: `${selectionRect.height}px`,
																		border: "2px dashed #00ff00",
																		backgroundColor: "rgba(0, 255, 0, 0.1)",
																		pointerEvents: "none",
																		zIndex: 1000,
																	}}
																/>
															)}
														</div>
													</div>
												)}
											</div>
										</div>
									) : (
										// Original phone layout: text left, image right
										<div className="interaction-layout">
											{/* Left side - Title and Description */}
											<div className="interaction-text">
												<div className="step-header">
													<h2>{currentStep.title}</h2>
													<p className="step-description">
														{currentStep.description}
													</p>
												</div>
											</div>

											{/* Right side - Screenshot */}
											<div className="interaction-screenshot">
												{currentStep.screenAsset && (
													<div className="screen-asset">
														<div
															style={{
																position: "relative",
																display: "inline-block",
															}}
															onMouseMove={handleMouseMove}
															onMouseDown={handleMouseDown}
															onMouseUp={handleMouseUp}
														>
															<img
																src={cacheBuster.addCacheBuster(
																	getScreenAsset()
																)}
																alt={currentStep.title}
																className={
																	currentStep.id === "step14" &&
																	currentStep.screenAsset ===
																		"/assets/screenshots/scenario6/12.png"
																		? "scenario6-step14-image fade-transition"
																		: ""
																}
																onLoad={() => setImageLoaded(true)}
																onError={(e) => {
																	e.target.style.display = "none";
																	setImageLoaded(true); // Show indicators even on error
																}}
																style={{
																	display: "block",
																	maxWidth: "100%",
																	height: "auto",
																}}
															/>

															{/* Scenario6 Step14 Overlay Image - phone layout - shows bar graph growth animation */}
															{currentStep.id === "step14" &&
																currentStep.screenAsset ===
																	"/assets/screenshots/scenario6/12.png" &&
																scenario6Step14State.showSecondImage && (
																	<img
																		src={cacheBuster.addCacheBuster(
																			"/assets/screenshots/scenario6/12.5.png"
																		)}
																		alt="Updated bar graph with growth"
																		className={`scenario6-step14-overlay ${
																			scenario6Step14State.startAnimation
																				? "reveal-up"
																				: ""
																		}`}
																		style={{
																			position: "absolute",
																			top: 0,
																			left: 0,
																			width: "100%",
																			height: "100%",
																			objectFit: "contain",
																			pointerEvents: "none",
																			zIndex: 5,
																		}}
																	/>
																)}

															{/* Scrollable Report Overlay for iPhone layout */}
															{currentStep.scrollableReport && (
																<div
																	style={{
																		position: "absolute",
																		left: `${
																			(currentStep.scrollableReport
																				.viewportBounds.x /
																				(currentStep.layoutType === "laptop"
																					? 1400
																					: 400)) *
																			100
																		}%`,
																		top: `${
																			(currentStep.scrollableReport
																				.viewportBounds.y /
																				(currentStep.layoutType === "laptop"
																					? 810
																					: 800)) *
																			100
																		}%`,
																		width: `${
																			(currentStep.scrollableReport
																				.viewportBounds.width /
																				(currentStep.layoutType === "laptop"
																					? 1400
																					: 400)) *
																			100
																		}%`,
																		height: `${
																			(currentStep.scrollableReport
																				.viewportBounds.height /
																				(currentStep.layoutType === "laptop"
																					? 810
																					: 800)) *
																			100
																		}%`,
																		overflow: "hidden",
																		cursor: scrollableReportState.isDragging
																			? "grabbing"
																			: "grab",
																		willChange: "contents",
																		contain: "layout",
																		zIndex: 100,
																	}}
																	onMouseDown={handleReportMouseDown}
																	onTouchStart={handleReportTouchStart}
																>
																	<img
																		ref={reportImageRef}
																		src={
																			currentStep.scrollableReport.reportImage
																		}
																		alt="Scrollable Report"
																		style={{
																			position: "absolute",
																			top: `-${scrollableReportState.scrollPosition}px`,
																			left: 0,
																			width: "100%",
																			height: "auto",
																			minHeight: "1600px",
																			objectFit: "cover",
																			objectPosition: "top center",
																			pointerEvents: "none",
																			userSelect: "none",
																			willChange: "transform",
																			transform: "translateZ(0)",
																		}}
																		onLoad={() => {
																			console.log(
																				"📊 Scrollable report image loaded:",
																				{
																					src: currentStep.scrollableReport
																						.reportImage,
																					naturalHeight:
																						reportImageRef.current
																							?.naturalHeight,
																					naturalWidth:
																						reportImageRef.current
																							?.naturalWidth,
																					offsetHeight:
																						reportImageRef.current
																							?.offsetHeight,
																					offsetWidth:
																						reportImageRef.current?.offsetWidth,
																					layoutType: currentStep.layoutType,
																					stepId: currentStep.id,
																				}
																			);
																		}}
																		onError={(e) => {
																			console.error(
																				"❌ Scrollable report image failed to load:",
																				{
																					src: currentStep.scrollableReport
																						.reportImage,
																					error: e,
																					stepId: currentStep.id,
																				}
																			);
																		}}
																	/>
																</div>
															)}

															{/* Interaction zone that appears after scroll is complete */}
															{currentStep.scrollableReport &&
																currentStep.scrollableReport
																	.interactionButton &&
																scrollableReportState.isScrollComplete && (
																	<div
																		className={`assistance-zone-visible box-indicator`}
																		onClick={(e) => {
																			e.preventDefault();
																			e.stopPropagation();
																			const scrollCompleteInteraction =
																				currentStep.interactions?.find(
																					(interaction) =>
																						interaction.type ===
																						"scroll-complete"
																				);
																			if (scrollCompleteInteraction) {
																				handleInteraction(
																					scrollCompleteInteraction
																				);
																			}
																		}}
																		style={{
																			position: "absolute",
																			left: `${
																				(currentStep.scrollableReport
																					.interactionButton.position.x /
																					400) *
																				100
																			}%`,
																			top: `${
																				(currentStep.scrollableReport
																					.interactionButton.position.y /
																					800) *
																				100
																			}%`,
																			width: `${
																				(currentStep.scrollableReport
																					.interactionButton.size.width /
																					400) *
																				100
																			}%`,
																			height: `${
																				(currentStep.scrollableReport
																					.interactionButton.size.height /
																					800) *
																				100
																			}%`,
																			cursor: "pointer",
																			zIndex: 15,
																		}}
																	/>
																)}

															{currentStep.useImageMapper &&
																currentStep.interactions
																	?.filter(
																		(interaction) =>
																			interaction.type !== "scroll-complete" &&
																			interaction.position &&
																			interaction.size
																	)
																	.map((interaction) => (
																		<div
																			key={interaction.id}
																			data-interaction-zone="true"
																			onClick={(e) =>
																				handleInteraction(interaction, e)
																			}
																			className={
																				showZones
																					? `assistance-zone-visible ${
																							interaction.indicatorType || "box"
																					  }-indicator`
																					: "assistance-zone-hidden"
																			}
																			style={{
																				position: "absolute",
																				left: `${
																					(interaction.position.x / 400) * 100
																				}%`,
																				top: `${
																					(interaction.position.y / 800) * 100
																				}%`,
																				width: `${
																					(interaction.size.width / 400) * 100
																				}%`,
																				height: `${
																					(interaction.size.height / 800) * 100
																				}%`,
																				borderRadius:
																					interaction.indicatorType === "circle"
																						? "50%"
																						: "8px",
																				cursor: "pointer",
																				zIndex: 10,
																			}}
																		/>
																	))}

															{/* Selection rectangle overlay */}
															{isDragging && selectionRect && (
																<div
																	style={{
																		position: "absolute",
																		left: `${selectionRect.x}px`,
																		top: `${selectionRect.y}px`,
																		width: `${selectionRect.width}px`,
																		height: `${selectionRect.height}px`,
																		border: "2px dashed #00ff00",
																		backgroundColor: "rgba(0, 255, 0, 0.1)",
																		pointerEvents: "none",
																		zIndex: 1000,
																	}}
																/>
															)}
														</div>
													</div>
												)}

												{!currentStep.useImageMapper && (
													<div className="interactions">
														{currentStep.interactions?.map(
															(interaction, index) => {
																const isActive = buttonFeedback[interaction.id];
																const buttonProps = getButtonProps(interaction);
																return (
																	<button
																		key={interaction.id}
																		className={`interaction-button ${
																			interaction.type
																		} ${isActive ? "tapped" : ""}`}
																		onClick={() =>
																			handleInteraction(interaction)
																		}
																		style={buttonProps}
																	></button>
																);
															}
														)}
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					) : (
						<div className="loading-step">
							<p>Loading step...</p>
						</div>
					)}
				</div>

				<div className="controller-footer">
					<button className="back-button" onClick={handleBackToScenarios}>
						Back to Scenarios
					</button>
				</div>

				{/* Invisible admin reset button in bottom right */}
				<button
					className="admin-reset-button"
					onClick={handleBackToScenarios}
					aria-label="Admin reset"
				></button>
			</div>
		</div>
	);
};

export default ControllerView;
