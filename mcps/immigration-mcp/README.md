# @travelagent-mcp/immigration-mcp — `tva-immigration-mcp`

`GET_IMMIGRATION_INFO_BY_COUNTRY` calls the immigration **content** API (services, requirements, fees — same
`TVA_BASE_URL`, configure `CONTENT_API_KEY` for auth). The remaining tools track a
logged-in user's immigration **bookings** against the TVA OTA API and require `TVA_ACCESS_TOKEN`.

Build: `pnpm --filter @travelagent-mcp/immigration-mcp build`. Run: `node dist/index.js`.
