import { z } from "zod";
import { type AnyTool, defineTool, isoDate, truncateForLLM } from "@travelagent-mcp/shared";
import { hotelService } from "../services/hotelService.js";

const json = (data: unknown) => truncateForLLM(JSON.stringify(data, null, 2));

export const searchHotels = defineTool({
	name: "SEARCH_HOTELS",
	description:
		"Search bookable hotel offers in a city for given dates and guest count (all-in-one pipeline — " +
		"returns priced, available offers with a hotelOfferId for each).",
	parameters: z.object({
		iata: z.string().length(3).describe("City/airport IATA code, e.g. 'LON'."),
		checkIn: isoDate,
		checkOut: isoDate,
		guests: z.number().int().min(1).max(20),
		bookingCurrency: z.string().length(3).optional(),
	}),
	execute: async (params) => json(await hotelService.search(params)),
});

export const searchHotelCities = defineTool({
	name: "SEARCH_HOTEL_CITIES",
	description: "Raw hotel-ID lookup by city code and dates (lower-level than SEARCH_HOTELS; no live pricing).",
	parameters: z.object({
		cityCode: z.string().length(3),
		checkInDate: isoDate,
		checkOutDate: isoDate,
	}),
	execute: async (params) => json(await hotelService.searchCities(params)),
});

export const checkHotelAvailability = defineTool({
	name: "CHECK_HOTEL_AVAILABILITY",
	description: "Re-check live availability and price for a specific hotel offer before booking.",
	parameters: z.object({ hotelOfferId: z.string() }),
	execute: async ({ hotelOfferId }) => json(await hotelService.checkAvailability(hotelOfferId)),
});

export const hotelSearchTools: AnyTool[] = [searchHotels, searchHotelCities, checkHotelAvailability];
