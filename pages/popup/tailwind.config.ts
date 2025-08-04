import { withUI } from "@extension/ui";
import baseConfig from "@extension/tailwindcss-config";
import deepmerge from "deepmerge";
import type { Config } from "tailwindcss";

export default withUI(
	deepmerge(baseConfig, {
		content: ["index.html", "src/**/*.tsx"],
	}) as Config
);
