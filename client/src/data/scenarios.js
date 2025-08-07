// Scenario data structure for Alliance washing machine demo
import { createVideoAsset, VIDEO_KEYS } from "../utils/videoUtils";

export const scenarios = {
	scenario1: {
		id: "scenario1",
		title: "Help your Customer in Real-Time",
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
				showContinueButton: true,
				autoAdvanceDelay: 1000,
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
		title: "Store Analytics Come to You!",
		description: "Maximize energy savings with smart controls",
		totalSteps: 15,
		estimatedTime: "8-10 minutes",
		steps: [
			{
				id: "step1",
				type: "controller-message",
				title: "Using Insights,",
				description:
					"Have the reports you need delivered to you on your schedule!",
				videoAsset: createVideoAsset(VIDEO_KEYS.SCENARIO2_VIDEO1),
				endFrameAsset: "/assets/videos/scenario2/endFrame1.png",
				showContinueButton: true,
				autoAdvanceDelay: 1000,
				nextStep: "step2",
			},
			{
				id: "step2",
				type: "interaction",
				title: "Subscribe",
				description:
					" to your favorite reports and have them delivered to you!",
				screenAsset: "/assets/screenshots/scenario2/1.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-2",
						type: "image-map",
						label: "Continue",
						position: { x: 274, y: 122 },
						size: { width: 44, height: 23 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step3",
			},
			{
				id: "step3",
				type: "interaction",
				title: "Subscribe",
				description:
					" to your favorite reports and have them delivered to you!",
				screenAsset: "/assets/screenshots/scenario2/2.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-3",
						type: "image-map",
						label: "Continue",
						position: { x: 246, y: 171 },
						size: { width: 257, height: 23 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step4",
			},
			{
				id: "step4",
				type: "interaction",
				title: "Subscribe",
				description:
					" to your favorite reports and have them delivered to you!",
				screenAsset: "/assets/screenshots/scenario2/3.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-4",
						type: "image-map",
						label: "Continue",
						position: { x: 980, y: 143 },
						size: { width: 36, height: 30 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step5",
			},
			{
				id: "step5",
				type: "interaction",
				title: "Subscribe",
				description:
					" to your favorite reports and have them delivered to you!",
				screenAsset: "/assets/screenshots/scenario2/4.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-5",
						type: "image-map",
						label: "Continue",
						position: { x: 580, y: 277 },
						size: { width: 213, height: 33 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step6",
			},
			{
				id: "step6",
				type: "interaction",
				title: "Subscribe",
				description:
					" to your favorite reports and have them delivered to you!",
				screenAsset: "/assets/screenshots/scenario2/5.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-6",
						type: "image-map",
						label: "Continue",
						position: { x: 580, y: 305 },
						size: { width: 214, height: 30 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step7",
			},
			{
				id: "step7",
				type: "interaction",
				title: "Subscribe",
				description:
					" to your favorite reports and have them delivered to you!",
				screenAsset: "/assets/screenshots/scenario2/6.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-7",
						type: "image-map",
						label: "Continue",
						position: { x: 578, y: 332 },
						size: { width: 214, height: 29 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step8",
			},
			{
				id: "step8",
				type: "interaction",
				title: "Subscribe",
				description:
					" to your favorite reports and have them delivered to you!",
				screenAsset: "/assets/screenshots/scenario2/7.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-8",
						type: "image-map",
						label: "Continue",
						position: { x: 579, y: 355 },
						size: { width: 213, height: 29 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step9",
			},
			{
				id: "step9",
				type: "interaction",
				title: "Subscribe",
				description:
					" to your favorite reports and have them delivered to you!",
				screenAsset: "/assets/screenshots/scenario2/8.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-9",
						type: "image-map",
						label: "Continue",
						position: { x: 579, y: 382 },
						size: { width: 214, height: 27 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step10",
			},
			{
				id: "step10",
				type: "interaction",
				title: "Subscribe",
				description:
					" to your favorite reports and have them delivered to you!",
				screenAsset: "/assets/screenshots/scenario2/9.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-10",
						type: "image-map",
						label: "Continue",
						position: { x: 744, y: 409 },
						size: { width: 46, height: 21 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step11",
			},
			{
				id: "step11",
				type: "controller-message",
				title: "Great Work!",
				description: "Now, continue the experience on the TV",
				videoAsset: createVideoAsset(VIDEO_KEYS.SCENARIO2_VIDEO2),
				endFrameAsset: "/assets/videos/scenario2/endFrame2.png",
				showContinueButton: true,
				autoAdvanceDelay: 1000,
				nextStep: "step12",
			},
			{
				id: "step12",
				type: "interaction",
				title: "Open the email",
				description: "from Insights to view your report",
				screenAsset: "/assets/screenshots/scenario2/10.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-12",
						type: "image-map",
						label: "Continue",
						position: { x: 733, y: 124 },
						size: { width: 353, height: 80 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step13",
			},
			{
				id: "step13",
				type: "interaction",
				title: "Open the report",
				description: "provided in the email",
				screenAsset: "/assets/screenshots/scenario2/11.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-13",
						type: "image-map",
						label: "Continue",
						position: { x: 606, y: 210 },
						size: { width: 146, height: 49 },
						action: "next-step",
						indicatorType: "box",
					},
				],
				nextStep: "step14",
			},
			{
				id: "step14",
				type: "interaction",
				title: "Review Report",
				description: "Scroll through the full report to review the data",
				screenAsset: "/assets/screenshots/scenario2/12.png",
				useImageMapper: true,
				layoutType: "laptop",
				scrollableReport: {
					reportImage: "/assets/screenshots/scenario2/report_1.png",
					viewportBounds: { x: 290, y: 140, width: 580, height: 413 }, // Adjusted x and width to capture side content
					scrollCompleteThreshold: 0.98, // User must scroll to 90% to complete
					interactionButton: {
						position: { x: 1022, y: 551 },
						size: { width: 297, height: 141 },
					},
				},
				interactions: [
					{
						id: "report-complete",
						type: "scroll-complete",
						label: "Continue",
						action: "next-step",

						showAfterScroll: true,
					},
				],
				nextStep: "step15",
			},
			{
				id: "step15",
				type: "controller-message",
				title: "Great Work!",
				description: "Now, continue the experience on the TV",
				videoAsset: createVideoAsset(VIDEO_KEYS.SCENARIO2_VIDEO3),
				endFrameAsset: "/assets/videos/scenario2/endFrame3.png",
				showContinueButton: true,
				autoAdvanceDelay: 1000,
				nextStep: null,
			},
		],
	},
	scenario3: {
		id: "scenario3",
		title: "View Your Revenue and KPI's",
		description: "Monitor and control multiple laundry locations",
		totalSteps: 14,
		estimatedTime: "10-12 minutes",
		steps: [
			// Will be populated with steps similar to scenario1
		],
	},
	scenario4: {
		id: "scenario4",
		title: "Acquire and Retain Customers",
		description: "Proactive maintenance and troubleshooting",
		totalSteps: 24,
		estimatedTime: "10-12 minutes",
		steps: [
			{
				id: "step1",
				type: "controller-message",
				title: "Encourage Customer Loyalty",
				description: "And repeat business by using the CRM feature",
				videoAsset: createVideoAsset(VIDEO_KEYS.SCENARIO4_VIDEO1),
				endFrameAsset: "/assets/videos/scenario4/endFrame1.png",
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
						position: { x: 459, y: 91 },
						size: { width: 40, height: 27 },
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
						position: { x: 271, y: 114 },
						size: { width: 42, height: 24 },
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
						position: { x: 1095, y: 144 },
						size: { width: 37, height: 25 },
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
						position: { x: 350, y: 200 },
						size: { width: 106, height: 72 },
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
						position: { x: 242, y: 287 },
						size: { width: 886, height: 60 },
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
						position: { x: 243, y: 343 },
						size: { width: 885, height: 38 },
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
						position: { x: 599, y: 293 },
						size: { width: 146, height: 60 },
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
						position: { x: 757, y: 360 },
						size: { width: 33, height: 21 },
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
						position: { x: 243, y: 377 },
						size: { width: 884, height: 41 },
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
						position: { x: 245, y: 394 },
						size: { width: 256, height: 90 },
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
						position: { x: 253, y: 408 },
						size: { width: 255, height: 24 },
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
						position: { x: 241, y: 440 },
						size: { width: 887, height: 55 },
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
						position: { x: 245, y: 420 },
						size: { width: 256, height: 71 },
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
						position: { x: 242, y: 506 },
						size: { width: 264, height: 38 },
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
				description:
					"Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/15.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-15",
						type: "image-map",
						label: "Continue",
						position: { x: 240, y: 451 },
						size: { width: 888, height: 58 },
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
				description:
					"Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/16.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-16",
						type: "image-map",
						label: "Continue",
						position: { x: 579, y: 305 },
						size: { width: 214, height: 36 },
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
				description:
					"Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/17.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-17",
						type: "image-map",
						label: "Continue",
						position: { x: 581, y: 337 },
						size: { width: 209, height: 22 },
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
				description:
					"Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/18.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-18",
						type: "image-map",
						label: "Continue",
						position: { x: 578, y: 326 },
						size: { width: 210, height: 33 },
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
				description:
					"Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/19.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-19",
						type: "image-map",
						label: "Continue",
						position: { x: 580, y: 355 },
						size: { width: 209, height: 30 },
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
				description:
					"Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/20.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-19",
						type: "image-map",
						label: "Continue",
						position: { x: 753, y: 385 },
						size: { width: 38, height: 24 },
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
				description:
					"Create a promotion code and decide how long you want the code to last",
				screenAsset: "/assets/screenshots/scenario4/21.png",
				useImageMapper: true,
				layoutType: "laptop",
				interactions: [
					{
						id: "laptop-interaction-19",
						type: "image-map",
						label: "Continue",
						position: { x: 278, y: 514 },
						size: { width: 70, height: 23 },
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
				videoAsset: createVideoAsset(VIDEO_KEYS.SCENARIO4_VIDEO2),
				endFrameAsset: "/assets/videos/scenario4/endFrame2.png",
				showContinueButton: true,
				autoAdvanceDelay: 1000,
				nextStep: "step24",
			},
			{
				id: "step24",
				type: "controller-message",
				title: "Thank You!",
				description:
					"Continue to the scene selection screen to explore more scenarios",
				endFrameAsset: "/assets/videos/scenario4/endFrame2.png",
				showContinueButton: true,
				nextStep: null,
			},
		],
	},
	scenario5: {
		id: "scenario5",
		title: "Know and Control your Machines",
		description: "Analyze performance data and optimize operations",
		totalSteps: 11,
		estimatedTime: "8-10 minutes",
		steps: [
			// Will be populated with steps similar to scenario1
		],
	},
	scenario6: {
		id: "scenario6",
		title: "Dynamically Adjust Machine Pricing",
		description: "Optimize pricing based on demand and usage patterns",
		totalSteps: 1,
		estimatedTime: "5-8 minutes",
		steps: [
			// Will be populated with steps later
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
