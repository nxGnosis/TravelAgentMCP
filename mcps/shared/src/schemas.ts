import { z } from "zod";

export const isoDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "Must be an ISO date (YYYY-MM-DD)");

export const iataCode = z
	.string()
	.length(3)
	.describe("3-letter IATA airport/city code (e.g. 'LOS', 'LHR').");

export const currencyCode = z
	.string()
	.length(3)
	.optional()
	.describe("3-letter ISO currency code (e.g. 'NGN', 'USD').");

export const perPage = z
	.number()
	.int()
	.min(1)
	.max(100)
	.optional()
	.describe("Results per page (default 15, max 100).");

export const confirmFlag = z
	.boolean()
	.optional()
	.describe(
		"Must be exactly true to actually perform this action. Only set this after the user has " +
			"explicitly confirmed the specific details (price, dates, names) in the conversation.",
	);
