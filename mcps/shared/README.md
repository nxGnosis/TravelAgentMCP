# @travelagent-mcp/shared

Internal library (not an MCP server) consumed by every `mcps/*` package:

- `config.ts` — env-driven config for the TVA OTA API and the visa/immigration content API
- `http-client.ts` — `tvaRequest()` / `contentApiRequest()`: fetch wrapper with timeout, retry/backoff, bearer auth
- `guardrails.ts` — rate limiting, `requireConfirmation()`, PII/secret redaction, output truncation
- `errors.ts` — `TvaApiError`, `AuthRequiredError`, `GuardrailError`
- `schemas.ts` — shared zod fragments (`isoDate`, `iataCode`, `confirmFlag`, `perPage`, ...)
- `tool.ts` — `defineTool()`: wraps a tool's happy path with rate limiting + safe error formatting
