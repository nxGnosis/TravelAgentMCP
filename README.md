# TravelAgentMCP 🌍✈️

A monorepo of MCP (Model Context Protocol) servers for the TVA OTA platform: flight and hotel search & booking,
visa and immigration requirements & booking tracking, and user account management — built for AI travel agents.

## Architecture

```
TravelAgentMCP/
├── mcps/
│   ├── shared/            @travelagent-mcp/shared — HTTP client, config, guardrails, tool helper (not a server)
│   ├── flight-mcp/        tva-flight-mcp   — search, pricing, seatmaps, booking lifecycle
│   ├── hotel-mcp/         tva-hotel-mcp    — search, availability, booking lifecycle
│   ├── visa-mcp/          tva-visa-mcp     — country requirements + booking tracking
│   ├── immigration-mcp/   tva-immigration-mcp — service info + booking tracking
│   └── account-mcp/       tva-account-mcp  — auth, profile, promo codes, notifications
└── src/index.ts           travelagent-mcp  — gateway that mounts all five servers' tools in one process
```

Each `mcps/*` package is an independently runnable stdio MCP server with its own `bin`. Run the ones you need
(e.g. only `tva-flight-mcp` + `tva-hotel-mcp` for a booking widget, or only `tva-visa-mcp` + `tva-immigration-mcp`
for an advisory bot), or run the root **gateway** (`travelagent-mcp`) to get everything in one process — this is
what the published npm package has always been, kept for backward compatibility.

Two upstream APIs are involved:

- **TVA OTA backend** (`TVA_BASE_URL`) — flights, hotels, bookings, account, and the "client" side of visa/immigration
  booking tracking (updates, notifications, transactions). Most booking-management endpoints require a bearer token;
  guest checkout flows (book, cancel-by-UUID, verify, resend-ticket) do not.
- **Visa/Immigration content API** (`VISA_CONTENT_API_*` / `IMMIGRATION_CONTENT_API_*`) — a separate service for
  country requirements, visa types, fees and FAQs, used only by `GET_VISA_INFO_BY_COUNTRY` /
  `GET_IMMIGRATION_INFO_BY_COUNTRY`.

## Guardrails

- **Least privilege**: only user-facing endpoints are exposed. Admin/ops endpoints (booking management, refunds,
  revenue stats) are deliberately *not* wrapped as tools — they're not appropriate for a conversational agent.
- **Explicit confirmation**: every tool that moves money or is irreversible (`BOOK_FLIGHT`, `BOOK_HOTEL`,
  `CANCEL_FLIGHT_BOOKING`, `CANCEL_HOTEL_BOOKING`, `CONFIRM_FLIGHT_PAYMENT`, `CONFIRM_HOTEL_PAYMENT`,
  `SELECT_FLIGHT_SEAT`, `CHANGE_PASSWORD`, `CLOSE_ACCOUNT`) requires `confirm: true`, which the calling agent should
  only set after reading the specific details back to the user.
- **No secrets in the LLM's context**: `TVA_ACCESS_TOKEN` is never a tool parameter — it's read from the process
  environment, injected per user session by whichever agent spawns these servers. `LOGIN_USER` /
  `SOCIAL_AUTH_LOGIN` return the token wrapped in a `__session` envelope for the spawning agent to intercept and
  store out-of-band; the model only ever sees a plain confirmation message. See
  `mcps/account-mcp/src/lib/session.ts` for the contract.
- **No raw offer replay**: Amadeus flight offers are large opaque JSON blobs. `SEARCH_FLIGHTS` caches each offer
  server-side (SQLite, see `mcps/flight-mcp/src/lib/offerCache.ts`) and hands the model a short `offerRef` instead
  — the model never reconstructs offer JSON by hand, which would risk token bloat or silent price/fare corruption.
- **Redaction**: passwords, tokens, OTPs and card numbers are masked before anything is logged (see
  `mcps/shared/src/guardrails.ts`).
- **Known risk — hotel payments**: `BOOK_HOTEL` currently takes raw card details directly (the TVA hotel API has
  no tokenized checkout step yet). This must only be called by a client that collected card details through a
  secure, PCI-compliant surface — never by prompting a user to type a card number into chat. See the tool's
  description for details.
- **Rate limiting**: each tool call is throttled per-process (defense against a runaway function-calling loop).
  This is not a substitute for persistent, cross-turn throttling — track abuse persistently at the session layer
  if you need real protection.

## Setup

```bash
pnpm install
cp .env.example .env   # fill in TVA_BASE_URL and content-API keys
pnpm build              # builds mcps/shared first, then every domain server, then the gateway
```

Run the gateway (all tools in one process):

```bash
pnpm start
```

Or run a single domain server directly:

```bash
node mcps/flight-mcp/dist/index.js
```

## Tool reference

### Flight (`tva-flight-mcp`)
`SEARCH_FLIGHTS`, `GET_POPULAR_FLIGHT_ROUTES`, `GET_FLIGHT_PRICE_ANALYSIS`, `GET_MOST_TRAVELED_DESTINATIONS`,
`GET_MOST_BOOKED_DESTINATIONS`, `GET_BUSIEST_TRAVEL_PERIOD`, `GET_FLIGHT_SEATMAP_BY_OFFER`,
`GET_FLIGHT_SEATMAP_BY_ORDER`, `GET_FLIGHT_FARE_UPSELL`, `PREDICT_FLIGHT_CHOICE`, `CONFIRM_FLIGHT_PRICE`,
`BOOK_FLIGHT`, `LIST_MY_FLIGHT_BOOKINGS`, `GET_FLIGHT_BOOKING`, `VERIFY_FLIGHT_BOOKING`, `CANCEL_FLIGHT_BOOKING`,
`GET_FLIGHT_SEAT_PRICE`, `SELECT_FLIGHT_SEAT`, `RESEND_FLIGHT_TICKET`, `GET_FLIGHT_TICKET_DOWNLOAD_LINK`,
`CONFIRM_FLIGHT_PAYMENT`

### Hotel (`tva-hotel-mcp`)
`SEARCH_HOTELS`, `SEARCH_HOTEL_CITIES`, `CHECK_HOTEL_AVAILABILITY`, `BOOK_HOTEL`, `LIST_MY_HOTEL_BOOKINGS`,
`GET_HOTEL_BOOKING`, `CONFIRM_HOTEL_PAYMENT`, `CANCEL_HOTEL_BOOKING`

### Visa (`tva-visa-mcp`)
`GET_VISA_INFO_BY_COUNTRY`, `LIST_MY_VISA_BOOKINGS`, `GET_VISA_BOOKING`, `GET_VISA_BOOKING_BY_APPLICATION_UUID`,
`GET_VISA_UPDATES`, `GET_VISA_UPDATES_BY_BOOKING`, `GET_VISA_FOLLOWUP_QUESTIONS`, `ANSWER_VISA_FOLLOWUP`,
`GET_VISA_NOTIFICATIONS`, `MARK_VISA_NOTIFICATION_READ`, `GET_VISA_TRANSACTIONS`, `GET_VISA_TRANSACTION_DETAIL`

### Immigration (`tva-immigration-mcp`)
`GET_IMMIGRATION_INFO_BY_COUNTRY`, `LIST_MY_IMMIGRATION_BOOKINGS`, `GET_IMMIGRATION_BOOKING`,
`GET_IMMIGRATION_UPDATES`, `GET_IMMIGRATION_UPDATES_BY_BOOKING`, `GET_IMMIGRATION_NOTIFICATIONS`,
`MARK_IMMIGRATION_NOTIFICATION_READ`, `GET_IMMIGRATION_TRANSACTIONS`, `GET_IMMIGRATION_TRANSACTION_DETAIL`

### Account (`tva-account-mcp`)
`REGISTER_USER`, `LOGIN_USER`, `SOCIAL_AUTH_LOGIN`, `FORGOT_PASSWORD`, `RESEND_OTP`, `VERIFY_OTP`, `LOGOUT_USER`,
`GET_CURRENT_USER`, `GET_USER_PROFILE`, `EDIT_USER_PROFILE`, `CHANGE_PASSWORD`, `CHECK_DISCOUNT_PROMO`,
`GET_USER_NOTIFICATIONS`, `CLOSE_ACCOUNT`

## Consumed by

[MegaMind](https://github.com/nxGnosis/mcp-megamind)'s **NomadSage** travel agent spawns these servers (via stdio,
one per domain) alongside its knowledge-base search and social-mcp reply tools — see
`travel-agent/src/lib/tva-client.ts` and `travel-agent/src/lib/tva-session.ts` in that repo.
