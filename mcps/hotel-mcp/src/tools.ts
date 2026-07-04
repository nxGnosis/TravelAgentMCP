// Library entry point (no side effects) — for the root gateway to mount these tools
// without spawning its own stdio server. The stdio server itself lives in index.ts.
export { hotelSearchTools } from "./tools/hotelSearchTools.js";
export { hotelBookingTools } from "./tools/hotelBookingTools.js";
