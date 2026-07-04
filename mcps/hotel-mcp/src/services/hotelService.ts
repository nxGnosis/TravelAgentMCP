import { tvaRequest } from "@travelagent-mcp/shared";

export const hotelService = {
	search: (params: { iata: string; checkIn: string; checkOut: string; guests: number; bookingCurrency?: string }) =>
		tvaRequest<any>("/api/v1/hotels/amadeus/search", { auth: "none", query: { ...params } }),

	searchCities: (params: { cityCode: string; checkInDate: string; checkOutDate: string }) =>
		tvaRequest<any>("/api/v1/hotels/amadeus/cities", { auth: "none", query: { ...params } }),

	checkAvailability: (hotelOfferId: string) =>
		tvaRequest<any>(`/api/v1/hotels/amadeus/availability/${hotelOfferId}`, { auth: "none" }),

	book: (payload: unknown) =>
		tvaRequest<any>("/api/v1/hotels/amadeus/book", { auth: "none", method: "POST", body: payload }),

	listBookings: (perPage?: number) =>
		tvaRequest<any>("/api/v1/hotels/bookings", { auth: "bearer", query: { per_page: perPage } }),

	getBooking: (hotelTvaId: string) => tvaRequest<any>(`/api/v1/hotels/bookings/${hotelTvaId}`, { auth: "bearer" }),

	confirmPayment: (hotelTvaId: string, paystackReference: string) =>
		tvaRequest<any>(`/api/v1/hotels/bookings/${hotelTvaId}/confirm-payment`, {
			auth: "bearer",
			method: "POST",
			body: { paystack_reference: paystackReference },
		}),

	cancel: (hotelCancelUuid: string) =>
		tvaRequest<any>(`/api/v1/hotels/bookings/${hotelCancelUuid}/cancel`, { auth: "none", method: "DELETE" }),
};
