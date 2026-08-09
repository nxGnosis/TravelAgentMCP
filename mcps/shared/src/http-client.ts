import { getTvaConfig, type ContentApiConfig } from "./config.js";
import { AuthRequiredError, TvaApiError } from "./errors.js";
import { redact } from "./guardrails.js";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface TvaRequestOptions {
	method?: Method;
	query?: Record<string, string | number | boolean | undefined>;
	body?: unknown;
	/** "bearer" requires a logged-in session token; "none" is a guest-accessible endpoint; "optional" passes the token if available without requiring it. */
	auth: "bearer" | "none" | "optional";
}

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

function buildQuery(query?: TvaRequestOptions["query"]): string {
	if (!query) return "";
	const params = new URLSearchParams();
	for (const [k, v] of Object.entries(query)) {
		if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
	}
	const qs = params.toString();
	return qs ? `?${qs}` : "";
}

function debugLog(label: string, payload: unknown): void {
	if (process.env.DEBUG_TVA_MCP === "true") {
		console.error(`[tva-http] ${label}`, JSON.stringify(redact(payload)).slice(0, 500));
	}
}

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Call the TVA OTA backend (flights, hotels, visa/immigration bookings, account). */
export async function tvaRequest<T = unknown>(path: string, options: TvaRequestOptions): Promise<T> {
	const config = getTvaConfig();

	if (options.auth === "bearer" && !config.accessToken) {
		throw new AuthRequiredError();
	}

	const url = `${config.baseUrl}${path}${buildQuery(options.query)}`;
	const headers: Record<string, string> = {
		Accept: "application/json",
	};
	if (options.body !== undefined) headers["Content-Type"] = "application/json";
	if ((options.auth === "bearer" || options.auth === "optional") && config.accessToken) {
		headers.Authorization = `Bearer ${config.accessToken}`;
	}

	let attempt = 0;
	for (;;) {
		attempt++;
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), config.timeoutMs);

		try {
			debugLog(`${options.method ?? "GET"} ${path}`, { query: options.query, body: options.body });

			const response = await fetch(url, {
				method: options.method ?? "GET",
				headers,
				body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
				signal: controller.signal,
			});

			clearTimeout(timer);

			if (!response.ok) {
				const data = await response.json().catch(() => undefined);
				const willRetry = RETRYABLE_STATUS.has(response.status) && attempt <= config.maxRetries;
				debugLog(`${options.method ?? "GET"} ${path} ← ${response.status}${willRetry ? ` (retry ${attempt}/${config.maxRetries})` : " (giving up)"}`, {
					status: response.status,
					message: (data as { message?: string })?.message,
					body: data,
				});
				if (willRetry) {
					await sleep(2 ** attempt * 500);
					continue;
				}
				throw new TvaApiError(
					response.status,
					(data as { message?: string })?.message ?? `TVA API error ${response.status}`,
					data,
				);
			}

			const json = (await response.json()) as T;
			debugLog(`${options.method ?? "GET"} ${path} ← ${response.status} ok`, { status: response.status });
			return json;
		} catch (err) {
			clearTimeout(timer);
			if (err instanceof TvaApiError) throw err;

			const isAbort = err instanceof Error && err.name === "AbortError";
			const willRetry = attempt <= config.maxRetries;
			debugLog(`${options.method ?? "GET"} ${path} ✕ ${isAbort ? "timeout" : "network"}${willRetry ? ` (retry ${attempt}/${config.maxRetries})` : " (giving up)"}`, {
				error: isAbort ? `timed out after ${config.timeoutMs}ms` : (err as Error).message,
				url,
			});
			if (willRetry) {
				await sleep(2 ** attempt * 500);
				continue;
			}
			throw new TvaApiError(
				isAbort ? 408 : 0,
				isAbort ? `TVA API request timed out after ${config.timeoutMs}ms` : (err as Error).message,
			);
		}
	}
}

/** Call the visa/immigration *content* API (country requirements, fees, FAQs) — x-api-key auth, no bearer session. */
export async function contentApiRequest<T = unknown>(
	config: ContentApiConfig,
	path: string,
	query?: Record<string, string | number | undefined>,
): Promise<T> {
	const url = `${config.baseUrl}${path}${buildQuery(query)}`;

	const response = await fetch(url, {
		headers: { "x-api-key": config.apiKey, Accept: "application/json" },
	});

	if (!response.ok) {
		throw new TvaApiError(response.status, `Content API error ${response.status}: ${response.statusText}`);
	}

	return (await response.json()) as T;
}
