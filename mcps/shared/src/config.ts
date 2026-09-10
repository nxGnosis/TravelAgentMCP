// Central env configuration for every TVA MCP server.
//
// TVA_ACCESS_TOKEN is never supplied by the LLM — it is injected into the
// child process environment by whichever agent spawns this server (see
// MegaMind/travel-agent/src/lib/tva-session.ts), scoped to one user session.

export interface TvaConfig {
	baseUrl: string;
	accessToken: string | undefined;
	timeoutMs: number;
	maxRetries: number;
	rateLimit: { max: number; windowMs: number };
}

export interface ContentApiConfig {
	baseUrl: string;
	apiKey: string;
}

function envInt(name: string, fallback: number): number {
	const raw = process.env[name];
	if (!raw) return fallback;
	const n = Number.parseInt(raw, 10);
	return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getTvaConfig(): TvaConfig {
	return {
		baseUrl: (process.env.TVA_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, ""),
		accessToken: process.env.TVA_ACCESS_TOKEN || undefined,
		// Worst case per call is timeoutMs × (maxRetries+1) + backoff between attempts
		// (2^attempt × 500ms) — the old 15s/2-retry defaults meant a single slow/down
		// upstream call could burn up to ~48s on its own, blowing any latency budget
		// before the booking flow even gets to its second tool call. Tightened so one
		// call's worst case (~17s) still fits inside a 30-40s end-to-end booking target,
		// while keeping ONE retry so a genuine transient blip still recovers.
		timeoutMs: envInt("TVA_API_TIMEOUT_MS", 8_000),
		maxRetries: envInt("TVA_MAX_RETRIES", 1),
		rateLimit: {
			max: envInt("TVA_RATE_LIMIT_MAX_CALLS", 30),
			windowMs: envInt("TVA_RATE_LIMIT_WINDOW_MS", 60_000),
		},
	};
}

/** The visa/immigration *content* API (country requirements, fees, FAQs) — same TVA backend, x-api-key auth instead of the bearer session token. */
function getContentConfig(): ContentApiConfig {
	return {
		baseUrl: (process.env.TVA_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, ""),
		apiKey: process.env.CONTENT_API_KEY ?? "",
	};
}

export function getVisaContentConfig(): ContentApiConfig {
	return getContentConfig();
}

export function getImmigrationContentConfig(): ContentApiConfig {
	return getContentConfig();
}
