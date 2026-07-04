#!/usr/bin/env node
/**
 * travelagent-mcp — gateway server.
 *
 * TravelAgentMCP is a monorepo of five focused MCP servers, each independently
 * runnable (see mcps/*). This root package mounts every tool from all five
 * into one process for simple, all-in-one deployments and for backward
 * compatibility with earlier versions of this package, which published a
 * single stdio server.
 *
 * For finer-grained deployments (e.g. exposing only flight+hotel search to a
 * booking widget, or only visa+immigration to an advisory bot) run the
 * individual mcps/* binaries instead — see each package's README.
 */
import { FastMCP } from "fastmcp";
import { visaContentTools, visaBookingTools } from "@travelagent-mcp/visa-mcp/tools";
import { immigrationContentTools, immigrationBookingTools } from "@travelagent-mcp/immigration-mcp/tools";
import { flightSearchTools, flightOfferTools, flightBookingTools } from "@travelagent-mcp/flight-mcp/tools";
import { hotelSearchTools, hotelBookingTools } from "@travelagent-mcp/hotel-mcp/tools";
import { authTools, profileTools } from "@travelagent-mcp/account-mcp/tools";

async function main() {
	console.log("Initializing TravelAgentMCP Gateway Server...");

	const server = new FastMCP({
		name: "TravelAgentMCP Gateway",
		version: "2.0.0",
	});

	const allTools = [
		...visaContentTools,
		...visaBookingTools,
		...immigrationContentTools,
		...immigrationBookingTools,
		...flightSearchTools,
		...flightOfferTools,
		...flightBookingTools,
		...hotelSearchTools,
		...hotelBookingTools,
		...authTools,
		...profileTools,
	];

	for (const tool of allTools) server.addTool(tool);

	try {
		await server.start({ transportType: "stdio" });
		console.log(`✅ TravelAgentMCP Gateway started over stdio with ${allTools.length} tools.`);
		console.log(`   Domains: visa, immigration, flight, hotel, account`);
	} catch (error) {
		console.error("❌ Failed to start TravelAgentMCP Gateway:", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error("❌ An unexpected error occurred in the TravelAgentMCP Gateway:", error);
	process.exit(1);
});
