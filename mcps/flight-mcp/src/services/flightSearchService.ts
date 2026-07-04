import { tvaRequest } from "@travelagent-mcp/shared";

export const flightSearchService = {
	popularRoutes: (limit?: number) =>
		tvaRequest<any>("/api/v1/flights/popular-routes", { auth: "none", query: { limit } }),

	search: (payload: unknown) =>
		tvaRequest<any>("/api/v1/flights/search", { auth: "none", method: "POST", body: payload }),

	priceAnalysis: (params: {
		originIataCode: string;
		destinationIataCode: string;
		departureDate: string;
		currencyCode?: string;
		oneWay?: boolean;
	}) => tvaRequest<any>("/api/v1/flights/price-analysis", { auth: "none", query: { ...params } }),

	mostTraveled: (params: { originCityCode: string; period: string; max?: number; sort?: string }) =>
		tvaRequest<any>("/api/v1/flights/insights/most-traveled", { auth: "none", query: { ...params } }),

	mostBooked: (params: { originCityCode: string; period: string; max?: number; sort?: string }) =>
		tvaRequest<any>("/api/v1/flights/insights/most-booked", { auth: "none", query: { ...params } }),

	busiestPeriod: (params: { cityCode: string; period: string; direction?: string }) =>
		tvaRequest<any>("/api/v1/flights/insights/busiest-period", { auth: "none", query: { ...params } }),
};
