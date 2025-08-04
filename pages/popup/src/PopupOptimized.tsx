import "@src/Popup.css";
import { t } from "@extension/i18n";
import type { BearerTokenType, BearerTokensStateType } from "@extension/storage";
import { bearerTokenStorage, exampleThemeStorage } from "@extension/storage";
import { cn, Button, Switch, Tabs, TabsList, TabsTrigger, TabsContent } from "@extension/ui";
import { useEffect, useMemo, useState } from "react";

// Direct storage access without Suspense for faster initial load
const useDirectStorage = <T,>(
	storage: { get: () => Promise<T>; subscribe: (callback: () => void) => () => void },
	initialValue: T,
) => {
	const [data, setData] = useState<T>(initialValue);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Load initial data
		storage.get().then((value) => {
			setData(value);
			setLoading(false);
		});

		// Subscribe to updates
		const unsubscribe = storage.subscribe(() => {
			storage.get().then(setData);
		});

		return unsubscribe;
	}, [storage]);

	return { data, loading };
};

const PopupOptimized = () => {
	const { data: themeData } = useDirectStorage(exampleThemeStorage, { isLight: true });
	const { data: tokenData, loading } = useDirectStorage<BearerTokensStateType>(
		bearerTokenStorage,
		{ tokens: [] },
	);

	const [filter, setFilter] = useState("");
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [expandedTokens, setExpandedTokens] = useState<string[]>([]);
	const [showCurrentDomain, setShowCurrentDomain] = useState(false);
	const [currentDomain, setCurrentDomain] = useState<string>("");

	const isLight = themeData.isLight;
	const tokens = tokenData.tokens || [];

	// Get current tab domain
	useEffect(() => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]?.url) {
				try {
					const url = new URL(tabs[0].url);
					setCurrentDomain(url.hostname);
				} catch (e) {
					// Invalid URL, keep empty domain
					setCurrentDomain("");
				}
			}
		});
	}, []);

	// Filter tokens by domain
	const filteredTokens = useMemo(() => {
		let filtered = tokens;
		
		// Apply domain filter if showCurrentDomain is true
		if (showCurrentDomain && currentDomain) {
			filtered = filtered.filter(token => token.domain === currentDomain);
		}
		
		// Apply search filter
		if (filter) {
			filtered = filtered.filter(
				(token) =>
					token.domain.toLowerCase().includes(filter.toLowerCase()) ||
					token.url.toLowerCase().includes(filter.toLowerCase()),
			);
		}
		
		return filtered;
	}, [tokens, filter, showCurrentDomain, currentDomain]);

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
					Fast Bearer
				</h1>
				<p
					className={cn(
						"mb-4 text-sm",
						isLight ? "text-gray-600" : "text-gray-400",
					)}
				>
					Captured Bearer tokens from network requests
				</p>

				<div className="mb-4 space-y-3">
					<div className="flex gap-2">
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
						<Button
							onClick={clearAllTokens}
							disabled={tokens.length === 0}
							variant="destructive"
							size="sm"
						>
							Clear All
						</Button>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<label
								htmlFor="domain-filter"
								className={cn(
									"text-sm font-medium",
									isLight ? "text-gray-700" : "text-gray-300"
								)}
							>
								Show:
							</label>
							<div className="flex items-center gap-2">
								<span className={cn(
									"text-sm",
									showCurrentDomain
										? isLight ? "text-gray-900 font-medium" : "text-gray-100 font-medium"
										: isLight ? "text-gray-500" : "text-gray-500"
								)}>
									Current
								</span>
								<Switch
									id="domain-filter"
									checked={!showCurrentDomain}
									onCheckedChange={(checked) => setShowCurrentDomain(!checked)}
									className="data-[state=checked]:bg-blue-600"
								/>
								<span className={cn(
									"text-sm",
									!showCurrentDomain
										? isLight ? "text-gray-900 font-medium" : "text-gray-100 font-medium"
										: isLight ? "text-gray-500" : "text-gray-500"
								)}>
									All Domains
								</span>
							</div>
						</div>
						{showCurrentDomain && currentDomain && (
							<span className={cn(
								"text-xs",
								isLight ? "text-gray-500" : "text-gray-500"
							)}>
								{currentDomain}
							</span>
						)}
					</div>
				</div>
			</header>

			<Tabs defaultValue="requests" className="flex-1 flex flex-col">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="requests">Requests</TabsTrigger>
					<TabsTrigger value="tokens">Tokens</TabsTrigger>
				</TabsList>
				
				<TabsContent value="requests" className="flex-1 overflow-y-auto pr-2 mt-0">
				{loading ? (
					<div
						className={cn(
							"py-8 text-center",
							isLight ? "text-gray-500" : "text-gray-400",
						)}
					>
						<p>Loading...</p>
					</div>
				) : tokens.length === 0 ? (
					<div
						className={cn(
							"py-8 text-center",
							isLight ? "text-gray-500" : "text-gray-400",
						)}
					>
						<p>No tokens captured yet.</p>
						<p className="mt-2 text-sm">
							Browse websites that use Bearer authentication.
						</p>
					</div>
				) : filteredTokens.length === 0 ? (
					<div
						className={cn(
							"py-8 text-center",
							isLight ? "text-gray-500" : "text-gray-400",
						)}
					>
						{showCurrentDomain && currentDomain ? (
							<>
								<p>No tokens found for {currentDomain}</p>
								<p className="mt-2 text-sm">
									Switch to "All Domains" to see tokens from other sites.
								</p>
							</>
						) : (
							<p>No tokens match your filter.</p>
						)}
					</div>
				) : (
					<div className="space-y-2">
						{filteredTokens
							.sort((a, b) => b.timestamp - a.timestamp)
							.map((request) => {
							
								return (
									<div
										key={request.id}
										className={cn(
											"rounded border p-3",
											isLight
												? "border-gray-200 bg-gray-50"
												: "border-gray-700 bg-gray-800",
										)}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2">
													<p
														className={cn(
															"text-sm font-medium",
															isLight ? "text-gray-700" : "text-gray-300",
														)}
													>
														{request.domain}
													</p>
													<span
														className={cn(
															"px-2 py-0.5 text-xs rounded-full font-mono",
															isLight ? "bg-blue-100 text-blue-700" : "bg-blue-900 text-blue-200",
														)}
													>
														Bearer
													</span>
												</div>
												<p
													className={cn(
														"mt-1 truncate text-xs font-mono",
														isLight ? "text-gray-600" : "text-gray-400",
													)}
													title={request.token}
												>
													{truncateToken(request.token)}
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
											<Button
												onClick={() => copyToClipboard(request.token, request.id)}
												variant={copiedId === request.id ? "secondary" : "default"}
												size="sm"
												className="h-7 px-2 text-xs"
												title="Copy token to clipboard"
											>
												{copiedId === request.id ? "Copied!" : "Copy"}
											</Button>
										</div>
									</div>
								);
							})}
					</div>
				)}
			</TabsContent>
			
			<TabsContent value="tokens" className="flex-1 overflow-y-auto pr-2 mt-0">
				{loading ? (
					<div
						className={cn(
							"py-8 text-center",
							isLight ? "text-gray-500" : "text-gray-400",
						)}
					>
						<p>Loading...</p>
					</div>
				) : tokens.length === 0 ? (
					<div
						className={cn(
							"py-8 text-center",
							isLight ? "text-gray-500" : "text-gray-400",
						)}
					>
						<p>No tokens captured yet.</p>
						<p className="mt-2 text-sm">
							Browse websites that use Bearer authentication.
						</p>
					</div>
				) : Object.entries(groupedByToken).length === 0 ? (
					<div
						className={cn(
							"py-8 text-center",
							isLight ? "text-gray-500" : "text-gray-400",
						)}
					>
						{showCurrentDomain && currentDomain ? (
							<>
								<p>No tokens found for {currentDomain}</p>
								<p className="mt-2 text-sm">
									Switch to "All Domains" to see tokens from other sites.
								</p>
							</>
						) : (
							<p>No tokens match your filter.</p>
						)}
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
											<Button
												onClick={(e) => {
													e.stopPropagation();
													copyToClipboard(tokenValue, tokenId);
												}}
												variant={copiedId === tokenId ? "secondary" : "default"}
												size="sm"
												className="h-7 px-2 text-xs"
												title="Copy token to clipboard"
											>
												{copiedId === tokenId ? "Copied!" : "Copy"}
											</Button>
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
			</TabsContent>
		</Tabs>
		</div>
	);
};

export default PopupOptimized;