import { z } from "zod";
import { type AnyTool, defineTool, GuardrailError } from "@travelagent-mcp/shared";
import { authService } from "../services/authService.js";
import { extractSession, withClearSession, withSession } from "../lib/session.js";

export const registerUser = defineTool({
	name: "REGISTER_USER",
	description:
		"Create a new TVA account. Only call this after the user has explicitly asked to sign up and provided " +
		"their own details — never invent a password on their behalf. Registration requires OTP email " +
		"verification (VERIFY_OTP) before the account can log in.",
	parameters: z.object({
		firstName: z.string(),
		lastName: z.string(),
		email: z.string().email(),
		password: z.string().min(8),
		phoneNumber: z.string(),
	}),
	execute: async ({ firstName, lastName, email, password, phoneNumber }) => {
		const res = await authService.register({
			first_name: firstName,
			last_name: lastName,
			email,
			password,
			password_confirmation: password,
			phone_number: phoneNumber,
		});
		return (
			res?.message ??
			`Account created for ${email}. Check your email for a verification code, then use VERIFY_OTP.`
		);
	},
});

export const loginUser = defineTool({
	name: "LOGIN_USER",
	description:
		"Log the user in with their email and password. Never ask the user to paste a password from an " +
		"insecure channel without their explicit intent to log in right now; never store or repeat the password.",
	parameters: z.object({ email: z.string().email(), password: z.string() }),
	execute: async ({ email, password }) => {
		const res = await authService.login(email, password);
		const session = extractSession(res);
		if (!session) throw new GuardrailError("Login did not return a session — check the credentials.");
		return withSession(`Logged in as ${session.name ?? email}.`, session);
	},
});

export const socialAuthLogin = defineTool({
	name: "SOCIAL_AUTH_LOGIN",
	description: "Log the user in via a third-party provider token (e.g. Google) already obtained by the client.",
	parameters: z.object({
		provider: z.enum(["google", "facebook", "apple"]),
		providerToken: z.string(),
	}),
	execute: async ({ provider, providerToken }) => {
		const res = await authService.socialAuth(provider, providerToken);
		const session = extractSession(res);
		if (!session) throw new GuardrailError("Social login did not return a session.");
		return withSession(`Logged in as ${session.name ?? "user"} via ${provider}.`, session);
	},
});

export const forgotPassword = defineTool({
	name: "FORGOT_PASSWORD",
	description: "Send a password-reset OTP to the user's email.",
	parameters: z.object({ email: z.string().email() }),
	execute: async ({ email }) => {
		const res = await authService.forgotPassword(email);
		return res?.message ?? `A password reset code was sent to ${email}.`;
	},
});

export const resendOtp = defineTool({
	name: "RESEND_OTP",
	description: "Resend a one-time verification code to the user's email.",
	parameters: z.object({ email: z.string().email() }),
	execute: async ({ email }) => {
		const res = await authService.resendOtp(email);
		return res?.message ?? `A new code was sent to ${email}.`;
	},
});

export const verifyOtp = defineTool({
	name: "VERIFY_OTP",
	description:
		"Verify a one-time code sent by email — used both to confirm a new registration and to complete a " +
		"password reset (pass newPassword only for the password-reset flow). After verifying a fresh " +
		"registration, tell the user to log in with LOGIN_USER.",
	parameters: z.object({
		email: z.string().email(),
		otp: z.string(),
		newPassword: z.string().min(8).optional(),
	}),
	execute: async ({ email, otp, newPassword }) => {
		const res = await authService.verifyOtp({
			email,
			otp,
			...(newPassword ? { password: newPassword, password_confirmation: newPassword } : {}),
		});
		return res?.message ?? "Code verified.";
	},
});

export const logoutUser = defineTool({
	name: "LOGOUT_USER",
	description: "Log the current user out and end this session.",
	parameters: z.object({}),
	execute: async () => {
		await authService.logout();
		return withClearSession("Logged out.");
	},
});

export const authTools: AnyTool[] = [
	registerUser,
	loginUser,
	socialAuthLogin,
	forgotPassword,
	resendOtp,
	verifyOtp,
	logoutUser,
];
