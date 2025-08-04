import "webextension-polyfill";
import type { BearerTokenType } from "@extension/storage";
import { bearerTokenStorage } from "@extension/storage";

// Keep service worker active
chrome.runtime.onInstalled.addListener(() => {
	console.log("Fast Bearer extension installed");
});

// Prevent service worker from going idle
chrome.alarms.create("keep-alive", { periodInMinutes: 0.25 });
chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name === "keep-alive") {
		// Keep-alive ping
	}
});

// Generate unique ID for each token
function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Extract domain from URL
function getDomainFromUrl(url: string): string {
	try {
		const urlObj = new URL(url);
		return urlObj.hostname;
	} catch {
		return "unknown";
	}
}

// Listen for web requests and extract Bearer tokens
chrome.webRequest.onBeforeSendHeaders.addListener(
	(details) => {
		if (!details.requestHeaders) return;

		// Look for Authorization header
		const authHeader = details.requestHeaders.find(
			(header) => header.name.toLowerCase() === "authorization",
		);

		if (authHeader && authHeader.value) {
			// Check if it's a Bearer token
			const bearerMatch = authHeader.value.match(/^Bearer\s+(.+)$/i);
			if (bearerMatch && bearerMatch[1]) {
				const token = bearerMatch[1];
				const domain = getDomainFromUrl(details.url);

				// Create token object
				const bearerToken: BearerTokenType = {
					id: generateId(),
					token,
					domain,
					url: details.url,
					timestamp: Date.now(),
					method: details.method,
					headers: Object.fromEntries(
						details.requestHeaders
							.filter((h) => h.name.toLowerCase() !== "authorization")
							.map((h) => [h.name, h.value || ""]),
					),
				};

				// Store the token
				bearerTokenStorage.addToken(bearerToken).catch(console.error);
			}
		}
	},
	{ urls: ["<all_urls>"] },
	["requestHeaders"],
);

// Handle messages from content script
chrome.runtime.onMessage.addListener(async (message, sender) => {
	if (message.type === "BEARER_TOKEN_CAPTURED" && message.data) {
		const { token, domain, url, method, timestamp } = message.data;

		const bearerToken: BearerTokenType = {
			id: generateId(),
			token,
			domain,
			url,
			timestamp,
			method,
		};

		await bearerTokenStorage.addToken(bearerToken);
	}
});

console.log("Fast Bearer background service loaded");
