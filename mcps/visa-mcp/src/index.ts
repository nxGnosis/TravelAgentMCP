#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { visaContentTools } from "./tools/visaContentTools.js";
import { visaBookingTools } from "./tools/visaBookingTools.js";

async function main() {
	console.log("Initializing Visa MCP Server...");

	const server = new FastMCP({
		name: "TVA Visa MCP Server",
		version: "1.0.0",
	});

	for (const tool of [...visaContentTools, ...visaBookingTools]) {
		server.addTool(tool);
	}

	try {
		await server.start({ transportType: "stdio" });
		console.log("✅ Visa MCP Server started successfully over stdio.");
		console.log(
			`   Tools: ${[...visaContentTools, ...visaBookingTools].map((t) => t.name).join(", ")}`,
		);
	} catch (error) {
		console.error("❌ Failed to start Visa MCP Server:", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error("❌ An unexpected error occurred in the Visa MCP Server:", error);
	process.exit(1);
});
