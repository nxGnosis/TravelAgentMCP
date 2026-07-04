#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { immigrationContentTools } from "./tools/immigrationContentTools.js";
import { immigrationBookingTools } from "./tools/immigrationBookingTools.js";

async function main() {
	console.log("Initializing Immigration MCP Server...");

	const server = new FastMCP({
		name: "TVA Immigration MCP Server",
		version: "1.0.0",
	});

	for (const tool of [...immigrationContentTools, ...immigrationBookingTools]) {
		server.addTool(tool);
	}

	try {
		await server.start({ transportType: "stdio" });
		console.log("✅ Immigration MCP Server started successfully over stdio.");
		console.log(
			`   Tools: ${[...immigrationContentTools, ...immigrationBookingTools].map((t) => t.name).join(", ")}`,
		);
	} catch (error) {
		console.error("❌ Failed to start Immigration MCP Server:", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error("❌ An unexpected error occurred in the Immigration MCP Server:", error);
	process.exit(1);
});
