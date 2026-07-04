import { z } from "zod";
import { type AnyTool, defineTool, GuardrailError, truncateForLLM } from "@travelagent-mcp/shared";
import { flightOfferService } from "../services/flightOfferService.js";
import { cacheOffer, getCachedOffer } from "../lib/offerCache.js";

const json = (data: unknown) => truncateForLLM(JSON.stringify(data, null, 2));

function resolveOffer(offerRef: string): unknown {
	const offer = getCachedOffer(offerRef);
	if (!offer) {
		throw new GuardrailError(
			`offerRef "${offerRef}" was not found or has expired. Run SEARCH_FLIGHTS again to get a fresh offerRef.`,
		);
	}
	return offer;
}

export const getFlightSeatmapByOffer = defineTool({
	name: "GET_FLIGHT_SEATMAP_BY_OFFER",
	description: "Get the seatmap for a flight offer before booking. Requires an offerRef from SEARCH_FLIGHTS.",
	parameters: z.object({ offerRef: z.string() }),
	execute: async ({ offerRef }) => json(await flightOfferService.seatmapByOffer(resolveOffer(offerRef))),
});

export const getFlightSeatmapByOrder = defineTool({
	name: "GET_FLIGHT_SEATMAP_BY_ORDER",
	description: "Get the seatmap for an existing (already booked) flight order, by Amadeus order ID.",
	parameters: z.object({ orderId: z.string() }),
	execute: async ({ orderId }) => json(await flightOfferService.seatmapByOrder(orderId)),
});

export const getFlightFareUpsell = defineTool({
	name: "GET_FLIGHT_FARE_UPSELL",
	description:
		"Show branded fare upgrade options (e.g. more baggage, flexible change) for a searched offer. " +
		"Requires an offerRef from SEARCH_FLIGHTS.",
	parameters: z.object({ offerRef: z.string(), currency: z.string().length(3).optional() }),
	execute: async ({ offerRef, currency }) =>
		json(await flightOfferService.upsell(resolveOffer(offerRef), currency)),
});

export const predictFlightChoice = defineTool({
	name: "PREDICT_FLIGHT_CHOICE",
	description:
		"Get an AI-ranked prediction of which flight offer from the most recent SEARCH_FLIGHTS call travelers " +
		"are most likely to choose. Takes no offer-specific input — always operates on the last search.",
	parameters: z.object({}),
	execute: async () => {
		const lastSearch = getCachedOffer("last_search_response");
		if (!lastSearch) {
			throw new GuardrailError("No recent flight search found. Run SEARCH_FLIGHTS first.");
		}
		return json(await flightOfferService.predict(lastSearch));
	},
});

export const confirmFlightPrice = defineTool({
	name: "CONFIRM_FLIGHT_PRICE",
	description:
		"Re-price/confirm an offer immediately before booking (fares can change between search and booking). " +
		"Always call this right before BOOK_FLIGHT. Requires an offerRef from SEARCH_FLIGHTS; the same ref is " +
		"updated with the confirmed price and should be passed to BOOK_FLIGHT.",
	parameters: z.object({ offerRef: z.string(), currency: z.string().length(3).optional() }),
	execute: async ({ offerRef, currency }) => {
		const priced = await flightOfferService.confirmPrice(resolveOffer(offerRef), currency);
		const pricedOffer = priced?.data?.flightOffers?.[0] ?? priced?.data ?? priced;
		cacheOffer("flight_offer", pricedOffer, offerRef);
		return json({ offerRef, priced });
	},
});

export const flightOfferTools: AnyTool[] = [
	getFlightSeatmapByOffer,
	getFlightSeatmapByOrder,
	getFlightFareUpsell,
	predictFlightChoice,
	confirmFlightPrice,
];
