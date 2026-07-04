import { z } from "zod";
import { type AnyTool, defineTool, isoDate, truncateForLLM } from "@travelagent-mcp/shared";
import { flightSearchService } from "../services/flightSearchService.js";
import { cacheOffer } from "../lib/offerCache.js";
import { summarizeFlightOffers } from "../lib/format.js";

const json = (data: unknown) => truncateForLLM(JSON.stringify(data, null, 2));

// ── Search ────────────────────────────────────────────────────────────────────

const travelerType = z.enum(["ADULT", "CHILD", "SENIOR", "INFANT"]);
const cabin = z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]);

const originDestination = z.object({
	id: z.string().describe("Local ID for this leg, e.g. '1'. Referenced by cabinRestrictions."),
	originLocationCode: z.string().length(3).describe("Origin IATA code, e.g. 'LOS'."),
	destinationLocationCode: z.string().length(3).describe("Destination IATA code, e.g. 'LHR'."),
	departureDateTimeRange: z.object({
		date: isoDate,
		time: z.string().optional().describe("Preferred departure time HH:MM:SS."),
	}),
});

const traveler = z.object({
	id: z.string().describe("Local traveler ID, e.g. '1'."),
	travelerType,
	fareOptions: z.array(z.string()).optional(),
});

const searchParams = z.object({
	currencyCode: z.string().length(3).optional(),
	originDestinations: z
		.array(originDestination)
		.min(1)
		.describe("One entry per leg — 1 for one-way, 2 for round-trip (return leg = origin/dest swapped), 2+ for multi-city."),
	travelers: z.array(traveler).min(1),
	sources: z.array(z.string()).optional().describe("Defaults to ['GDS'] if omitted."),
	cabin: cabin.optional().describe("Applies a cabinRestriction covering all legs, if provided."),
	excludedCarrierCodes: z.array(z.string()).optional(),
	maxFlightOffers: z.number().int().min(1).max(50).optional(),
});

export const searchFlights = defineTool({
	name: "SEARCH_FLIGHTS",
	description:
		"Search live flight offers (one-way, round-trip, or multi-city). Returns compact summaries with an " +
		"offerRef per offer — use that ref (never raw JSON) in follow-up tools like GET_FLIGHT_SEATMAP_BY_OFFER, " +
		"GET_FLIGHT_FARE_UPSELL, or CONFIRM_FLIGHT_PRICE.",
	parameters: searchParams,
	execute: async ({ cabin, excludedCarrierCodes, maxFlightOffers, ...rest }) => {
		const flightFilters: Record<string, unknown> = {};
		if (cabin) {
			flightFilters.cabinRestrictions = [
				{
					cabin,
					coverage: "MOST_SEGMENTS",
					originDestinationIds: rest.originDestinations.map((od) => od.id),
				},
			];
		}
		if (excludedCarrierCodes?.length) {
			flightFilters.carrierRestrictions = { excludedCarrierCodes };
		}

		const body = {
			...rest,
			sources: rest.sources ?? ["GDS"],
			searchCriteria: {
				...(maxFlightOffers ? { maxFlightOffers } : {}),
				...(Object.keys(flightFilters).length ? { flightFilters } : {}),
			},
		};

		const response = await flightSearchService.search(body);
		const offers = response?.data ?? [];
		const offerRefs = offers.map((offer: unknown) => cacheOffer("flight_offer", offer));
		cacheOffer("flight_search_response", response, "last_search_response");

		return truncateForLLM(summarizeFlightOffers(response, offerRefs));
	},
});

// ── Popular routes / price analysis / insights ───────────────────────────────

export const getPopularFlightRoutes = defineTool({
	name: "GET_POPULAR_FLIGHT_ROUTES",
	description: "Get the most popular flight routes right now (for inspiration, not a live search).",
	parameters: z.object({ limit: z.number().int().min(1).max(50).optional() }),
	execute: async ({ limit }) => json(await flightSearchService.popularRoutes(limit)),
});

export const getFlightPriceAnalysis = defineTool({
	name: "GET_FLIGHT_PRICE_ANALYSIS",
	description:
		"Check whether a route/date's fare is cheap, typical or expensive versus historical prices " +
		"(Amadeus Flight Price Analysis). Use before recommending a booking.",
	parameters: z.object({
		originIataCode: z.string().length(3),
		destinationIataCode: z.string().length(3),
		departureDate: isoDate,
		currencyCode: z.string().length(3).optional(),
		oneWay: z.boolean().optional(),
	}),
	execute: async (params) => json(await flightSearchService.priceAnalysis(params)),
});

export const getMostTraveledDestinations = defineTool({
	name: "GET_MOST_TRAVELED_DESTINATIONS",
	description: "Get the most-traveled-to destinations from a given origin city for a given month.",
	parameters: z.object({
		originCityCode: z.string().length(3),
		period: z.string().describe("Month in YYYY-MM format."),
		max: z.number().int().min(1).max(50).optional(),
		sort: z.string().optional(),
	}),
	execute: async (params) => json(await flightSearchService.mostTraveled(params)),
});

export const getMostBookedDestinations = defineTool({
	name: "GET_MOST_BOOKED_DESTINATIONS",
	description: "Get the most-booked destinations from a given origin city for a given month.",
	parameters: z.object({
		originCityCode: z.string().length(3),
		period: z.string().describe("Month in YYYY-MM format."),
		max: z.number().int().min(1).max(50).optional(),
		sort: z.string().optional(),
	}),
	execute: async (params) => json(await flightSearchService.mostBooked(params)),
});

export const getBusiestTravelPeriod = defineTool({
	name: "GET_BUSIEST_TRAVEL_PERIOD",
	description: "Get the busiest travel period (by month) for a given city and year.",
	parameters: z.object({
		cityCode: z.string().length(3),
		period: z.string().describe("Year in YYYY format."),
		direction: z.enum(["ARRIVING", "DEPARTING"]).optional(),
	}),
	execute: async (params) => json(await flightSearchService.busiestPeriod(params)),
});

export const flightSearchTools: AnyTool[] = [
	searchFlights,
	getPopularFlightRoutes,
	getFlightPriceAnalysis,
	getMostTraveledDestinations,
	getMostBookedDestinations,
	getBusiestTravelPeriod,
];
