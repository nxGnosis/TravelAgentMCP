import { tvaRequest } from "@travelagent-mcp/shared";

export const flightOfferService = {
	seatmapByOffer: (flightOffer: unknown) =>
		tvaRequest<any>("/api/v1/flights/seatmap", { auth: "none", method: "POST", body: { flightOffer } }),

	seatmapByOrder: (orderId: string) =>
		tvaRequest<any>("/api/v1/flights/seatmap", { auth: "none", query: { orderId } }),

	upsell: (flightOffer: unknown, currency?: string) =>
		tvaRequest<any>("/api/v1/flights/upsell", {
			auth: "none",
			method: "POST",
			body: { flightOffer, currency },
		}),

	predict: (flightSearchResponse: unknown) =>
		tvaRequest<any>("/api/v1/flights/predict", { auth: "none", method: "POST", body: flightSearchResponse }),

	confirmPrice: (flightOffer: unknown, currency?: string) =>
		tvaRequest<any>("/api/v1/flights/price", {
			auth: "none",
			method: "POST",
			body: { flightOffer, currency },
		}),
};
