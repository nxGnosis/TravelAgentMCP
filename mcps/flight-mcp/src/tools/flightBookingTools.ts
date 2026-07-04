import { z } from "zod";
import {
	type AnyTool,
	confirmFlag,
	defineTool,
	getTvaConfig,
	GuardrailError,
	perPage,
	requireConfirmation,
	truncateForLLM,
} from "@travelagent-mcp/shared";
import { flightBookingService } from "../services/flightBookingService.js";
import { getCachedOffer } from "../lib/offerCache.js";

const json = (data: unknown) => truncateForLLM(JSON.stringify(data, null, 2));

// ── Book ──────────────────────────────────────────────────────────────────────

const travelerDocument = z.object({
	documentType: z.enum(["PASSPORT", "IDENTITY_CARD", "VISA"]).default("PASSPORT"),
	birthPlace: z.string().optional(),
	issuanceLocation: z.string().optional(),
	issuanceDate: z.string().optional(),
	number: z.string(),
	expiryDate: z.string(),
	issuanceCountry: z.string().length(2),
	validityCountry: z.string().length(2),
	nationality: z.string().length(2),
	holder: z.boolean().optional(),
});

const bookingTraveler = z.object({
	id: z.string().describe("Must match the traveler id used in SEARCH_FLIGHTS."),
	dateOfBirth: z.string(),
	name: z.object({ firstName: z.string(), lastName: z.string() }),
	gender: z.enum(["MALE", "FEMALE"]),
	contact: z.object({
		emailAddress: z.string().email(),
		phones: z.array(
			z.object({
				deviceType: z.enum(["MOBILE", "LANDLINE"]).default("MOBILE"),
				countryCallingCode: z.string(),
				number: z.string(),
			}),
		),
	}),
	documents: z.array(travelerDocument).min(1),
});

export const bookFlight = defineTool({
	name: "BOOK_FLIGHT",
	description:
		"Book a flight for real money. Requires a freshly CONFIRM_FLIGHT_PRICE'd offerRef and full traveler " +
		"details. Only call this after the user has explicitly confirmed the exact price, dates, and traveler " +
		"names read back to them — pass confirm: true only at that point.",
	parameters: z.object({
		offerRef: z.string().describe("An offerRef that was just re-priced via CONFIRM_FLIGHT_PRICE."),
		currency: z.string().length(3).optional(),
		travelers: z.array(bookingTraveler).min(1),
		confirm: confirmFlag,
	}),
	execute: async ({ offerRef, currency, travelers, confirm }) => {
		requireConfirmation(confirm, "booking a flight");
		const flightOffer = getCachedOffer(offerRef);
		if (!flightOffer) {
			throw new GuardrailError(
				`offerRef "${offerRef}" was not found or has expired. Re-run CONFIRM_FLIGHT_PRICE first.`,
			);
		}
		return json(await flightBookingService.book({ flightOffer, currency, travelers }));
	},
});

// ── Manage bookings ───────────────────────────────────────────────────────────

export const listMyFlightBookings = defineTool({
	name: "LIST_MY_FLIGHT_BOOKINGS",
	description: "List the logged-in user's flight bookings.",
	parameters: z.object({ perPage }),
	execute: async ({ perPage }) => json(await flightBookingService.listBookings(perPage)),
});

export const getFlightBooking = defineTool({
	name: "GET_FLIGHT_BOOKING",
	description: "Get the full itinerary for one of the logged-in user's flight bookings.",
	parameters: z.object({ flightBookingId: z.string() }),
	execute: async ({ flightBookingId }) => json(await flightBookingService.getBooking(flightBookingId)),
});

export const verifyFlightBooking = defineTool({
	name: "VERIFY_FLIGHT_BOOKING",
	description: "Publicly verify a flight booking by its TVA ID (e.g. from a QR code) — no login required.",
	parameters: z.object({ tvaId: z.string() }),
	execute: async ({ tvaId }) => json(await flightBookingService.verify(tvaId)),
});

export const cancelFlightBooking = defineTool({
	name: "CANCEL_FLIGHT_BOOKING",
	description:
		"Cancel a flight booking using the cancellation UUID sent to the traveler's email. Irreversible — " +
		"confirm the booking details with the user before calling with confirm: true.",
	parameters: z.object({ cancelUuid: z.string(), confirm: confirmFlag }),
	execute: async ({ cancelUuid, confirm }) => {
		requireConfirmation(confirm, "cancelling a flight booking");
		return json(await flightBookingService.cancel(cancelUuid));
	},
});

export const getFlightSeatPrice = defineTool({
	name: "GET_FLIGHT_SEAT_PRICE",
	description: "Check the price of a specific seat on a booking before selecting it.",
	parameters: z.object({
		tvaId: z.string(),
		seatNumber: z.string().describe("e.g. '15A'."),
		segmentIndex: z.number().int().min(0),
	}),
	execute: async ({ tvaId, seatNumber, segmentIndex }) =>
		json(await flightBookingService.seatPrice(tvaId, seatNumber, segmentIndex)),
});

export const selectFlightSeat = defineTool({
	name: "SELECT_FLIGHT_SEAT",
	description:
		"Select a seat on a booking. If the seat has a price, this charges the stored payment method — check " +
		"GET_FLIGHT_SEAT_PRICE first and confirm the price with the user before calling with confirm: true.",
	parameters: z.object({
		tvaId: z.string(),
		travelerId: z.string(),
		segmentId: z.string(),
		seatNumber: z.string(),
		paystackReference: z.string().optional().describe("Required only if the seat has a price."),
		confirm: confirmFlag,
	}),
	execute: async ({ tvaId, travelerId, segmentId, seatNumber, paystackReference, confirm }) => {
		requireConfirmation(confirm, "selecting a seat");
		return json(
			await flightBookingService.selectSeat(tvaId, {
				traveler_id: travelerId,
				segment_id: segmentId,
				seat_number: seatNumber,
				...(paystackReference ? { paystack_reference: paystackReference } : {}),
			}),
		);
	},
});

export const resendFlightTicket = defineTool({
	name: "RESEND_FLIGHT_TICKET",
	description: "Resend the e-ticket email for a booking.",
	parameters: z.object({ tvaId: z.string() }),
	execute: async ({ tvaId }) => json(await flightBookingService.resendTicket(tvaId)),
});

export const getFlightTicketDownloadLink = defineTool({
	name: "GET_FLIGHT_TICKET_DOWNLOAD_LINK",
	description:
		"Get the direct download URL for a booking's e-ticket PDF. Returns a link for the user to open — " +
		"does not fetch the PDF contents.",
	parameters: z.object({ tvaId: z.string() }),
	execute: async ({ tvaId }) => {
		const { baseUrl } = getTvaConfig();
		return json({ url: `${baseUrl}/api/v1/flights/ticket/${tvaId}/download` });
	},
});

export const confirmFlightPayment = defineTool({
	name: "CONFIRM_FLIGHT_PAYMENT",
	description:
		"Confirm a flight booking payment using a Paystack transaction reference obtained from the checkout " +
		"flow. Confirm the amount with the user before calling with confirm: true.",
	parameters: z.object({ tvaId: z.string(), paystackReference: z.string(), confirm: confirmFlag }),
	execute: async ({ tvaId, paystackReference, confirm }) => {
		requireConfirmation(confirm, "confirming a flight payment");
		return json(await flightBookingService.confirmPayment(tvaId, paystackReference));
	},
});

export const flightBookingTools: AnyTool[] = [
	bookFlight,
	listMyFlightBookings,
	getFlightBooking,
	verifyFlightBooking,
	cancelFlightBooking,
	getFlightSeatPrice,
	selectFlightSeat,
	resendFlightTicket,
	getFlightTicketDownloadLink,
	confirmFlightPayment,
];
