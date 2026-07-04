# @travelagent-mcp/hotel-mcp — `tva-hotel-mcp`

Hotel search, availability and booking lifecycle against the TVA OTA API.

**Known risk**: `BOOK_HOTEL` currently takes raw card details directly in the request body (the TVA hotel API has
no tokenized checkout step yet). This tool must only be invoked by a client that collected card details through a
secure, PCI-compliant surface — never by an LLM prompting a user for a card number in chat. `BOOK_HOTEL` and
`CANCEL_HOTEL_BOOKING` / `CONFIRM_HOTEL_PAYMENT` require `confirm: true`.

Build: `pnpm --filter @travelagent-mcp/hotel-mcp build`. Run: `node dist/index.js`.
