import { initAppWithShadow } from "@extension/shared";
import App from "@src/matches/all/App";

// Skip CSS import for Fast Bearer as we don't need content UI
const inlineCss = "";

initAppWithShadow({ id: "CEB-extension-all", app: <App />, inlineCss });
