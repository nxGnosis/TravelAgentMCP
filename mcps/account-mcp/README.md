# @travelagent-mcp/account-mcp — `tva-account-mcp`

User auth (register/login/social-auth/OTP/logout) and profile management against the TVA OTA API.

`LOGIN_USER` and `SOCIAL_AUTH_LOGIN` never return a raw bearer token as visible text — they wrap it in a
`__session` field (see `src/lib/session.ts`) which the spawning agent is expected to intercept, persist
out-of-band keyed by conversation session, and strip before the tool result reaches the model. `LOGOUT_USER` and
`CLOSE_ACCOUNT` return `__clearSession: true` so the agent knows to drop the stored token.

`CHANGE_PASSWORD` and `CLOSE_ACCOUNT` require `confirm: true`.

Build: `pnpm --filter @travelagent-mcp/account-mcp build`. Run: `node dist/index.js`.
