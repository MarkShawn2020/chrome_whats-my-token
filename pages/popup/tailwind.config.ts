import { withUI } from "@extension/ui";
import baseConfig from "@extension/tailwindcss-config";
import deepmerge from "deepmerge";

export default withUI(
	deepmerge(baseConfig, {
		content: ["index.html", "src/**/*.tsx"],
	})
);
