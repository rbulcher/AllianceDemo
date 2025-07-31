import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../hooks/useSocket";
import { getScenario } from "../../data/scenarios";
import { resolveVideoAsset } from "../../utils/videoUtils";
import "./DisplayView.css";

const DisplayView = () => {
	const { demoState, videoStarted, videoEnded: notifyVideoEnded, isConnected } =
		useSocket("display");

	const [currentScenario, setCurrentScenario] = useState(null);
	const [currentStep, setCurrentStep] = useState(null);
	const [previousStepId, setPreviousStepId] = useState(null);
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const [videoEnded, setVideoEnded] = useState(false);
	const [isVideoDelaying, setIsVideoDelaying] = useState(false);
	const [showEndFrameOverlay, setShowEndFrameOverlay] = useState(false);
	const videoRef = useRef(null);
	const videoLoadingRef = useRef(false);
	const currentVideoRef = useRef(null);

	useEffect(() => {
		if (demoState.currentScenario) {
			const scenario = getScenario(demoState.currentScenario);
			setCurrentScenario(scenario);

			if (scenario && scenario.steps[demoState.currentStep]) {
				const step = scenario.steps[demoState.currentStep];
				console.log("Current step:", step);
				
				// Check if this is a new step
				const isNewStep = step.id !== previousStepId;
				if (isNewStep) {
					console.log("New step detected, resetting video states");
					setPreviousStepId(step.id);
					setVideoEnded(false); // Only reset videoEnded on new steps
					
					// Don't reset showEndFrameOverlay if transitioning from step10 to step11
					// (both use the same endFrame and we want seamless transition)
					if (!(previousStepId === "step10" && step.id === "step11")) {
						console.log("🔄 Resetting showEndFrameOverlay for new step transition:", previousStepId, "->", step.id);
						setShowEndFrameOverlay(false);
					} else {
						console.log("🔄 Preserving showEndFrameOverlay during step10->step11 transition - keeping overlay visible");
					}
				}
				
				setCurrentStep(step);

				// Load video but don't auto-play - wait for manual trigger
				const resolvedVideoUrl = resolveVideoAsset(step.videoAsset);
				const shouldLoadVideo = resolvedVideoUrl && (
					step.type === "video" || 
					(step.type === "controller-message" && step.videoAsset)
				);

				console.log("Video logic check:", { 
					shouldLoadVideo: shouldLoadVideo, 
					hasVideoRef: !!videoRef.current,
					stepType: step.type,
					videoAsset: step.videoAsset,
					resolvedUrl: resolvedVideoUrl,
					stepId: step.id
				});

				if (shouldLoadVideo && videoRef.current) {
					console.log("Step has video, loading (not playing):", resolvedVideoUrl);
					
					// Clear any previous video URL cache first to prevent mix-ups
					currentVideoRef.current = null;
					
					// Just load the video, don't play it
					videoRef.current.src = resolvedVideoUrl;
					videoRef.current.load();
					currentVideoRef.current = resolvedVideoUrl;
					
					console.log("✅ Video loaded and currentVideoRef set:", currentVideoRef.current);
					
					// Add timeupdate listener to show endFrame before video ends
					const handleTimeUpdate = () => {
						if (videoRef.current && currentStep?.endFrameAsset) {
							const currentTime = videoRef.current.currentTime;
							const duration = videoRef.current.duration;
							
							// Show endFrame overlay 2 seconds before video ends (increased for smoother transition)
							if (duration && currentTime >= duration - 2.0 && !showEndFrameOverlay) {
								console.log("🎬 Showing endFrame overlay to prevent flicker at", currentTime, "of", duration);
								setShowEndFrameOverlay(true);
							}
						}
					};
					
					videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
					
					// Reset states
					setIsVideoPlaying(false);
					setVideoEnded(false);
					setIsVideoDelaying(false);
					// Don't reset showEndFrameOverlay during step10->step11 transition to prevent flicker
					if (!(previousStepId === "step10" && step.id === "step11")) {
						setShowEndFrameOverlay(false);
					}
				} else if (!shouldLoadVideo) {
					console.log("❌ Video not loaded - shouldLoadVideo:", shouldLoadVideo, "hasVideoRef:", !!videoRef.current);
					// Reset video states for non-video steps
					setIsVideoPlaying(false);
					setVideoEnded(false);
					setIsVideoDelaying(false);
					// Don't reset showEndFrameOverlay during step10->step11 transition to prevent flicker
					if (!(previousStepId === "step10" && step.id === "step11")) {
						console.log("🔄 Resetting showEndFrameOverlay for non-video step:", previousStepId, "->", step.id);
						setShowEndFrameOverlay(false);
					} else {
						console.log("🔄 Preserving showEndFrameOverlay in non-video logic during step10->step11 transition");
					}
					currentVideoRef.current = null;
				}
			}
		} else {
			// Reset everything when demo is reset
			console.log("Demo reset detected");
			// Clean up any existing timeupdate listeners
			if (videoRef.current) {
				const oldVideo = videoRef.current.cloneNode(true);
				videoRef.current.parentNode.replaceChild(oldVideo, videoRef.current);
				videoRef.current = oldVideo;
			}
			setCurrentScenario(null);
			setCurrentStep(null);
			setPreviousStepId(null);
			setIsVideoPlaying(false);
			setVideoEnded(false);
			setIsVideoDelaying(false);
			setShowEndFrameOverlay(false);
			currentVideoRef.current = null; // Clear the cached video URL
		}
	}, [demoState.currentScenario, demoState.currentStep]);

	// Handle manual video play trigger
	useEffect(() => {
		const currentStepVideoUrl = currentStep?.videoAsset ? resolveVideoAsset(currentStep.videoAsset) : null;
		
		console.log("🎬 Video play trigger check:", {
			demoStateVideoPlaying: demoState.isVideoPlaying,
			hasVideoRef: !!videoRef.current,
			hasCurrentVideoRef: !!currentVideoRef.current,
			localIsVideoPlaying: isVideoPlaying,
			currentVideoUrl: currentVideoRef.current,
			currentStepVideoUrl: currentStepVideoUrl,
			currentStepId: currentStep?.id
		});
		
		if (demoState.isVideoPlaying && videoRef.current && !isVideoPlaying) {
			// Use currentVideoRef if available, otherwise use current step's video URL
			const videoUrl = currentVideoRef.current || currentStepVideoUrl;
			
			if (videoUrl) {
				console.log("🎬 Manual video play triggered, starting playback with URL:", videoUrl);
				console.log("🔍 Video selection logic:", {
					currentVideoRefValue: currentVideoRef.current,
					currentStepVideoUrl: currentStepVideoUrl,
					selectedVideoUrl: videoUrl,
					currentStepId: currentStep?.id
				});
				
				// Make sure video is loaded with correct source
				if (videoRef.current.src !== videoUrl) {
					console.log("🔄 Loading video source:", videoUrl);
					videoRef.current.src = videoUrl;
					videoRef.current.load();
				}
				
				setIsVideoDelaying(false);
				videoRef.current
					.play()
					.then(() => {
						console.log("Video started successfully");
						setIsVideoPlaying(true);
						videoStarted({ videoId: videoUrl });
					})
					.catch((error) => {
						console.error("Video play failed:", error);
						setIsVideoPlaying(false);
						setIsVideoDelaying(false);
					});
			} else {
				console.error("❌ No video URL available for playback");
			}
		}
	}, [demoState.isVideoPlaying, isVideoPlaying, currentStep]);


	const handleVideoEnded = () => {
		console.log("🎬 Video ended - updating states and notifying server");
		setIsVideoPlaying(false);
		setVideoEnded(true);

		// Auto-progress for video steps OR controller-message steps with autoAdvanceOnVideoEnd flag
		const shouldAutoProgress = currentStep?.type === "video" || (currentStep?.type === "controller-message" && currentStep?.autoAdvanceOnVideoEnd === true);
		
		console.log("Video end decision:", {
			stepType: currentStep?.type,
			stepId: currentStep?.id,
			shouldAutoProgress
		});

		notifyVideoEnded({
			videoId: resolveVideoAsset(currentStep?.videoAsset) || "demo-video",
			step: demoState.currentStep,
			autoProgress: shouldAutoProgress
		});
	};

	const handleVideoError = () => {
		console.error("Video failed to load");
		console.error("Video error details:", {
			videoSrc: videoRef.current?.src,
			currentVideoRef: currentVideoRef.current,
			currentStep: currentStep?.id
		});
		setIsVideoPlaying(false);
		setVideoEnded(false);
		setIsVideoDelaying(false);
		videoLoadingRef.current = false;
		currentVideoRef.current = null;
	};

	if (!isConnected) {
		return (
			<div className="display-view connecting">
				<div className="connection-message">
					<h1>Alliance Commercial Laundry Demo</h1>
					<p>Connecting to demo system...</p>
					<div className="spinner"></div>
				</div>
			</div>
		);
	}

	if (!currentScenario) {
		return (
			<div className="display-view standby">
				<div className="standby-screen">
					<div className="alliance-logo">
						<h1>Alliance Commercial Laundry</h1>
						<p>Interactive Demo System</p>
					</div>
					<div className="standby-message">
						<h2>Demo Ready</h2>
						<p>Use the iPad controller to begin a scenario</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div 
			className="display-view"
			style={{
				backgroundImage: "url(/assets/Background.png)",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			<div className="display-header">
				<h1>{currentScenario.title}</h1>
				<div className="progress-bar">
					<div
						className="progress-fill"
						style={{
							width: `${
								((demoState.currentStep + 1) / currentScenario.totalSteps) * 100
							}%`,
						}}
					></div>
				</div>
				<div className="step-info">
					Step {demoState.currentStep + 1} of {currentScenario.totalSteps}
				</div>
			</div>

			<div className="display-content">
				{/* Always render video element so ref is available */}
				<div 
					className="video-container" 
					style={{ 
						display: (() => {
							// Show video container if step has video OR if it's step 10 with endFrame
							const hasVideo = resolveVideoAsset(currentStep?.videoAsset);
							const shouldShowVideo = hasVideo && (
								currentStep.type === "video" || 
								(currentStep.type === "controller-message" && currentStep.videoAsset)
							);
							const isStep11WithEndFrame = currentStep?.id === "step11" && currentStep?.endFrameAsset;
							console.log("Video display:", { hasVideo, shouldShowVideo, isVideoPlaying, isVideoDelaying, videoEnded, isStep11WithEndFrame });
							return (shouldShowVideo || isStep11WithEndFrame) ? 'block' : 'none';
						})()
					}}
				>
					<video
						ref={videoRef}
						className="demo-video"
						onEnded={handleVideoEnded}
						onError={handleVideoError}
						controls={false}
						muted
					>
						Your browser does not support the video tag.
					</video>
					{!isVideoPlaying && !videoEnded && currentStep?.id !== "step11" && (
						<div className="video-overlay">
							{isVideoDelaying ? (
								<h3>Video Starting...</h3>
							) : (
								<h3>Loading video...</h3>
							)}
						</div>
					)}
					{/* Early endFrame overlay to prevent flicker - shows before video ends and persists through step transition */}
					{(() => {
						// Show early overlay if flag is set OR if we're on step11 and came from step10 (backup failsafe)
						const isStep11FromStep10 = currentStep?.id === "step11" && previousStepId === "step10";
						const shouldShow = (showEndFrameOverlay && currentStep?.endFrameAsset) || 
										  (isStep11FromStep10 && currentStep?.endFrameAsset);
						console.log("🎬 Early endFrame overlay check:", {
							stepId: currentStep?.id,
							showEndFrameOverlay,
							hasEndFrame: !!currentStep?.endFrameAsset,
							isStep11FromStep10,
							shouldShow,
							previousStepId
						});
						return shouldShow;
					})() && (
						<img 
							src={currentStep.endFrameAsset} 
							alt="Video end frame (early overlay)"
							className="demo-video"
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								zIndex: 15, // Higher than regular overlay to show on top of video
								opacity: 1,
								pointerEvents: 'none' // Don't interfere with video events
							}}
							onLoad={() => console.log("🖼️ Early endFrame overlay loaded")}
						/>
					)}
					{/* Seamless endFrame overlay for any step with video and endFrame, or step 11 */}
					{(() => {
						const condition1 = currentStep?.endFrameAsset && videoEnded && currentStep?.videoAsset;
						const condition2 = currentStep?.id === "step11" && currentStep?.endFrameAsset;
						const condition3 = showEndFrameOverlay && currentStep?.endFrameAsset;
						const shouldShow = condition1 || condition2 || condition3;
						
						console.log("🖼️ Regular endFrame overlay check:", {
							stepId: currentStep?.id,
							hasEndFrame: !!currentStep?.endFrameAsset,
							videoEnded,
							hasVideoAsset: !!currentStep?.videoAsset,
							showEndFrameOverlay,
							condition1,
							condition2, 
							condition3,
							shouldShow
						});
						
						return shouldShow;
					})() && (
						<img 
							src={currentStep.endFrameAsset} 
							alt="Video end frame"
							className="demo-video"
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								zIndex: 10
							}}
						/>
					)}
				</div>

				{(() => {
					const hasVideo = resolveVideoAsset(currentStep?.videoAsset);
					const shouldShowVideo = hasVideo && (
						currentStep.type === "video" || 
						(currentStep.type === "controller-message" && currentStep.videoAsset)
					);
					const shouldShowEndFrameInVideoContainer = currentStep?.type === "controller-message" && currentStep?.endFrameAsset && (videoEnded || !currentStep?.videoAsset);
					return !shouldShowVideo && !shouldShowEndFrameInVideoContainer;
				})() && (
					<div className="step-display">
						{/* TV Display Content - Only show step progress and current step info */}
						<div className="tv-content">
							<div className="current-step-info">
								{currentStep?.type !== "controller-message" && (
									<>
										{currentStep?.endFrameAsset && videoEnded ? (
											<img 
												src={currentStep.endFrameAsset} 
												alt="Video end frame"
												className="end-frame-image"
												style={{
													maxWidth: '100%',
													maxHeight: '80vh',
													objectFit: 'contain'
												}}
											/>
										) : (
											<>
												<h2>{currentStep?.title || "Loading..."}</h2>
												<p>{currentStep?.description || ""}</p>
											</>
										)}
									</>
								)}
								{currentStep?.type === "controller-message" && (
									<div className="waiting-for-controller">
										<>
											<h2>Follow instructions on the controller</h2>
											<p>Use the iPad to continue the demonstration</p>
										</>
									</div>
								)}
							</div>


							{currentStep?.type === "completion" && (
								<div className="completion-message">
									<h3>Scenario Complete!</h3>
									<p>
										Thank you for experiencing Alliance Commercial Laundry
										Solutions
									</p>
									<div className="completion-stats">
										<div className="stat">
											<span className="stat-label">Steps Completed</span>
											<span className="stat-value">
												{currentScenario.totalSteps}
											</span>
										</div>
										<div className="stat">
											<span className="stat-label">Demo Time</span>
											<span className="stat-value">
												{currentScenario.estimatedTime}
											</span>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			<div className="display-footer">
				<div className="connection-status">
					{isConnected ? "🟢 Connected" : "🔴 Disconnected"}
				</div>
			</div>
		</div>
	);
};

export default DisplayView;
