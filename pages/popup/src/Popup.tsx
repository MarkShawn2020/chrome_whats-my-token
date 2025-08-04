import "@src/Popup.css";
import { t } from "@extension/i18n";
import { useStorage, withErrorBoundary, withSuspense } from "@extension/shared";
import type { BearerTokenType } from "@extension/storage";
import { bearerTokenStorage, exampleThemeStorage } from "@extension/storage";
import { cn, ErrorDisplay, LoadingSpinner } from "@extension/ui";
import { useEffect, useMemo, useState } from "react";

const Popup = () => {
	const { isLight } = useStorage(exampleThemeStorage);
	const { tokens } = useStorage(bearerTokenStorage);
	const [filter, setFilter] = useState("");
	const [copiedId, setCopiedId] = useState<string | null>(null);

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
			console.error("Failed to copy:", err);
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
		if (token.length <= 20) return token;
		return `${token.substring(0, 8)}...${token.substring(token.length - 8)}`;
	};

	return (
		<div
			className={cn(
				"min-h-[500px] min-w-[400px] p-4",
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

			<div className="max-h-[400px] space-y-4 overflow-y-auto">
				{tokens.length === 0 ? (
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
									<div className="mb-2 flex items-start justify-between">
										<div className="min-w-0 flex-1">
											<p
												className={cn(
													"truncate font-mono text-xs",
													isLight ? "text-gray-600" : "text-gray-400",
												)}
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
										<button
											onClick={() => copyToClipboard(token.token, token.id)}
											className={cn(
												"ml-2 rounded px-3 py-1 text-xs font-medium transition-all",
												copiedId === token.id
													? "bg-green-500 text-white"
													: isLight
														? "bg-blue-500 text-white hover:bg-blue-600"
														: "bg-blue-600 text-white hover:bg-blue-700",
											)}
										>
											{copiedId === token.id ? "Copied!" : "Copy"}
										</button>
									</div>
									<p
										className={cn(
											"truncate text-xs",
											isLight ? "text-gray-500" : "text-gray-500",
										)}
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

export default withErrorBoundary(
	withSuspense(Popup, <LoadingSpinner />),
	ErrorDisplay,
);
