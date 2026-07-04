// Library entry point (no side effects) — for the root gateway to mount these tools
// without spawning its own stdio server. The stdio server itself lives in index.ts.
export { authTools } from "./tools/authTools.js";
export { profileTools } from "./tools/profileTools.js";
