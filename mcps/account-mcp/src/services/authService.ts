import { tvaRequest } from "@travelagent-mcp/shared";

export const authService = {
	register: (payload: {
		first_name: string;
		last_name: string;
		email: string;
		password: string;
		password_confirmation: string;
		phone_number: string;
	}) => tvaRequest<any>("/api/v1/user/register", { auth: "none", method: "POST", body: payload }),

	login: (email: string, password: string) =>
		tvaRequest<any>("/api/v1/user/login", { auth: "none", method: "POST", body: { email, password } }),

	socialAuth: (provider: string, token: string) =>
		tvaRequest<any>("/api/v1/user/social-auth", { auth: "none", method: "POST", body: { provider, token } }),

	forgotPassword: (email: string) =>
		tvaRequest<any>("/api/v1/user/forgot-password", { auth: "none", method: "POST", body: { email } }),

	resendOtp: (email: string) =>
		tvaRequest<any>("/api/v1/user/resend-otp", { auth: "none", method: "POST", body: { email } }),

	verifyOtp: (payload: { email: string; otp: string; password?: string; password_confirmation?: string }) =>
		tvaRequest<any>("/api/v1/user/verify-otp", { auth: "none", method: "POST", body: payload }),

	logout: () => tvaRequest<any>("/api/v1/user/logout", { auth: "bearer", method: "POST" }),
};
