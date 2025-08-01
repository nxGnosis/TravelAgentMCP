#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { getImmigrationInfoByCountry } from "./tools/immigration-tools/getimmigrationByCountry.js";
import { getVisaInfoByCountry } from "./tools/visa-tools/getVisaInfoByCountry.js";

async function main() {
	console.log("Initializing Travel Agent MCP Server...");

	const server = new FastMCP({
		name: "Travel Agent MCP Server",
		version: "1.0.1",
	});

	// Add Visa tools
	server.addTool(getVisaInfoByCountry);

	//Add Immigration tools
	server.addTool(getImmigrationInfoByCountry);

	try {
		await server.start({
			transportType: "stdio",
		});
		console.log("✅ Travel Agent MCP Server started successfully over stdio.");
		console.log("   You can now connect to it using an MCP client.");
		console.log(
			"   Available tools: GET_VISA_INFO_BY_COUNTRY, GET_IMMIGRATION_INFO_BY_COUNTRY",
		);
	} catch (error) {
		console.error("❌ Failed to start Travel Agent MCP Server:", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(
		"❌ An unexpected error occurred in the Telegram MCP Server:",
		error,
	);
	process.exit(1);
});
