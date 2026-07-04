export class TvaApiError extends Error {
	constructor(
		public readonly status: number,
		message: string,
		public readonly data?: unknown,
	) {
		super(message);
		this.name = "TvaApiError";
	}
}

/** Thrown when a bearer-authenticated endpoint is called without a session token. */
export class AuthRequiredError extends Error {
	constructor(message = "You need to be logged in for this action.") {
		super(message);
		this.name = "AuthRequiredError";
	}
}

/** Thrown by guardrail checks (missing confirmation, rate limit exceeded, invalid input shape). */
export class GuardrailError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "GuardrailError";
	}
}
