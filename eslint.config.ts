import type { FixupConfigArray } from "@eslint/compat";
import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import { browser, es2020, node } from "globals";
import {
	config,
	configs as tsConfigs,
	parser as tsParser,
} from "typescript-eslint";

export default config(
	// Basic JavaScript rules only
	js.configs.recommended,
	// TypeScript basic rules (not strict)
	...tsConfigs.recommended,
	// React hooks rules
	...fixupConfigRules(
		new FlatCompat().extends(
			"plugin:react-hooks/recommended",
		) as FixupConfigArray,
	),
	{
		files: ["**/*.{ts,tsx}"],
		...reactPlugin.configs.flat.recommended,
		...reactPlugin.configs.flat["jsx-runtime"],
	},
	// Custom config
	{
		ignores: [
			"**/build/**",
			"**/dist/**",
			"**/node_modules/**",
			"chrome-extension/manifest.js",
		],
	},
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: "latest",
			sourceType: "module",
			parserOptions: {
				ecmaFeatures: { jsx: true },
				projectService: true,
			},
			globals: {
				...browser,
				...es2020,
				...node,
				chrome: "readonly",
			},
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			// React rules - relaxed
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off",
			"react/no-unescaped-entities": "off",
			"react/display-name": "off",
			
			// TypeScript rules - relaxed
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/no-empty-interface": "off",
			"@typescript-eslint/no-inferrable-types": "off",
			"@typescript-eslint/no-var-requires": "off",
			"@typescript-eslint/ban-types": "off",
			
			// General rules - relaxed
			"prefer-const": "warn",
			"no-var": "warn",
			"no-console": "off",
			"no-debugger": "warn",
			"no-empty": "warn",
			"no-unused-vars": "off", // Using TypeScript version instead
		},
		linterOptions: {
			reportUnusedDisableDirectives: "off",
		},
	},
);