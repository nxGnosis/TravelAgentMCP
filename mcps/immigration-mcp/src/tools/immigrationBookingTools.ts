import { z } from "zod";
import { type AnyTool, defineTool, truncateForLLM } from "@travelagent-mcp/shared";
import { immigrationBookingService } from "../services/immigrationBookingService.js";

const json = (data: unknown) => truncateForLLM(JSON.stringify(data, null, 2));

export const listMyImmigrationBookings = defineTool({
	name: "LIST_MY_IMMIGRATION_BOOKINGS",
	description: "List the logged-in user's immigration service bookings.",
	parameters: z.object({}),
	execute: async () => json(await immigrationBookingService.listBookings()),
});

export const getImmigrationBooking = defineTool({
	name: "GET_IMMIGRATION_BOOKING",
	description: "Get full detail for one of the logged-in user's immigration bookings.",
	parameters: z.object({ bookingId: z.string().describe("The immigration booking ID.") }),
	execute: async ({ bookingId }) => json(await immigrationBookingService.getBooking(bookingId)),
});

export const getImmigrationUpdates = defineTool({
	name: "GET_IMMIGRATION_UPDATES",
	description: "Get all status updates across the logged-in user's immigration bookings.",
	parameters: z.object({}),
	execute: async () => json(await immigrationBookingService.getUpdates()),
});

export const getImmigrationUpdatesByBooking = defineTool({
	name: "GET_IMMIGRATION_UPDATES_BY_BOOKING",
	description: "Get status updates for one specific immigration booking.",
	parameters: z.object({ bookingId: z.string().describe("The immigration booking ID.") }),
	execute: async ({ bookingId }) => json(await immigrationBookingService.getUpdatesByBooking(bookingId)),
});

export const getImmigrationNotifications = defineTool({
	name: "GET_IMMIGRATION_NOTIFICATIONS",
	description: "Get the logged-in user's immigration-related notifications.",
	parameters: z.object({}),
	execute: async () => json(await immigrationBookingService.getNotifications()),
});

export const markImmigrationNotificationRead = defineTool({
	name: "MARK_IMMIGRATION_NOTIFICATION_READ",
	description: "Mark an immigration notification as read.",
	parameters: z.object({ notificationId: z.string().describe("The notification ID.") }),
	execute: async ({ notificationId }) =>
		json(await immigrationBookingService.markNotificationRead(notificationId)),
});

export const getImmigrationTransactions = defineTool({
	name: "GET_IMMIGRATION_TRANSACTIONS",
	description: "List the logged-in user's immigration-related payment transactions.",
	parameters: z.object({}),
	execute: async () => json(await immigrationBookingService.getTransactions()),
});

export const getImmigrationTransactionDetail = defineTool({
	name: "GET_IMMIGRATION_TRANSACTION_DETAIL",
	description: "Get detail for one immigration transaction.",
	parameters: z.object({ bookingId: z.string().describe("The immigration booking ID.") }),
	execute: async ({ bookingId }) => json(await immigrationBookingService.getTransactionDetail(bookingId)),
});

export const immigrationBookingTools: AnyTool[] = [
	listMyImmigrationBookings,
	getImmigrationBooking,
	getImmigrationUpdates,
	getImmigrationUpdatesByBooking,
	getImmigrationNotifications,
	markImmigrationNotificationRead,
	getImmigrationTransactions,
	getImmigrationTransactionDetail,
];
