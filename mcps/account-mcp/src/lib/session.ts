/**
 * Session envelope contract with the agent that spawns this server.
 *
 * A bearer token must never be echoed back into an LLM's context — the model
 * doesn't need it and it's a standing credential. So auth tools that mint a
 * new session don't return the token as plain text; they wrap it in a
 * `__session` field on the JSON they return. The spawning agent (see
 * MegaMind/travel-agent's tva-session store) is expected to intercept this
 * field, persist the token out-of-band keyed by conversation session, and
 * strip it before the tool result is shown to the model — the model only
 * ever sees `message`.
 */

export interface SessionEnvelope {
	token: string;
	userUuid?: string;
	name?: string;
	email?: string;
}

export function withSession(message: string, session: SessionEnvelope): string {
	return JSON.stringify({ message, __session: session });
}

export function withClearSession(message: string): string {
	return JSON.stringify({ message, __clearSession: true });
}

/** Defensive extraction — TVA responses have been observed as both `data.token` and top-level `token`. */
export function extractSession(raw: any): SessionEnvelope | null {
	const token = raw?.data?.token ?? raw?.token;
	if (!token) return null;
	const user = raw?.data?.user ?? raw?.user ?? {};
	return {
		token,
		userUuid: user.user_uuid ?? raw?.data?.user_uuid,
		name: user.name ?? ([user.first_name, user.last_name].filter(Boolean).join(" ") || undefined),
		email: user.email,
	};
}
