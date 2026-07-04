import { z } from "zod";
import { type AnyTool, defineTool, perPage, truncateForLLM } from "@travelagent-mcp/shared";
import { visaBookingService } from "../services/visaBookingService.js";

const json = (data: unknown) => truncateForLLM(JSON.stringify(data, null, 2));

export const listMyVisaBookings = defineTool({
	name: "LIST_MY_VISA_BOOKINGS",
	description: "List the logged-in user's visa applications/bookings.",
	parameters: z.object({ perPage }),
	execute: async ({ perPage }) => json(await visaBookingService.listBookings(perPage)),
});

export const getVisaBooking = defineTool({
	name: "GET_VISA_BOOKING",
	description: "Get full detail for one of the logged-in user's visa bookings by booking ID.",
	parameters: z.object({ visaBookingId: z.string().describe("The visa booking ID.") }),
	execute: async ({ visaBookingId }) => json(await visaBookingService.getBooking(visaBookingId)),
});

export const getVisaBookingByApplicationUuid = defineTool({
	name: "GET_VISA_BOOKING_BY_APPLICATION_UUID",
	description: "Look up a visa booking by its application UUID (used for QR/receipt lookups).",
	parameters: z.object({ applicationUuid: z.string().describe("The visa application UUID.") }),
	execute: async ({ applicationUuid }) =>
		json(await visaBookingService.getBookingByApplicationUuid(applicationUuid)),
});

export const getVisaUpdates = defineTool({
	name: "GET_VISA_UPDATES",
	description: "Get all status updates across the logged-in user's visa bookings.",
	parameters: z.object({}),
	execute: async () => json(await visaBookingService.getUpdates()),
});

export const getVisaUpdatesByBooking = defineTool({
	name: "GET_VISA_UPDATES_BY_BOOKING",
	description: "Get status updates for one specific visa booking.",
	parameters: z.object({ visaBookingId: z.string().describe("The visa booking ID.") }),
	execute: async ({ visaBookingId }) => json(await visaBookingService.getUpdatesByBooking(visaBookingId)),
});

export const getVisaFollowupQuestions = defineTool({
	name: "GET_VISA_FOLLOWUP_QUESTIONS",
	description: "Get any outstanding follow-up questions the visa processing team needs answered.",
	parameters: z.object({}),
	execute: async () => json(await visaBookingService.getFollowupQuestions()),
});

export const answerVisaFollowup = defineTool({
	name: "ANSWER_VISA_FOLLOWUP",
	description:
		"Submit the user's answer to a visa follow-up question. Only call this with the user's own words " +
		"— never invent an answer on their behalf.",
	parameters: z.object({
		visaBookingId: z.string().describe("The visa booking ID the follow-up question belongs to."),
		answer: z.string().min(1).describe("The user's answer, verbatim."),
	}),
	execute: async ({ visaBookingId, answer }) =>
		json(await visaBookingService.answerFollowup(visaBookingId, answer)),
});

export const getVisaNotifications = defineTool({
	name: "GET_VISA_NOTIFICATIONS",
	description: "Get the logged-in user's visa-related notifications.",
	parameters: z.object({}),
	execute: async () => json(await visaBookingService.getNotifications()),
});

export const markVisaNotificationRead = defineTool({
	name: "MARK_VISA_NOTIFICATION_READ",
	description: "Mark a visa notification as read.",
	parameters: z.object({ notificationId: z.string().describe("The notification ID.") }),
	execute: async ({ notificationId }) => json(await visaBookingService.markNotificationRead(notificationId)),
});

export const getVisaTransactions = defineTool({
	name: "GET_VISA_TRANSACTIONS",
	description: "List the logged-in user's visa-related payment transactions.",
	parameters: z.object({}),
	execute: async () => json(await visaBookingService.getTransactions()),
});

export const getVisaTransactionDetail = defineTool({
	name: "GET_VISA_TRANSACTION_DETAIL",
	description: "Get detail for one visa transaction.",
	parameters: z.object({ visaBookingId: z.string().describe("The visa booking ID.") }),
	execute: async ({ visaBookingId }) => json(await visaBookingService.getTransactionDetail(visaBookingId)),
});

export const visaBookingTools: AnyTool[] = [
	listMyVisaBookings,
	getVisaBooking,
	getVisaBookingByApplicationUuid,
	getVisaUpdates,
	getVisaUpdatesByBooking,
	getVisaFollowupQuestions,
	answerVisaFollowup,
	getVisaNotifications,
	markVisaNotificationRead,
	getVisaTransactions,
	getVisaTransactionDetail,
];
