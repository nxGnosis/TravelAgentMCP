import type { z } from "zod";
import { AuthRequiredError, GuardrailError, TvaApiError } from "./errors.js";
import { checkRateLimit } from "./guardrails.js";
import { getTvaConfig } from "./config.js";

export interface ToolDef<Params> {
	name: string;
	description: string;
	parameters: z.ZodType<Params>;
	/** Override the default per-process rate limit for this specific tool. */
	rateLimit?: { max: number; windowMs: number };
	execute: (params: Params) => Promise<string>;
}

export interface FastMcpTool<Params> {
	name: string;
	description: string;
	parameters: z.ZodType<Params>;
	execute: (params: Params) => Promise<string>;
}

/** Widened form for heterogeneous tool arrays passed to `server.addTool()` in a loop. */
export type AnyTool = FastMcpTool<any>;

/**
 * Wraps a tool's happy-path implementation with consistent guardrails:
 * rate limiting, and translation of internal errors into short, safe,
 * user-facing strings instead of raw stack traces.
 */
export function defineTool<Params>(def: ToolDef<Params>): FastMcpTool<Params> {
	return {
		name: def.name,
		description: def.description,
		parameters: def.parameters,
		execute: async (params: Params) => {
			try {
				const rateLimit = def.rateLimit ?? getTvaConfig().rateLimit;
				checkRateLimit(def.name, rateLimit);
				return await def.execute(params);
			} catch (err) {
				return formatToolError(def.name, err);
			}
		},
	};
}

function formatToolError(toolName: string, err: unknown): string {
	if (err instanceof AuthRequiredError) {
		return `🔒 ${err.message} Ask the user to log in first (LOGIN_USER), then retry.`;
	}
	if (err instanceof GuardrailError) {
		return `⚠️ ${err.message}`;
	}
	if (err instanceof TvaApiError) {
		if (err.status === 404) return `Not found: no matching record for this request.`;
		if (err.status === 401 || err.status === 403) {
			// Check if this is an "email not verified" error
			const details = typeof err.data === "object" && err.data !== null
				? (err.data as { details?: string }).details
				: undefined;
			if (details?.toLowerCase().includes('email not verified')) {
				return `🔒 Email not verified. Please check your email for a verification code and use VERIFY_OTP, or use RESEND_OTP to get a new code.`;
			}
			return `🔒 Not authorized for this action — the session may have expired. Please log in again.`;
		}
		if (err.status === 422) {
			const details =
				typeof err.data === "object" && err.data !== null
					? JSON.stringify((err.data as { errors?: unknown }).errors ?? err.data)
					: err.message;
			return `Invalid request: ${details}`;
		}
		return `TVA API error (${err.status || "network"}): ${err.message}`;
	}
	console.error(`[${toolName}] unexpected error:`, err);
	return `An unexpected error occurred while running ${toolName}.`;
}
