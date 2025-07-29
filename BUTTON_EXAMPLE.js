// Example of how to add buttons to a screenshot step:

const exampleStep = {
	id: "step1",
	type: "interaction",
	title: "Press the Login Button",
	description: "Tap the login button to continue",
	screenAsset: "/assets/screenshots/login-screen.png",
	interactions: [
		{
			id: "login-btn",
			type: "button",
			label: "Login",
			// Position relative to the ORIGINAL image size (baseWidth x baseHeight)
			position: { x: 200, y: 600 },
			size: { width: 120, height: 50 },
			action: "next-step",
		},
		{
			id: "register-btn",
			type: "button",
			label: "Register",
			position: { x: 200, y: 680 },
			size: { width: 120, height: 50 },
			action: "register-action", // Custom action
		},
		{
			id: "forgot-password-link",
			type: "button",
			label: "Forgot Password",
			position: { x: 150, y: 750 },
			size: { width: 200, height: 30 },
			action: "forgot-password",
		},
	],
	nextStep: "step2",
};

// The iPhone component will automatically:
// 1. Scale all positions and sizes to match the current screen size
// 2. Handle button press feedback (tapped animation)
// 3. Call your onInteraction handler when buttons are pressed
