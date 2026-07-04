/**
 * Server-side cache for raw Amadeus flight-offer JSON.
 *
 * Flight offers are large, opaque blobs that must be replayed byte-for-byte
 * back to the TVA API for pricing/seatmap/booking calls. Round-tripping that
 * JSON through an LLM's function-calling arguments risks token bloat and
 * silent corruption (the model reconstructing/"fixing" fields it doesn't
 * understand, e.g. dropping a fare rule or mutating a price). Instead, this
 * server caches the offer once and hands the LLM a short opaque `offerRef`
 * to pass between tool calls — the LLM never sees or reproduces the raw offer.
 *
 * Backed by SQLite (not an in-memory Map) because each MCP call spawns a
 * fresh stdio child process — an in-memory cache would not survive between
 * turns of the same conversation (e.g. "search flights" now, "book the
 * second one" a minute later).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TTL_MS = 45 * 60 * 1000; // long enough to cover search -> review -> book in one conversation

function dbPath(): string {
	return process.env.TVA_OFFER_CACHE_DB_PATH ?? path.resolve(__dirname, "..", "..", "offer-cache.db");
}

let _db: ReturnType<typeof require> | null = null;

function getDb() {
	if (_db) return _db;
	const BetterSqlite3 = require("better-sqlite3");
	_db = new BetterSqlite3(dbPath());
	(_db as ReturnType<typeof require>).exec(`
    CREATE TABLE IF NOT EXISTS offers (
      ref TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
	return _db;
}

function prune(): void {
	getDb().prepare("DELETE FROM offers WHERE created_at < ?").run(Date.now() - TTL_MS);
}

/** Cache a value under `ref` (or a freshly generated one) and return the ref. */
export function cacheOffer(kind: string, payload: unknown, ref?: string): string {
	prune();
	const key = ref ?? `${kind}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
	getDb()
		.prepare("INSERT OR REPLACE INTO offers (ref, kind, payload, created_at) VALUES (?, ?, ?, ?)")
		.run(key, kind, JSON.stringify(payload), Date.now());
	return key;
}

export function getCachedOffer<T = unknown>(ref: string): T | null {
	prune();
	const row = getDb().prepare("SELECT payload FROM offers WHERE ref = ?").get(ref) as
		| { payload: string }
		| undefined;
	return row ? (JSON.parse(row.payload) as T) : null;
}
