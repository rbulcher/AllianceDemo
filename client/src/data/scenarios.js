// Scenario data structure for Alliance washing machine demo
import { createVideoAsset, VIDEO_KEYS } from "../utils/videoUtils";

export const scenarios = {
	scenario1: {
		id: "scenario1",
		title: "Pay Attention To What Matters",
		description: "Optimize your commercial laundry operations",
		totalSteps: 11,
		estimatedTime: "8-10 minutes",
		steps: [
			{
				id: "step1",
				type: "controller-message",
				title: "Using Insights,",
				description:
					"help this customer transfer their laundry from one washer to another.",
				videoAsset: createVideoAsset(VIDEO_KEYS.SCENARIO1_VIDEO1),
				endFrameAsset: "/assets/videos/scenario1/endFrame1.png",
				showContinueButton: true,
				autoAdvanceDelay: 1000,
				nextStep: "step2",
			},
			{
				id: "step2",
				type: "interaction",
				title: "Rapid Advance",
				description:
					"Use the Rapid Advance feature to complete the cycle and unlock the door",
				screenAsset: "/assets/screenshots/scenario1/1.png",
				useImageMapper: true,
				interactions: [
					{
						id: "room-selection",
						type: "image-map",
						label: "Laundry Company Central",
						position: { x: 82, y: 335 },
						size: { width: 218, height: 45 },
						action: "select-room",
						data: { roomId: "central" },
						indicatorType: "box",
					},
				],
				nextStep: "step3",
			},
			{
				id: "step3",
				type: "interaction",
				title: "Rapid Advance",
				description:
					"Use the Rapid Advance feature to complete the cycle and unlock the door",
				screenAsset: "/assets/screenshots/scenario1/2.png",
				useImageMapper: true,
				interactions: [
					{
						id: "w1-selection",
						type: "image-map",
						label: "W1",
						// Bottom half positioning - you can dial in exact coordinates
						position: { x: 93, y: 371 },
						size: { width: 100, height: 75 },
						action: "next-step",
						indicatorType: "circle",
					},
				],
				nextStep: "step4",
			},
			{
				id: "step4",
				type: "interaction",
				title: "Rapid Advance",
				description:
					"Use the Rapid Advance feature to complete the cycle and unlock the door",
				screenAsset: "/assets/screenshots/scenario1/3.png",
				useImageMapper: true,
				interactions: [
					{
						id: "rapid-advance-btn",
						type: "image-map",
						label: "Rapid Advance",
						// Bottom half positioning - you can dial in exact coordinates
						position: { x: 75, y: 563 },
						size: { width: 235, height: 37 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step5",
			},
			{
				id: "step5",
				type: "interaction",
				title: "Rapid Advance",
				description:
					"Use the Rapid Advance feature to complete the cycle and unlock the door",
				screenAsset: "/assets/screenshots/scenario1/4.png",
				useImageMapper: true,
				interactions: [
					{
						id: "end-cycle-option",
						type: "image-map",
						label: "End of Cycle",
						// Bottom half positioning - you can dial in exact coordinates
						position: { x: 120, y: 600 },
						size: { width: 150, height: 30 },
						action: "next-step",
						indicatorType: "circle",
					},
				],
				nextStep: "step6",
			},
			{
				id: "step6",
				type: "interaction",
				title: "Start Machine",
				description:
					"Start a free cycle remotely to let the customer complete their laundry",
				screenAsset: "/assets/screenshots/scenario1/5.png",
				useImageMapper: true,
				interactions: [
					{
						id: "new-step6-btn",
						type: "image-map",
						label: "Continue",
						// Placeholder coordinates - will need to be adjusted based on actual screenshot
						position: { x: 82, y: 382 },
						size: { width: 220, height: 42 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step7",
			},
			{
				id: "step7",
				type: "interaction",
				title: "Start Machine",
				description:
					"Start a free cycle remotely to let the customer complete their laundry",
				screenAsset: "/assets/screenshots/scenario1/6.png",
				useImageMapper: true,
				interactions: [
					{
						id: "confirm-btn",
						type: "image-map",
						label: "Confirm",
						// Bottom half positioning - you can dial in exact coordinates
						position: { x: 202, y: 432 },
						size: { width: 80, height: 75 },
						action: "next-step",
						indicatorType: "circle",
					},
				],
				nextStep: "step8",
			},
			{
				id: "step8",
				type: "interaction",
				title: "Start Machine",
				description:
					"Start a free cycle remotely to let the customer complete their laundry",
				screenAsset: "/assets/screenshots/scenario1/7.png",
				useImageMapper: true,
				interactions: [
					{
						id: "start-machine-btn",
						type: "image-map",
						label: "Start Machine",
						// Bottom half positioning - you can dial in exact coordinates
						position: { x: 80, y: 332 },
						size: { width: 220, height: 35 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step9",
			},
			{
				id: "step9",
				type: "interaction",
				title: "Start Machine",
				description:
					"Start a free cycle remotely to let the customer complete their laundry",
				screenAsset: "/assets/screenshots/scenario1/8.png",
				useImageMapper: true,
				interactions: [
					{
						id: "service-option",
						type: "image-map",
						label: "Customer Service",
						// Bottom half positioning - you can dial in exact coordinates
						position: { x: 105, y: 605 },
						size: { width: 180, height: 30 },
						action: "next-step",
						indicatorType: "circle",
					},
				],
				nextStep: "step10",
			},
			{
				id: "step10",
				type: "controller-message",
				title: "Great Work! Now, ",
				description: "continue the experience on the TV",
				videoAsset: createVideoAsset(VIDEO_KEYS.SCENARIO1_VIDEO2),
				endFrameAsset: "/assets/videos/scenario1/endFrame2.png",
				autoAdvanceOnVideoEnd: true,
				nextStep: "step11",
			},
			{
				id: "step11",
				type: "controller-message",
				title: "Thank You!",
				description:
					"Continue to the scene selection screen to explore more scenarios",
				endFrameAsset: "/assets/videos/scenario1/endFrame2.png",
				showContinueButton: true,
				nextStep: null,
			},
		],
	},
	// Additional scenarios can be added here
	scenario2: {
		id: "scenario2",
		title: "Have Data Come To You",
		description: "Maximize energy savings with smart controls",
		totalSteps: 10,
		estimatedTime: "6-8 minutes",
		steps: [
			// Will be populated with steps similar to scenario1
		],
	},
	scenario3: {
		id: "scenario3",
		title: "Revenue Data In Your Hands",
		description: "Monitor and control multiple laundry locations",
		totalSteps: 14,
		estimatedTime: "10-12 minutes",
		steps: [
			// Will be populated with steps similar to scenario1
		],
	},
	scenario4: {
		id: "scenario4",
		title: "Promote, Retain, Reward",
		description: "Proactive maintenance and troubleshooting",
		totalSteps: 8,
		estimatedTime: "5-7 minutes",
		steps: [
			// Will be populated with steps similar to scenario1
		],
	},
	scenario5: {
		id: "scenario5",
		title: "Know Before Your Customers Do",
		description: "Analyze performance data and optimize operations",
		totalSteps: 11,
		estimatedTime: "8-10 minutes",
		steps: [
			// Will be populated with steps similar to scenario1
		],
	},
};

export const getScenario = (scenarioId) => {
	return scenarios[scenarioId] || null;
};

export const getStep = (scenarioId, stepId) => {
	const scenario = getScenario(scenarioId);
	if (!scenario) return null;

	return scenario.steps.find((step) => step.id === stepId) || null;
};

export const getNextStep = (scenarioId, currentStepId) => {
	const scenario = getScenario(scenarioId);
	if (!scenario) return null;

	const currentStep = scenario.steps.find((step) => step.id === currentStepId);
	if (!currentStep || !currentStep.nextStep) return null;

	return getStep(scenarioId, currentStep.nextStep);
};

export const getAllScenarios = () => {
	return Object.values(scenarios);
};
