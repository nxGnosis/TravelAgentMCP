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
		timeoutMs: envInt("TVA_API_TIMEOUT_MS", 15_000),
		maxRetries: envInt("TVA_MAX_RETRIES", 2),
		rateLimit: {
			max: envInt("TVA_RATE_LIMIT_MAX_CALLS", 30),
			windowMs: envInt("TVA_RATE_LIMIT_WINDOW_MS", 60_000),
		},
	};
}

/** The visa/immigration *content* API (country requirements, fees, FAQs) — a separate service from the TVA OTA booking backend. */
export function getVisaContentConfig(): ContentApiConfig {
	return {
		baseUrl: (
			process.env.VISA_CONTENT_API_BASE_URL ??
			"https://agile-scrubland-71136-72b75abf9926.herokuapp.com/api/v1"
		).replace(/\/+$/, ""),
		apiKey: process.env.VISA_CONTENT_API_KEY ?? "",
	};
}

export function getImmigrationContentConfig(): ContentApiConfig {
	return {
		baseUrl: (
			process.env.IMMIGRATION_CONTENT_API_BASE_URL ??
			"https://agile-scrubland-71136-72b75abf9926.herokuapp.com/api/v1"
		).replace(/\/+$/, ""),
		apiKey: process.env.IMMIGRATION_CONTENT_API_KEY ?? "",
	};
}
