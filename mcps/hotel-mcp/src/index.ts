#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { hotelSearchTools } from "./tools/hotelSearchTools.js";
import { hotelBookingTools } from "./tools/hotelBookingTools.js";

async function main() {
	console.log("Initializing Hotel MCP Server...");

	const server = new FastMCP({
		name: "TVA Hotel MCP Server",
		version: "1.0.0",
	});

	const allTools = [...hotelSearchTools, ...hotelBookingTools];
	for (const tool of allTools) server.addTool(tool);

	try {
		await server.start({ transportType: "stdio" });
		console.log("✅ Hotel MCP Server started successfully over stdio.");
		console.log(`   Tools: ${allTools.map((t) => t.name).join(", ")}`);
	} catch (error) {
		console.error("❌ Failed to start Hotel MCP Server:", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error("❌ An unexpected error occurred in the Hotel MCP Server:", error);
	process.exit(1);
});
