import { tvaRequest } from "@travelagent-mcp/shared";

export const profileService = {
	getCurrentUser: () => tvaRequest<any>("/api/v1/user", { auth: "bearer" }),

	getProfile: () => tvaRequest<any>("/api/v1/user/profile", { auth: "bearer" }),

	editProfile: (payload: Record<string, unknown>) =>
		tvaRequest<any>("/api/v1/user/edit-profile", { auth: "bearer", method: "POST", body: payload }),

	changePassword: (payload: { current_password: string; password: string; password_confirmation: string }) =>
		tvaRequest<any>("/api/v1/user/change-password", { auth: "bearer", method: "POST", body: payload }),

	checkDiscountPromo: (code: string) =>
		tvaRequest<any>("/api/v1/user/check-discount-promo", { auth: "bearer", query: { code } }),

	getNotifications: () => tvaRequest<any>("/api/v1/user/get-notification", { auth: "bearer" }),

	closeAccount: () => tvaRequest<any>("/api/v1/user/close-account", { auth: "bearer", method: "DELETE" }),
};
