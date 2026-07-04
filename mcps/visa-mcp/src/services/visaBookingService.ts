import { tvaRequest } from "@travelagent-mcp/shared";

export const visaBookingService = {
	listBookings: (perPage?: number) =>
		tvaRequest<any>("/api/v1/visa/client/booking", { auth: "bearer", query: { per_page: perPage } }),

	getBooking: (visaBookingId: string) =>
		tvaRequest<any>(`/api/v1/visa/client/booking/${visaBookingId}`, { auth: "bearer" }),

	getBookingByApplicationUuid: (applicationUuid: string) =>
		tvaRequest<any>("/api/v1/visa/client/booking/details", {
			auth: "bearer",
			query: { application_uuid: applicationUuid },
		}),

	getUpdates: () => tvaRequest<any>("/api/v1/visa/client/updates", { auth: "bearer" }),

	getUpdatesByBooking: (visaBookingId: string) =>
		tvaRequest<any>(`/api/v1/visa/client/updates/booking-id/${visaBookingId}`, { auth: "bearer" }),

	getFollowupQuestions: () => tvaRequest<any>("/api/v1/visa/client/followup", { auth: "bearer" }),

	answerFollowup: (visaBookingId: string, answer: string) =>
		tvaRequest<any>(`/api/v1/visa/client/followup/answer/${visaBookingId}`, {
			auth: "bearer",
			method: "POST",
			body: { answer },
		}),

	getNotifications: () => tvaRequest<any>("/api/v1/visa/client/notification", { auth: "bearer" }),

	markNotificationRead: (notificationId: string) =>
		tvaRequest<any>(`/api/v1/visa/client/notification/${notificationId}`, {
			auth: "bearer",
			method: "PUT",
		}),

	getTransactions: () => tvaRequest<any>("/api/v1/visa/client/transaction", { auth: "bearer" }),

	getTransactionDetail: (visaBookingId: string) =>
		tvaRequest<any>(`/api/v1/visa/client/transaction/${visaBookingId}/detail`, { auth: "bearer" }),
};
