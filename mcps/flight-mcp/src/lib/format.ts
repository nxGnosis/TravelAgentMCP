/** Best-effort summary of an Amadeus-shaped itinerary — defensive since we book against a live API without a fixed response schema. */
function summarizeItinerary(itinerary: any): string {
	const segments = itinerary?.segments ?? [];
	if (segments.length === 0) return "itinerary details unavailable";

	const first = segments[0];
	const last = segments[segments.length - 1];
	const from = first?.departure?.iataCode ?? "?";
	const to = last?.arrival?.iataCode ?? "?";
	const depAt = first?.departure?.at ?? "?";
	const arrAt = last?.arrival?.at ?? "?";
	const stops = segments.length - 1;
	const carriers = [...new Set(segments.map((s: any) => s.carrierCode).filter(Boolean))].join("/");

	return `${from} → ${to} · dep ${depAt} · arr ${arrAt} · ${stops === 0 ? "nonstop" : `${stops} stop(s)`} · ${carriers || "carrier n/a"}`;
}

export function summarizeFlightOffers(searchResponse: any, offerRefs: string[]): string {
	const offers = searchResponse?.data ?? [];
	if (offers.length === 0) {
		return JSON.stringify({ total: 0, note: "No flight offers matched this search.", raw: searchResponse });
	}

	const summarized = offers.map((offer: any, i: number) => ({
		offerRef: offerRefs[i],
		price: {
			total: offer?.price?.grandTotal ?? offer?.price?.total,
			currency: offer?.price?.currency,
		},
		seatsLeft: offer?.numberOfBookableSeats,
		validatingAirlines: offer?.validatingAirlineCodes,
		itineraries: (offer?.itineraries ?? []).map(summarizeItinerary),
	}));

	return JSON.stringify(
		{
			total: summarized.length,
			instruction:
				"Present these options to the user. To act on one, use its offerRef with GET_FLIGHT_SEATMAP_BY_OFFER, " +
				"GET_FLIGHT_FARE_UPSELL or CONFIRM_FLIGHT_PRICE — never fabricate a flightOffer JSON yourself.",
			offers: summarized,
		},
		null,
		2,
	);
}
