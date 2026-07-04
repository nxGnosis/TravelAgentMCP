import { z } from "zod";
import {
	type AnyTool,
	confirmFlag,
	defineTool,
	perPage,
	requireConfirmation,
	truncateForLLM,
} from "@travelagent-mcp/shared";
import { hotelService } from "../services/hotelService.js";

const json = (data: unknown) => truncateForLLM(JSON.stringify(data, null, 2));

const guest = z.object({
	tid: z.number().int(),
	title: z.enum(["MR", "MRS", "MS"]),
	name: z.object({ firstName: z.string(), lastName: z.string() }),
	contact: z.object({ phone: z.string(), email: z.string().email() }),
});

const cardPayment = z.object({
	id: z.number().int(),
	method: z.literal("creditCard"),
	card: z.object({
		vendorCode: z.string().describe("2-letter card network code, e.g. 'VI' for Visa."),
		cardNumber: z.string().describe("Full card number. See BOOK_HOTEL's description for handling rules."),
		expiryDate: z.string().describe("YYYY-MM."),
	}),
});

export const bookHotel = defineTool({
	name: "BOOK_HOTEL",
	description:
		"Book a hotel for real money — the TVA hotel API takes raw card details directly in this call (no " +
		"separate tokenized checkout step exists yet). SECURITY: never ask the user to type their full card " +
		"number into this chat. This tool must only be invoked by a client that collected card details through " +
		"a secure, PCI-compliant surface (e.g. a payment widget) and is passing the result through — not by an " +
		"LLM prompting for it conversationally. Requires the user's explicit confirmation of price and dates " +
		"before calling with confirm: true.",
	parameters: z.object({
		offerId: z.string().describe("hotelOfferId from SEARCH_HOTELS or CHECK_HOTEL_AVAILABILITY."),
		bookingCurrency: z.string().length(3),
		vendorPrice: z.number().positive(),
		guests: z.array(guest).min(1),
		payments: z.array(cardPayment).min(1),
		confirm: confirmFlag,
	}),
	execute: async ({ confirm, ...payload }) => {
		requireConfirmation(confirm, "booking a hotel");
		return json(await hotelService.book(payload));
	},
});

export const listMyHotelBookings = defineTool({
	name: "LIST_MY_HOTEL_BOOKINGS",
	description: "List the logged-in user's hotel bookings.",
	parameters: z.object({ perPage }),
	execute: async ({ perPage }) => json(await hotelService.listBookings(perPage)),
});

export const getHotelBooking = defineTool({
	name: "GET_HOTEL_BOOKING",
	description: "Get full detail for one of the logged-in user's hotel bookings.",
	parameters: z.object({ hotelTvaId: z.string() }),
	execute: async ({ hotelTvaId }) => json(await hotelService.getBooking(hotelTvaId)),
});

export const confirmHotelPayment = defineTool({
	name: "CONFIRM_HOTEL_PAYMENT",
	description:
		"Confirm a hotel booking payment using a Paystack transaction reference from the checkout flow. " +
		"Confirm the amount with the user before calling with confirm: true.",
	parameters: z.object({ hotelTvaId: z.string(), paystackReference: z.string(), confirm: confirmFlag }),
	execute: async ({ hotelTvaId, paystackReference, confirm }) => {
		requireConfirmation(confirm, "confirming a hotel payment");
		return json(await hotelService.confirmPayment(hotelTvaId, paystackReference));
	},
});

export const cancelHotelBooking = defineTool({
	name: "CANCEL_HOTEL_BOOKING",
	description:
		"Cancel a hotel booking using the cancellation UUID sent to the guest's email. Irreversible — confirm " +
		"details with the user before calling with confirm: true.",
	parameters: z.object({ hotelCancelUuid: z.string(), confirm: confirmFlag }),
	execute: async ({ hotelCancelUuid, confirm }) => {
		requireConfirmation(confirm, "cancelling a hotel booking");
		return json(await hotelService.cancel(hotelCancelUuid));
	},
});

export const hotelBookingTools: AnyTool[] = [
	bookHotel,
	listMyHotelBookings,
	getHotelBooking,
	confirmHotelPayment,
	cancelHotelBooking,
];
