# @travelagent-mcp/flight-mcp — `tva-flight-mcp`

Flight search, pricing, seatmaps and the full booking lifecycle against the TVA OTA API.

Amadeus flight offers are large opaque JSON blobs — `SEARCH_FLIGHTS` caches them server-side (SQLite at
`TVA_OFFER_CACHE_DB_PATH`, see `src/lib/offerCache.ts`) and returns a short `offerRef` per offer instead of the
raw JSON. Pass that `offerRef` to `GET_FLIGHT_SEATMAP_BY_OFFER`, `GET_FLIGHT_FARE_UPSELL`, and
`CONFIRM_FLIGHT_PRICE`; `CONFIRM_FLIGHT_PRICE` re-caches the priced result under the same ref for `BOOK_FLIGHT`.

`BOOK_FLIGHT`, `CANCEL_FLIGHT_BOOKING`, `SELECT_FLIGHT_SEAT` and `CONFIRM_FLIGHT_PAYMENT` all require
`confirm: true` — see the root README's Guardrails section.

Build: `pnpm --filter @travelagent-mcp/flight-mcp build`. Run: `node dist/index.js`.
