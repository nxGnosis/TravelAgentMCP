import { GuardrailError } from "./errors.js";

// ── Rate limiting ────────────────────────────────────────────────────────────
//
// Each MCP server runs as a short-lived stdio child process (spawned fresh per
// agent turn), so this in-memory limiter only protects against a runaway loop
// *within* a single turn (e.g. the LLM retrying a tool many times). It is not
// a substitute for persistent, cross-request throttling — callers that need
// real abuse protection across turns should track attempts in a durable store
// keyed by session (see MegaMind/travel-agent's tva-session store for login
// attempt tracking).

const callLog = new Map<string, number[]>();

export function checkRateLimit(key: string, opts: { max: number; windowMs: number }): void {
	const now = Date.now();
	const calls = (callLog.get(key) ?? []).filter((t) => now - t < opts.windowMs);
	if (calls.length >= opts.max) {
		throw new GuardrailError(
			`Too many "${key}" calls in a short period. Please wait a moment and try again.`,
		);
	}
	calls.push(now);
	callLog.set(key, calls);
}

// ── Explicit confirmation for destructive / monetary actions ────────────────

export function requireConfirmation(confirm: boolean | undefined, action: string): void {
	if (confirm !== true) {
		throw new GuardrailError(
			`This action (${action}) moves money or cannot be undone. Confirm the exact details with ` +
				`the user first, then call this tool again with confirm: true.`,
		);
	}
}

// ── Redaction ─────────────────────────────────────────────────────────────
//
// Sensitive fields must never be echoed back into the LLM's context or
// written to logs — the model doesn't need the raw value to do its job.

const SENSITIVE_KEYS = new Set([
	"password",
	"password_confirmation",
	"current_password",
	"token",
	"access_token",
	"authorization",
	"otp",
	"cardnumber",
	"card_number",
	"cvv",
	"cvc",
]);

export function redact<T>(value: T): T {
	return redactInner(value, 0) as T;
}

function redactInner(value: unknown, depth: number): unknown {
	if (depth > 8 || value === null || value === undefined) return value;

	if (typeof value === "string") return value;

	if (Array.isArray(value)) return value.map((v) => redactInner(v, depth + 1));

	if (typeof value === "object") {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			if (SENSITIVE_KEYS.has(k.toLowerCase())) {
				out[k] = maskString(String(v));
			} else {
				out[k] = redactInner(v, depth + 1);
			}
		}
		return out;
	}

	return value;
}

export function maskString(value: string): string {
	if (value.length <= 4) return "****";
	return `${"*".repeat(value.length - 4)}${value.slice(-4)}`;
}

/** Mask a card number to its last 4 digits, e.g. "**** **** **** 1111". */
export function maskCardNumber(cardNumber: string): string {
	const digits = cardNumber.replace(/\D/g, "");
	if (digits.length < 4) return "****";
	return `**** **** **** ${digits.slice(-4)}`;
}

// ── Output size capping ──────────────────────────────────────────────────────

export function truncateForLLM(text: string, maxChars = 6000): string {
	if (text.length <= maxChars) return text;
	return `${text.slice(0, maxChars)}\n… [truncated ${text.length - maxChars} more characters]`;
}
