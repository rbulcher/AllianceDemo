/**
 * Dynamic preconnect injection for server URL
 * This runs during the build process to inject the correct server URL for preconnect
 */

// Check if we're in a browser environment and have the server config
if (typeof window !== "undefined") {
	// Get the server URL from our config
	import("./utils/serverConfig.js")
		.then(({ getServerUrl }) => {
			const serverUrl = getServerUrl();

			// Create and inject preconnect link
			const link = document.createElement("link");
			link.rel = "preconnect";
			link.href = serverUrl;

			// Insert after the title tag
			const title = document.querySelector("title");
			if (title && title.parentNode) {
				title.parentNode.insertBefore(link, title.nextSibling);
			}

			console.log("🔗 Preconnect injected for:", serverUrl);
		})
		.catch((err) => {
			console.log("⚠️ Could not inject preconnect:", err.message);
		});
}
