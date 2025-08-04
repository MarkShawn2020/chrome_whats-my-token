import "@src/Popup.css";
import { t } from "@extension/i18n";
import { useStorage, withErrorBoundary, withSuspense } from "@extension/shared";
import type { BearerTokenType } from "@extension/storage";
import { bearerTokenStorage, exampleThemeStorage } from "@extension/storage";
import { cn, ErrorDisplay, LoadingSpinner } from "@extension/ui";
import { useEffect, useMemo, useState } from "react";

// Separate component to handle data loading with Suspense
const PopupContent = () => {
	const { isLight } = useStorage(exampleThemeStorage);
	const { tokens } = useStorage(bearerTokenStorage);
	const [filter, setFilter] = useState("");
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [expandedTokens, setExpandedTokens] = useState<string[]>([]);

	// Filter tokens by domain
	const filteredTokens = useMemo(() => {
		if (!filter) return tokens;
		return tokens.filter(
			(token) =>
				token.domain.toLowerCase().includes(filter.toLowerCase()) ||
				token.url.toLowerCase().includes(filter.toLowerCase()),
		);
	}, [tokens, filter]);

	// Group requests by token value
	const groupedByToken = useMemo(() => {
		const groups: Record<string, BearerTokenType[]> = {};
		filteredTokens.forEach((request) => {
			if (!groups[request.token]) {
				groups[request.token] = [];
			}
			groups[request.token].push(request);
		});
		// Sort each group by timestamp (newest first)
		Object.values(groups).forEach(group => {
			group.sort((a, b) => b.timestamp - a.timestamp);
		});
		return groups;
	}, [filteredTokens]);

	const copyToClipboard = async (token: string, id: string) => {
		try {
			await navigator.clipboard.writeText(token);
			setCopiedId(id);
			setTimeout(() => setCopiedId(null), 2000);
		} catch (err) {
			// Fallback for older browsers or permission issues
			try {
				const textArea = document.createElement("textarea");
				textArea.value = token;
				textArea.style.position = "fixed";
				textArea.style.left = "-999999px";
				document.body.appendChild(textArea);
				textArea.select();
				document.execCommand("copy");
				document.body.removeChild(textArea);
				setCopiedId(id);
				setTimeout(() => setCopiedId(null), 2000);
			} catch (fallbackErr) {
				console.error("Failed to copy:", err, fallbackErr);
			}
		}
	};

	const clearAllTokens = async () => {
		if (confirm("Clear all captured tokens?")) {
			await bearerTokenStorage.clearTokens();
		}
	};

	const formatTime = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString();
	};

	const truncateToken = (token: string) => {
		if (token.length <= 30) return token;
		return `${token.substring(0, 12)}...${token.substring(token.length - 12)}`;
	};

	return (
		<div
			className={cn(
				"flex h-full w-full flex-col p-4",
				isLight ? "bg-white" : "bg-gray-900",
			)}
		>
			<header className="mb-4">
				<h1
					className={cn(
						"mb-2 text-xl font-bold",
						isLight ? "text-gray-900" : "text-gray-100",
					)}
				>
					WhatsMyToken
				</h1>
				<p
					className={cn(
						"mb-4 text-sm",
						isLight ? "text-gray-600" : "text-gray-400",
					)}
				>
					Captured authentication tokens from network requests
				</p>

				<div className="mb-4 flex gap-2">
					<input
						type="text"
						placeholder="Filter by domain..."
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						className={cn(
							"flex-1 rounded border px-3 py-2 text-sm",
							isLight
								? "border-gray-300 bg-white text-gray-900"
								: "border-gray-700 bg-gray-800 text-gray-100",
						)}
					/>
					<button
						onClick={clearAllTokens}
						disabled={tokens.length === 0}
						className={cn(
							"rounded px-4 py-2 text-sm font-medium transition-colors",
							tokens.length === 0
								? "cursor-not-allowed opacity-50"
								: "hover:opacity-90",
							isLight ? "bg-red-500 text-white" : "bg-red-600 text-white",
						)}
					>
						Clear All
					</button>
				</div>
			</header>

			<div className="flex-1 space-y-4 overflow-y-auto pr-2">
				{tokens.length === 0 ? (
					<div
						className={cn(
							"py-8 text-center",
							isLight ? "text-gray-500" : "text-gray-400",
						)}
					>
						<p>No tokens captured yet.</p>
						<p className="mt-2 text-sm">
							Browse websites that use token-based authentication.
						</p>
					</div>
				) : Object.entries(groupedByToken).length === 0 ? (
					<div
						className={cn(
							"py-8 text-center",
							isLight ? "text-gray-500" : "text-gray-400",
						)}
					>
						<p>No tokens match your filter.</p>
					</div>
				) : (
					<div className="space-y-2">
						{Object.entries(groupedByToken).map(([tokenValue, requests], index) => {
							// Get unique domains for this token
							const uniqueDomains = [...new Set(requests.map(r => r.domain))];
							const tokenId = `token-${index}`;
							const isExpanded = expandedTokens.includes(tokenId);
							
							return (
								<div
									key={tokenId}
									className={cn(
										"rounded border overflow-hidden",
										isLight
											? "border-gray-200 bg-gray-50"
											: "border-gray-700 bg-gray-800",
									)}
								>
									<button
										onClick={() => {
											setExpandedTokens(prev => 
												isExpanded 
													? prev.filter(id => id !== tokenId)
													: [...prev, tokenId]
											);
										}}
										className="w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-80 transition-all"
									>
										<div className="min-w-0 flex-1 text-left">
											<p
												className={cn(
													"truncate font-mono text-sm",
													isLight ? "text-gray-700" : "text-gray-300",
												)}
												title={tokenValue}
											>
												{truncateToken(tokenValue)}
											</p>
											<p
												className={cn(
													"mt-1 text-xs",
													isLight ? "text-gray-500" : "text-gray-500",
												)}
											>
												{requests.length} request{requests.length > 1 ? 's' : ''} • {uniqueDomains.join(', ')}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<button
												onClick={(e) => {
													e.stopPropagation();
													copyToClipboard(tokenValue, tokenId);
												}}
												className={cn(
													"flex-shrink-0 rounded px-3 py-1 text-xs font-medium transition-all",
													copiedId === tokenId
														? "bg-green-500 text-white"
														: isLight
															? "bg-blue-500 text-white hover:bg-blue-600"
															: "bg-blue-600 text-white hover:bg-blue-700",
												)}
												title="Copy token to clipboard"
											>
												{copiedId === tokenId ? "Copied!" : "Copy"}
											</button>
											<svg
												className={cn(
													"h-4 w-4 transition-transform",
													isExpanded ? "rotate-180" : "",
													isLight ? "text-gray-600" : "text-gray-400"
												)}
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
											</svg>
										</div>
									</button>
									{isExpanded && (
										<div className="px-4 pb-3 border-t border-gray-200 dark:border-gray-700">
											<div className="space-y-2 mt-3">
												{requests.map((request) => (
													<div
														key={request.id}
														className={cn(
															"rounded border p-2",
															isLight
																? "border-gray-300 bg-white"
																: "border-gray-600 bg-gray-900",
														)}
													>
														<div className="flex items-start justify-between gap-2">
															<div className="min-w-0 flex-1">
																<p
																	className={cn(
																		"text-sm font-medium",
																		isLight ? "text-gray-700" : "text-gray-300",
																	)}
																>
																	{request.domain}
																</p>
																<p
																	className={cn(
																		"mt-1 truncate text-xs",
																		isLight ? "text-gray-500" : "text-gray-500",
																	)}
																	title={request.url}
																>
																	{request.method} {request.url}
																</p>
																<p
																	className={cn(
																		"mt-1 text-xs",
																		isLight ? "text-gray-400" : "text-gray-600",
																	)}
																>
																	{formatTime(request.timestamp)}
																</p>
															</div>
														</div>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

// Fast initial render wrapper to avoid popup delay
const Popup = () => {
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		// Small delay to ensure smooth popup opening
		const timer = setTimeout(() => setIsReady(true), 10);
		return () => clearTimeout(timer);
	}, []);

	if (!isReady) {
		return (
			<div className="flex h-full w-full items-center justify-center bg-white dark:bg-gray-900">
				<LoadingSpinner />
			</div>
		);
	}

	return <PopupContent />;
};

export default withErrorBoundary(
	withSuspense(Popup, <LoadingSpinner />),
	ErrorDisplay,
);
