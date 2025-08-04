import { createStorage, StorageEnum } from "../base/index.js";
import type { BaseStorageType } from "../base/types.js";

export interface BearerTokenType {
	id: string;
	token: string;
	domain: string;
	url: string;
	timestamp: number;
	method: string;
	headers?: Record<string, string>;
}

export interface BearerTokensStateType {
	tokens: BearerTokenType[];
}

export type BearerTokenStorageType = BaseStorageType<BearerTokensStateType> & {
	addToken: (token: BearerTokenType) => Promise<void>;
	removeToken: (id: string) => Promise<void>;
	clearTokens: () => Promise<void>;
	getTokensByDomain: (domain: string) => Promise<BearerTokenType[]>;
};

const storage = createStorage<BearerTokensStateType>(
	"bearer-tokens-storage",
	{
		tokens: [],
	},
	{
		storageEnum: StorageEnum.Local,
		liveUpdate: true,
	},
);

export const bearerTokenStorage: BearerTokenStorageType = {
	...storage,
	addToken: async (token: BearerTokenType) => {
		await storage.set((currentState) => {
			// Keep all requests without deduplication
			return {
				tokens: [...currentState.tokens, token],
			};
		});
	},
	removeToken: async (id: string) => {
		await storage.set((currentState) => ({
			tokens: currentState.tokens.filter((token) => token.id !== id),
		}));
	},
	clearTokens: async () => {
		await storage.set({ tokens: [] });
	},
	getTokensByDomain: async (domain: string) => {
		const state = await storage.get();
		return state.tokens.filter((token) => token.domain === domain);
	},
};
