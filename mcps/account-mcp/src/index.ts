#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { authTools } from "./tools/authTools.js";
import { profileTools } from "./tools/profileTools.js";

async function main() {
	console.log("Initializing Account MCP Server...");

	const server = new FastMCP({
		name: "TVA Account MCP Server",
		version: "1.0.0",
	});

	const allTools = [...authTools, ...profileTools];
	for (const tool of allTools) server.addTool(tool);

	try {
		await server.start({ transportType: "stdio" });
		console.log("✅ Account MCP Server started successfully over stdio.");
		console.log(`   Tools: ${allTools.map((t) => t.name).join(", ")}`);
	} catch (error) {
		console.error("❌ Failed to start Account MCP Server:", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error("❌ An unexpected error occurred in the Account MCP Server:", error);
	process.exit(1);
});
