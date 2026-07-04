import dedent from "dedent";
import { z } from "zod";
import { type AnyTool, defineTool, truncateForLLM } from "@travelagent-mcp/shared";
import { visaContentService } from "../services/visaContentService.js";

const params = z.object({
	countryCode: z.string().describe("The ISO 3166-1 alpha-3 country code (e.g., 'USA', 'GHA')."),
	currencyCode: z
		.string()
		.optional()
		.describe("Optional currency code for pricing (e.g., 'USD', 'EUR')."),
});

export const getVisaInfoByCountry = defineTool({
	name: "GET_VISA_INFO_BY_COUNTRY",
	description:
		"Get visa requirements, visa types, fees, FAQs and news for a specific destination country.",
	parameters: params,
	execute: async ({ countryCode, currencyCode }) => {
		const res = await visaContentService.getVisaInfoByCountry(countryCode, currencyCode);

		let out = `🛂 Visa information for ${countryCode}:\n`;
		const { visaCountry, visaNews, visaFaq, visaTypes, bookingsCount } = res.data ?? {};

		if (visaCountry) {
			out += `\n🌍 Country: ${visaCountry.name} (${visaCountry.country_code})`;
			out += `\n📸 Image: ${visaCountry.image || "N/A"}`;
			out += `\n👥 Banned Countries: ${visaCountry.banned?.join(", ") || "None"}`;
			out += `\n✈️ No Visa Required For: ${visaCountry.no_visa?.join(", ") || "None"}`;
			out += `\n⚠️ Status: ${visaCountry.status || "N/A"}`;
		} else {
			out += "\nNo country details found.";
		}

		if (visaNews?.length) {
			out += "\n\n📰 Visa News:";
			for (const news of visaNews) out += `\n  - ${news.title || "No title"}: ${news.content || "No content"}`;
		}

		if (visaFaq?.length) {
			out += "\n\n📚 Visa FAQ:";
			for (const faq of visaFaq) {
				out += `\n  - 💬 Q: ${faq.question || "N/A"}`;
				out += `\n    💬 A: ${faq.answer || "N/A"}`;
			}
		}

		if (visaTypes?.length) {
			out += "\n\n🎟️ Visa Types:";
			for (const type of visaTypes) {
				out += `\nVisa Type: ${type.name || "N/A"}`;
				out += `\n🌍 Country Code: ${type.country_code || "N/A"}`;
				out += `\n💰 Total Price: $${type.total_price || "N/A"}`;
				out += `\n💰 Processing Fee: $${type.processing_fee || "N/A"}`;
				out += `\n💰 Government Fee: $${type.government_fee || "N/A"}`;
				out += `\n💼 Entry Type: ${type.entry_type || "N/A"}`;
				out += `\n⏰ Validity Period: ${type.validity_period || "N/A"} days`;
				out += `\n✅ Status: ${type.status || "N/A"}`;

				if (type.keyRequirements?.length) {
					out += "\n📄 Key Requirements:";
					for (const r of type.keyRequirements) out += `\n  - ${r.requirement || "N/A"}`;
				}
				if (type.benefits?.length) {
					out += "\n⭐ Benefits:";
					for (const b of type.benefits) out += `\n  - ${b.benefit || "N/A"}`;
				}
				if (type.additionalRequirements?.length) {
					out += "\n⚠️ Additional Requirements:";
					for (const a of type.additionalRequirements) out += `\n  - ${a.question || "N/A"}`;
				}
				out += "\n---\n";
			}
		}

		out += `\n🛒 Total Bookings: ${bookingsCount || 0}`;
		return truncateForLLM(dedent`${out}`);
	},
});

export const visaContentTools: AnyTool[] = [getVisaInfoByCountry];
