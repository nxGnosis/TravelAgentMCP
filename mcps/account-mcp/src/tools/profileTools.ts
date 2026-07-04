import { z } from "zod";
import {
	type AnyTool,
	confirmFlag,
	defineTool,
	requireConfirmation,
	truncateForLLM,
} from "@travelagent-mcp/shared";
import { profileService } from "../services/profileService.js";
import { withClearSession } from "../lib/session.js";

const json = (data: unknown) => truncateForLLM(JSON.stringify(data, null, 2));

export const getCurrentUser = defineTool({
	name: "GET_CURRENT_USER",
	description: "Get the logged-in user's dashboard summary (bookings overview, account status).",
	parameters: z.object({}),
	execute: async () => json(await profileService.getCurrentUser()),
});

export const getUserProfile = defineTool({
	name: "GET_USER_PROFILE",
	description: "Get the logged-in user's full profile details.",
	parameters: z.object({}),
	execute: async () => json(await profileService.getProfile()),
});

export const editUserProfile = defineTool({
	name: "EDIT_USER_PROFILE",
	description: "Update the logged-in user's profile (name, phone, DOB, address, passport details).",
	parameters: z.object({
		firstName: z.string().optional(),
		lastName: z.string().optional(),
		phoneNumber: z.string().optional(),
		dateOfBirth: z.string().optional(),
		gender: z.enum(["male", "female"]).optional(),
		address: z.string().optional(),
		passportNumber: z.string().optional(),
		passportExpiryDate: z.string().optional(),
		passportNationality: z.string().length(2).optional(),
	}),
	execute: async (params) => {
		const body: Record<string, unknown> = {};
		if (params.firstName) body.first_name = params.firstName;
		if (params.lastName) body.last_name = params.lastName;
		if (params.phoneNumber) body.phone_number = params.phoneNumber;
		if (params.dateOfBirth) body.date_of_birth = params.dateOfBirth;
		if (params.gender) body.gender = params.gender;
		if (params.address) body.address = params.address;
		if (params.passportNumber) body.passport_number = params.passportNumber;
		if (params.passportExpiryDate) body.passport_expiry_date = params.passportExpiryDate;
		if (params.passportNationality) body.passport_nationality = params.passportNationality;
		return json(await profileService.editProfile(body));
	},
});

export const changePassword = defineTool({
	name: "CHANGE_PASSWORD",
	description:
		"Change the logged-in user's password. Confirm with the user that they really want to change it " +
		"before calling with confirm: true — a mistake here can lock them out.",
	parameters: z.object({
		currentPassword: z.string(),
		newPassword: z.string().min(8),
		confirm: confirmFlag,
	}),
	execute: async ({ currentPassword, newPassword, confirm }) => {
		requireConfirmation(confirm, "changing the account password");
		const res = await profileService.changePassword({
			current_password: currentPassword,
			password: newPassword,
			password_confirmation: newPassword,
		});
		return res?.message ?? "Password changed.";
	},
});

export const checkDiscountPromo = defineTool({
	name: "CHECK_DISCOUNT_PROMO",
	description: "Check whether a discount/promo code is valid and what it offers.",
	parameters: z.object({ code: z.string() }),
	execute: async ({ code }) => json(await profileService.checkDiscountPromo(code)),
});

export const getUserNotifications = defineTool({
	name: "GET_USER_NOTIFICATIONS",
	description: "Get the logged-in user's general account notifications.",
	parameters: z.object({}),
	execute: async () => json(await profileService.getNotifications()),
});

export const closeAccount = defineTool({
	name: "CLOSE_ACCOUNT",
	description:
		"Permanently close the logged-in user's account. Irreversible — this must only be called after the " +
		"user has unambiguously and explicitly asked to close their account, with confirm: true.",
	parameters: z.object({ confirm: confirmFlag }),
	execute: async ({ confirm }) => {
		requireConfirmation(confirm, "permanently closing the account");
		await profileService.closeAccount();
		return withClearSession("Account closed.");
	},
});

export const profileTools: AnyTool[] = [
	getCurrentUser,
	getUserProfile,
	editUserProfile,
	changePassword,
	checkDiscountPromo,
	getUserNotifications,
	closeAccount,
];
