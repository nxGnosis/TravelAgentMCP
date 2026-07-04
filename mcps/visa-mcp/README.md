# @travelagent-mcp/visa-mcp — `tva-visa-mcp`

`GET_VISA_INFO_BY_COUNTRY` calls a separate visa **content** API (country requirements, fees, FAQs — configure
via `VISA_CONTENT_API_BASE_URL` / `VISA_CONTENT_API_KEY`). The remaining tools track a logged-in user's visa
**bookings** against the TVA OTA API (updates, follow-up questions, notifications, transactions) and require
`TVA_ACCESS_TOKEN`.

Build: `pnpm --filter @travelagent-mcp/visa-mcp build`. Run: `node dist/index.js`.
