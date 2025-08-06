console.log("[WhatsMyToken] Content script loaded");

// Inject a script into the page context to intercept fetch and XMLHttpRequest
const script = document.createElement("script");
script.src = chrome.runtime.getURL("content/all-injected.js");

// Inject the script
(document.head || document.documentElement).appendChild(script);
script.onload = () => script.remove();

// Listen for messages from the injected script
window.addEventListener("message", async (event) => {
	if (event.source !== window) return;
	if (event.data.type !== "WHATSMYTOKEN_TOKEN_CAPTURED") return;

	// Send to background script
	chrome.runtime.sendMessage({
		type: "BEARER_TOKEN_CAPTURED",
		data: {
			...event.data.data,
			domain: window.location.hostname,
			timestamp: Date.now(),
		},
	});
});
