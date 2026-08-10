# @travelagent-mcp/visa-mcp — `tva-visa-mcp`

`GET_VISA_INFO_BY_COUNTRY` calls the visa **content** API (country requirements, fees, FAQs — same
`TVA_BASE_URL`, configure `CONTENT_API_KEY` for auth). The remaining tools track a logged-in user's visa
**bookings** against the TVA OTA API (updates, follow-up questions, notifications, transactions) and require
`TVA_ACCESS_TOKEN`.

Build: `pnpm --filter @travelagent-mcp/visa-mcp build`. Run: `node dist/index.js`.
