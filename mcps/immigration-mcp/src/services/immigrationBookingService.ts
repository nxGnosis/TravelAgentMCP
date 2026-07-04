import { tvaRequest } from "@travelagent-mcp/shared";

export const immigrationBookingService = {
	listBookings: () => tvaRequest<any>("/api/v1/immigration/client/booking", { auth: "bearer" }),

	getBooking: (bookingId: string) =>
		tvaRequest<any>(`/api/v1/immigration/client/booking/${bookingId}`, { auth: "bearer" }),

	getUpdates: () => tvaRequest<any>("/api/v1/immigration/client/booked-updates", { auth: "bearer" }),

	getUpdatesByBooking: (bookingId: string) =>
		tvaRequest<any>(`/api/v1/immigration/client/booked-updates/booking/${bookingId}`, { auth: "bearer" }),

	getNotifications: () => tvaRequest<any>("/api/v1/immigration/client/notification", { auth: "bearer" }),

	markNotificationRead: (notificationId: string) =>
		tvaRequest<any>(`/api/v1/immigration/client/notification/${notificationId}`, {
			auth: "bearer",
			method: "PUT",
		}),

	getTransactions: () => tvaRequest<any>("/api/v1/immigration/client/transaction", { auth: "bearer" }),

	getTransactionDetail: (bookingId: string) =>
		tvaRequest<any>(`/api/v1/immigration/client/transaction/${bookingId}/detail`, { auth: "bearer" }),
};
