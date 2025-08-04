import "@src/Popup.css";
import { t } from "@extension/i18n";
import type { BearerTokenType, BearerTokensStateType } from "@extension/storage";
import { bearerTokenStorage, exampleThemeStorage } from "@extension/storage";
import { cn, Button } from "@extension/ui";
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

	const isLight = themeData.isLight;
	const tokens = tokenData.tokens || [];

	// Filter tokens by domain
	const filteredTokens = useMemo(() => {
		if (!filter) return tokens;
		return tokens.filter(
			(token) =>
				token.domain.toLowerCase().includes(filter.toLowerCase()) ||
				token.url.toLowerCase().includes(filter.toLowerCase()),
		);
	}, [tokens, filter]);

	// Group tokens by domain
	const groupedTokens = useMemo(() => {
		const groups: Record<string, BearerTokenType[]> = {};
		filteredTokens.forEach((token) => {
			if (!groups[token.domain]) {
				groups[token.domain] = [];
			}
			groups[token.domain].push(token);
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
					<Button
						onClick={clearAllTokens}
						disabled={tokens.length === 0}
						variant="destructive"
						size="sm"
					>
						Clear All
					</Button>
				</div>
			</header>

			<div className="flex-1 space-y-4 overflow-y-auto pr-2">
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
				) : Object.entries(groupedTokens).length === 0 ? (
					<div
						className={cn(
							"py-8 text-center",
							isLight ? "text-gray-500" : "text-gray-400",
						)}
					>
						<p>No tokens match your filter.</p>
					</div>
				) : (
					Object.entries(groupedTokens).map(([domain, domainTokens]) => (
						<div key={domain} className="space-y-2">
							<h3
								className={cn(
									"text-sm font-semibold",
									isLight ? "text-gray-700" : "text-gray-300",
								)}
							>
								{domain}
							</h3>
							{domainTokens.map((token) => (
								<div
									key={token.id}
									className={cn(
										"rounded border p-3",
										isLight
											? "border-gray-200 bg-gray-50"
											: "border-gray-700 bg-gray-800",
									)}
								>
									<div className="mb-2 flex items-start justify-between gap-2">
										<div className="min-w-0 flex-1 overflow-hidden">
											<p
												className={cn(
													"truncate font-mono text-xs",
													isLight ? "text-gray-600" : "text-gray-400",
												)}
												title={token.token}
											>
												{truncateToken(token.token)}
											</p>
											<p
												className={cn(
													"mt-1 text-xs",
													isLight ? "text-gray-500" : "text-gray-500",
												)}
											>
												{token.method} • {formatTime(token.timestamp)}
											</p>
										</div>
										<Button
											onClick={() => copyToClipboard(token.token, token.id)}
											variant={copiedId === token.id ? "secondary" : "default"}
											size="sm"
											className="h-7 px-2 text-xs"
											title="Copy token to clipboard"
										>
											{copiedId === token.id ? "Copied!" : "Copy"}
										</Button>
									</div>
									<p
										className={cn(
											"truncate text-xs",
											isLight ? "text-gray-500" : "text-gray-500",
										)}
										title={token.url}
									>
										{token.url}
									</p>
								</div>
							))}
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default PopupOptimized;