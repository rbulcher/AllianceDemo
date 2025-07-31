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
				title: "Great Work!",
				description: " Now, continue the experience on the TV",
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
		totalSteps: 24,
		estimatedTime: "10-12 minutes",
		steps: [
			{
				id: "step1",
				type: "controller-message",
				title: "Encourage Customer Loyalty",
				description: "And repeat business by using the CRM feature",
				videoAsset: createVideoAsset(VIDEO_KEYS.SCENARIO1_VIDEO1),
				endFrameAsset: "/assets/videos/scenario1/endFrame1.png",
				showContinueButton: true,
				autoAdvanceDelay: 1000,
				nextStep: "step2",
			},
			{
				id: "step2",
				type: "interaction",
				title: "CRM",
				description: "Create an engagement campaign to bring back customers",
				screenAsset: "/assets/screenshots/scenario4/1.png",
				useImageMapper: true,
				layoutType: "laptop", // New layout type for laptop screenshots
				interactions: [
					{
						id: "laptop-interaction-1",
						type: "image-map",
						label: "Continue",
						position: { x: 421, y: 79 },
						size: { width: 35, height: 28 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step3",
			},
			{
				id: "step3",
				type: "interaction",
				title: "CRM",
				description: "Create an engagement campaign to bring back customers",
				screenAsset: "/assets/screenshots/scenario4/2.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-2",
						type: "image-map",
						label: "Continue",
						position: { x: 247, y: 104 },
						size: { width: 41, height: 19 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step4",
			},
			{
				id: "step4",
				type: "interaction",
				title: "CRM",
				description: "Create an engagement campaign to bring back customers",
				screenAsset: "/assets/screenshots/scenario4/3.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-3",
						type: "image-map",
						label: "Continue",
						position: { x: 998, y: 127 },
						size: { width: 40, height: 33 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step5",
			},
			{
				id: "step5",
				type: "interaction",
				title: "CRM",
				description: "Create an engagement campaign to bring back customers",
				screenAsset: "/assets/screenshots/scenario4/4.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-4",
						type: "image-map",
						label: "Continue",
						position: { x: 319, y: 178 },
						size: { width: 99, height: 71 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step6",
			},
			{
				id: "step6",
				type: "interaction",
				title: "CRM",
				description: "Create an engagement campaign to bring back customers",
				screenAsset: "/assets/screenshots/scenario4/5.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-5",
						type: "image-map",
						label: "Continue",
						position: { x: 218, y: 259 },
						size: { width: 814, height: 57 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step7",
			},
			{
				id: "step7",
				type: "interaction",
				title: "CRM",
				description: "Create an engagement campaign to bring back customers",
				screenAsset: "/assets/screenshots/scenario4/6.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-6",
						type: "image-map",
						label: "Continue",
						position: { x: 220, y: 313 },
						size: { width: 811, height: 33 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step8",
			},
			{
				id: "step8",
				type: "interaction",
				title: "CRM",
				description: "Create an engagement campaign to bring back customers",
				screenAsset: "/assets/screenshots/scenario4/7.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-7",
						type: "image-map",
						label: "Continue",
						position: { x: 554, y: 265 },
						size: { width: 107, height: 58 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step9",
			},
			{
				id: "step9",
				type: "interaction",
				title: "CRM",
				description: "Create an engagement campaign to bring back customers",
				screenAsset: "/assets/screenshots/scenario4/8.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-8",
						type: "image-map",
						label: "Continue",
						position: { x: 692, y: 327 },
						size: { width: 25, height: 19 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step10",
			},
			{
				id: "step10",
				type: "interaction",
				title: "CRM",
				description: "Now choose which customers you want to engage with",
				screenAsset: "/assets/screenshots/scenario4/9.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-9",
						type: "image-map",
						label: "Continue",
						position: { x: 218, y: 343 },
						size: { width: 812, height: 40 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step11",
			},
			{
				id: "step11",
				type: "interaction",
				title: "CRM",
				description: "Now choose which customers you want to engage with",
				screenAsset: "/assets/screenshots/scenario4/10.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-10",
						type: "image-map",
						label: "Continue",
						position: { x: 224, y: 361 },
						size: { width: 231, height: 80 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step12",
			},
			{
				id: "step12",
				type: "interaction",
				title: "CRM",
				description: "Now choose which customers you want to engage with",
				screenAsset: "/assets/screenshots/scenario4/11.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-11",
						type: "image-map",
						label: "Continue",
						position: { x: 230, y: 372 },
						size: { width: 233, height: 22 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step13",
			},
			{
				id: "step13",
				type: "interaction",
				title: "CRM",
				description: "Create a message that your customers will see",
				screenAsset: "/assets/screenshots/scenario4/12.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-12",
						type: "image-map",
						label: "Continue",
						position: { x: 219, y: 396 },
						size: { width: 812, height: 58 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step14",
			},
			{
				id: "step14",
				type: "interaction",
				title: "CRM",
				description: "Create a message that your customers will see",
				screenAsset: "/assets/screenshots/scenario4/13.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-13",
						type: "image-map",
						label: "Continue",
						position: { x: 224, y: 383 },
						size: { width: 232, height: 66 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step15",
			},
			{
				id: "step15",
				type: "interaction",
				title: "CRM",
				description: "Create a message that your customers will see",
				screenAsset: "/assets/screenshots/scenario4/14.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-14",
						type: "image-map",
						label: "Continue",
						position: { x: 222, y: 461 },
						size: { width: 235, height: 33 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step16",
			},
			{
				id: "step16",
				type: "interaction",
				title: "CRM",
				description: "Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/15.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-15",
						type: "image-map",
						label: "Continue",
						position: { x: 219, y: 411 },
						size: { width: 811, height: 52 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step17",
			},
			{
				id: "step17",
				type: "interaction",
				title: "CRM",
				description: "Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/16.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-16",
						type: "image-map",
						label: "Continue",
						position: { x: 527, y: 275 },
						size: { width: 195, height: 35 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step18",
			},
			{
				id: "step18",
				type: "interaction",
				title: "CRM",
				description: "Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/17.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-17",
						type: "image-map",
						label: "Continue",
						position: { x: 529, y: 306 },
						size: { width: 196, height: 20 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step19",
			},
			{
				id: "step19",
				type: "interaction",
				title: "CRM",
				description: "Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/18.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-18",
						type: "image-map",
						label: "Continue",
						position: { x: 528, y: 295 },
						size: { width: 193, height: 29 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step20",
			},
			{
				id: "step20",
				type: "interaction",
				title: "CRM",
				description: "Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/19.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-19",
						type: "image-map",
						label: "Continue",
						position: { x: 529, y: 323 },
						size: { width: 193, height: 30 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step21",
			},
			{
				id: "step21",
				type: "interaction",
				title: "CRM",
				description: "Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/20.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-19",
						type: "image-map",
						label: "Continue",
						position: { x: 689, y: 352 },
						size: { width: 31, height: 22 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step22",
			},
			{
				id: "step22",
				type: "interaction",
				title: "CRM",
				description: "Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/21.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-19",
						type: "image-map",
						label: "Continue",
						position: { x: 255, y: 468 },
						size: { width: 61, height: 22 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step23",
			},
			{
				id: "step23",
				type: "controller-message",
				title: "Great Work!",
				description: " Now, continue the experience on the TV",
				videoAsset: createVideoAsset(VIDEO_KEYS.SCENARIO1_VIDEO2),
				endFrameAsset: "/assets/videos/scenario1/endFrame2.png",
				autoAdvanceOnVideoEnd: true,
				nextStep: "step24",
			},
			{
				id: "step24",
				type: "controller-message",
				title: "Thank You!",
				description: "Continue to the scene selection screen to explore more scenarios",
				showContinueButton: true,
				nextStep: null,
			},
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
