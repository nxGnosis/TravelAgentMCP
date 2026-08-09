import { tvaRequest } from "@travelagent-mcp/shared";

export const flightBookingService = {
	book: (payload: unknown) =>
		tvaRequest<any>("/api/v1/flights/book", { auth: "optional", method: "POST", body: payload }),

	listBookings: (perPage?: number) =>
		tvaRequest<any>("/api/v1/flights/bookings", { auth: "bearer", query: { per_page: perPage } }),

	getBooking: (flightBookingId: string) =>
		tvaRequest<any>(`/api/v1/flights/bookings/${flightBookingId}`, { auth: "bearer" }),

	verify: (tvaId: string) => tvaRequest<any>(`/api/v1/flights/verify/${tvaId}`, { auth: "none" }),

	cancel: (cancelUuid: string) =>
		tvaRequest<any>(`/api/v1/flights/cancel/${cancelUuid}`, { auth: "none", method: "POST" }),

	seatPrice: (tvaId: string, seatNumber: string, segmentIndex: number) =>
		tvaRequest<any>(`/api/v1/flights/bookings/${tvaId}/seat-price`, {
			auth: "optional",
			query: { seat_number: seatNumber, segment_index: segmentIndex },
		}),

	selectSeat: (
		tvaId: string,
		body: { traveler_id: string; segment_id: string; seat_number: string; paystack_reference?: string },
	) =>
		tvaRequest<any>(`/api/v1/flights/bookings/${tvaId}/select-seat`, {
			auth: "optional",
			method: "POST",
			body,
		}),

	resendTicket: (tvaId: string) =>
		tvaRequest<any>(`/api/v1/flights/resend-ticket/${tvaId}`, { auth: "none", method: "POST" }),

	confirmPayment: (tvaId: string, paystackReference: string) =>
		tvaRequest<any>(`/api/v1/flights/bookings/${tvaId}/confirm-payment`, {
			auth: "optional",
			method: "POST",
			body: { paystack_reference: paystackReference },
		}),
};
