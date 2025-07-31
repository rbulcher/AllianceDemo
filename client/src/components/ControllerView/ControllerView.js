import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../../hooks/useSocket";
import { getScenario, getAllScenarios } from "../../data/scenarios";
import { resolveVideoAsset } from "../../utils/videoUtils";
import audioFeedback from "../../utils/audioFeedback";
import "./ControllerView.css";

const ControllerView = () => {
	const { demoState, nextStep, startScenario, adminReset, isConnected, playVideo } =
		useSocket("controller");

	const [currentScenario, setCurrentScenario] = useState(null);
	const [currentStep, setCurrentStep] = useState(null);
	const [adminClickCount, setAdminClickCount] = useState(0);
	const [showAdminFeedback, setShowAdminFeedback] = useState(false);
	const [buttonFeedback, setButtonFeedback] = useState({});
	const [showZones, setShowZones] = useState(true);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [showContinueButton, setShowContinueButton] = useState(false);
	const [completedScenarios, setCompletedScenarios] = useState(new Set());
	const [videoManuallyStarted, setVideoManuallyStarted] = useState(false);
	const pulseTimerRef = useRef(null);
	const phoneScreenRef = useRef(null);
	const continueButtonTriggeredRef = useRef(false);
	const videoHasStartedRef = useRef(false);
	const continueButtonTimerRef = useRef(null);

	// Use button positions and sizes directly from scenarios without scaling
	const getButtonProps = (interaction) => {
		return {
			left: `${interaction.position.x}px`,
			top: `${interaction.position.y}px`,
			width: `${interaction.size.width}px`,
			height: `${interaction.size.height}px`,
		};
	};

	useEffect(() => {
		if (demoState.currentScenario) {
			const scenario = getScenario(demoState.currentScenario);
			setCurrentScenario(scenario);

			if (scenario && scenario.steps && scenario.steps.length > 0) {
				const stepIndex = Math.min(
					demoState.currentStep || 0,
					scenario.steps.length - 1
				);
				const step = scenario.steps[stepIndex];
				if (step) {
					setCurrentStep(step);
					// Show zones permanently for image mapper steps
					setShowZones(step.useImageMapper || false);
					// Reset continue button trigger flag for new step
					continueButtonTriggeredRef.current = false;
					// Only reset video started flag if we're actually changing steps
					if (step.id !== currentStep?.id) {
						console.log("🆕 NEW STEP - Resetting video flag for:", step.id);
						videoHasStartedRef.current = false;
						setVideoManuallyStarted(false); // Reset manual video start flag
						setImageLoaded(false); // Reset image loaded state for new step
					}

					// For controller-message steps, show continue button behavior
					if (step.type === "controller-message") {
						// Only hide button if this is actually a new step, not just a video-end update
						if (step.id !== currentStep?.id) {
							// This is truly a new step - hide button and reset
							if (showContinueButton) {
								console.log("🔴 HIDING continue button for new step");
							}
							setShowContinueButton(false);
							continueButtonTriggeredRef.current = false;
						} else {
							// Same step, might be video-end update - preserve button state
							console.log("📹 Same step update - preserving continue button state");
						}
						// Don't reset videoHasStartedRef here - let it persist for video end detection
					} else {
						// Reset continue button for non-controller-message steps
						setShowContinueButton(false);
					}
				}
			}
		}
	}, [demoState]);

	// Track when video starts playing (for manual and auto video start)
	useEffect(() => {
		if (demoState.isVideoPlaying && currentStep?.videoAsset && !videoHasStartedRef.current) {
			console.log("🎥 VIDEO STARTED - Setting flag for step:", currentStep.id);
			videoHasStartedRef.current = true;
		}
		// Don't reset the flag when video stops - we need it for continue button logic
	}, [demoState.isVideoPlaying, currentStep]);

	// Listen for video status changes to show continue button
	useEffect(() => {
		const isVideoActuallyEnded = !demoState.isVideoPlaying && currentStep?.videoAsset && videoHasStartedRef.current && videoManuallyStarted;
		
		console.log("🔍 Continue button logic check:", {
			hasCurrentStep: !!currentStep,
			stepType: currentStep?.type,
			hasVideoAsset: !!currentStep?.videoAsset,
			isVideoPlaying: demoState.isVideoPlaying,
			hasScenario: !!demoState.currentScenario,
			showContinueButton,
			videoHasStarted: videoHasStartedRef.current,
			videoManuallyStarted,
			stepId: currentStep?.id,
			isVideoActuallyEnded,
			continueButtonTriggered: continueButtonTriggeredRef.current,
			// Individual condition checks
			condition1_hasCurrentStep: !!currentStep,
			condition2_isControllerMessage: currentStep?.type === "controller-message",
			condition3_hasVideoAsset: !!currentStep?.videoAsset,
			condition4_videoEnded: isVideoActuallyEnded,
			condition5_hasScenario: !!demoState.currentScenario,
			condition6_buttonNotShowing: !showContinueButton,
			condition7_correctStep: currentStep?.id === "step1" || currentStep?.id === "step9",
			condition8_notTriggered: !continueButtonTriggeredRef.current
		});
		
		if (
			currentStep &&
			currentStep.type === "controller-message" &&
			currentStep.videoAsset &&
			isVideoActuallyEnded &&
			demoState.currentScenario &&
			!showContinueButton && // Only trigger if button isn't already showing
			(currentStep.id === "step1" || currentStep.id === "step10") && // Handle both video steps
			!continueButtonTriggeredRef.current // Prevent duplicate triggers
		) {
			console.log("✅ VIDEO END - Continue button conditions met for", currentStep.id);
			console.log("✅ CONDITIONS MET - Setting continue button to show after 1 second delay");
			
			// Mark as triggered to prevent duplicate animations
			continueButtonTriggeredRef.current = true;
			
			// Video has ended, add 1 second UX delay before showing continue button
			// DON'T use cleanup return - let this timer complete no matter what
			setTimeout(() => {
				console.log("✅ 1 second delay elapsed - showing continue button for", currentStep.id);
				console.log("🎬 CONTINUE BUTTON ANIMATION STARTED");
				setShowContinueButton(true);
			}, 1000); // 1 second delay
		} else if (!continueButtonTriggeredRef.current) {
			// Only log if we haven't already triggered the button - reduce noise
			console.log("❌ Continue button conditions NOT met - missing conditions above");
		}
	}, [demoState.isVideoPlaying, currentStep, demoState.currentScenario, videoManuallyStarted]);

	// Show continue button for non-video controller-message steps with delay
	useEffect(() => {
		if (
			currentStep &&
			currentStep.type === "controller-message" &&
			!currentStep.videoAsset &&
			!currentStep.autoAdvanceDelay &&
			demoState.currentScenario &&
			!showContinueButton &&
			!continueButtonTriggeredRef.current
		) {
			console.log("Non-video controller-message step - showing continue button after delay");
			continueButtonTriggeredRef.current = true;
			
			// Brief delay for smooth animation
			const timer = setTimeout(() => {
				console.log("🎬 CONTINUE BUTTON ANIMATION STARTED (non-video step)");
				setShowContinueButton(true);
			}, 500); // Shorter delay for non-video steps
			
			return () => clearTimeout(timer);
		}
	}, [currentStep, demoState.currentScenario]);

	// Show "Continue on TV" button for video steps that haven't been started yet
	useEffect(() => {
		console.log("📺 'Continue on TV' button logic check:", {
			hasCurrentStep: !!currentStep,
			stepType: currentStep?.type,
			hasVideoAsset: !!currentStep?.videoAsset,
			videoManuallyStarted,
			isVideoPlaying: demoState.isVideoPlaying,
			hasScenario: !!demoState.currentScenario,
			showContinueButton,
			continueButtonTriggered: continueButtonTriggeredRef.current,
			stepId: currentStep?.id
		});
		
		if (
			currentStep &&
			currentStep.type === "controller-message" &&
			currentStep.videoAsset &&
			!videoManuallyStarted &&
			!demoState.isVideoPlaying &&
			demoState.currentScenario &&
			!showContinueButton &&
			!continueButtonTriggeredRef.current
		) {
			console.log("✅ Showing 'Continue on TV' button for video step:", currentStep.id);
			continueButtonTriggeredRef.current = true;
			
			// Brief delay for smooth animation
			const timer = setTimeout(() => {
				console.log("🎬 'Continue on TV' button animation started");
				setShowContinueButton(true);
			}, 500);
			
			return () => clearTimeout(timer);
		} else {
			console.log("❌ 'Continue on TV' button conditions not met for step:", currentStep?.id);
		}
	}, [currentStep, demoState.currentScenario, videoManuallyStarted, demoState.isVideoPlaying]);

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


	// Debug: Track showZones changes
	useEffect(() => {
		console.log("showZones changed to:", showZones);
	}, [showZones]);

	const handleInteraction = async (interaction, e) => {
		if (!currentStep || !currentScenario) return;

		// Stop event propagation to prevent page click handler
		e?.stopPropagation();

		// Handle video start action
		if (interaction.action === "start-video") {
			console.log("🎬 Starting video manually - hiding continue button");
			setVideoManuallyStarted(true);
			setShowContinueButton(false);
			continueButtonTriggeredRef.current = false;
			
			const resolvedVideoUrl = resolveVideoAsset(currentStep.videoAsset);
			console.log("🎬 Calling playVideo with:", {
				videoId: resolvedVideoUrl,
				step: demoState.currentStep,
				stepId: currentStep.id
			});
			
			playVideo({
				videoId: resolvedVideoUrl,
				step: demoState.currentStep,
				stepId: currentStep.id
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
			console.log("No next step defined, going back to scenarios - COMPLETION PATH");
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
		
		// Mark scenario as completed if it finished successfully
		if (scenarioCompleted && currentScenario) {
			console.log("Marking scenario as completed:", currentScenario.id);
			setCompletedScenarios(prev => {
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
			console.log("Not marking as completed - scenarioCompleted:", scenarioCompleted, "currentScenario:", currentScenario?.id);
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
		
		setCompletedScenarios(new Set());
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
			<div
				className="controller-view scenario-selector"
				style={{
					backgroundImage: "url(/assets/Background.png)",
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
				}}
			>
				<div className="header">
					<h1>Think You Can Run a Laundromat?</h1>
					<div className="connection-status">
						{isConnected ? (
							<span className="connected">🟢 Connected</span>
						) : (
							<span className="disconnected">🔴 Connecting...</span>
						)}
					</div>
					{/* Reset Menu Button */}
					<button 
						className="reset-menu-button"
						onClick={handleResetMenu}
						title="Reset Menu"
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
								className={`scenario-card ${isCompleted ? 'completed' : ''}`}
							>
								<div className="scenario-header">
									<h3>{scenario.title}</h3>
								</div>
								<button 
									className={`start-button ${isCompleted ? 'completed' : ''}`}
									disabled={isCompleted}
									onClick={(e) => !isCompleted && handleScenarioSelect(scenario.id, e)}
								>
									{isCompleted ? 'Completed' : 'Explore'}
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
	if (demoState.isVideoPlaying && currentStep?.type === "video" && 
		currentScenario?.id === "scenario1" && currentStep?.id === "step10") {
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
									<div className="secondary-text">{currentStep.description}</div>
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
								<div className="controller-message-step relative-wrapper">
									{currentStep.screenAsset ? (
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
														src={currentStep.screenAsset}
														alt={currentStep.title}
													/>
												</div>
											</div>
										</div>
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
											<button
												className={`continue-button ${showContinueButton ? 'show' : 'hide'}`}
												onClick={() => {
													// Determine action based on video state
													if (currentStep.videoAsset && !videoManuallyStarted) {
														// Video step that hasn't been started - start video
														handleInteraction({
															id: "start-video",
															action: "start-video",
														});
													} else {
														// Non-video step or video finished - continue to next step
														handleInteraction({
															id: "continue",
															action: "next-step",
														});
													}
												}}
											>
												{currentStep.videoAsset && !videoManuallyStarted 
													? "Continue on TV ➜" 
													: "Continue ➜"
												}
											</button>
										)}
									</div>
								</div>
							)}

							{/* Interaction Step with Screenshot */}
							{currentStep.type === "interaction" && (
								<div className="interaction-step">
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
													>
														<img
															src={currentStep.screenAsset}
															alt={currentStep.title}
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
														{currentStep.useImageMapper &&
															currentStep.interactions?.map((interaction) => (
																<div
																	key={interaction.id}
																	data-interaction-zone="true"
																	onClick={(e) =>
																		handleInteraction(interaction, e)
																	}
																	className={
																		showZones && imageLoaded
																			? `assistance-zone-visible ${interaction.indicatorType || 'box'}-indicator`
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
																		borderRadius: interaction.indicatorType === 'circle' ? '50%' : '8px',
																		cursor: "pointer",
																		zIndex: 10,
																	}}
																/>
															))}
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
																	onClick={() => handleInteraction(interaction)}
																	style={buttonProps}
																></button>
															);
														}
													)}
												</div>
											)}
										</div>
									</div>
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
