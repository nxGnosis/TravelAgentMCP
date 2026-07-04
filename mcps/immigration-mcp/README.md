# @travelagent-mcp/immigration-mcp — `tva-immigration-mcp`

`GET_IMMIGRATION_INFO_BY_COUNTRY` calls a separate immigration **content** API (services, requirements, fees —
configure via `IMMIGRATION_CONTENT_API_BASE_URL` / `IMMIGRATION_CONTENT_API_KEY`). The remaining tools track a
logged-in user's immigration **bookings** against the TVA OTA API and require `TVA_ACCESS_TOKEN`.

Build: `pnpm --filter @travelagent-mcp/immigration-mcp build`. Run: `node dist/index.js`.
