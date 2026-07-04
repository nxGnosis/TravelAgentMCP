#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { flightSearchTools } from "./tools/flightSearchTools.js";
import { flightOfferTools } from "./tools/flightOfferTools.js";
import { flightBookingTools } from "./tools/flightBookingTools.js";

async function main() {
	console.log("Initializing Flight MCP Server...");

	const server = new FastMCP({
		name: "TVA Flight MCP Server",
		version: "1.0.0",
	});

	const allTools = [...flightSearchTools, ...flightOfferTools, ...flightBookingTools];
	for (const tool of allTools) server.addTool(tool);

	try {
		await server.start({ transportType: "stdio" });
		console.log("✅ Flight MCP Server started successfully over stdio.");
		console.log(`   Tools: ${allTools.map((t) => t.name).join(", ")}`);
	} catch (error) {
		console.error("❌ Failed to start Flight MCP Server:", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error("❌ An unexpected error occurred in the Flight MCP Server:", error);
	process.exit(1);
});
