import dedent from "dedent";
import { z } from "zod";
import { type AnyTool, defineTool, truncateForLLM } from "@travelagent-mcp/shared";
import { immigrationContentService } from "../services/immigrationContentService.js";

const params = z.object({
	countryCode: z.string().describe("The ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB')."),
});

export const getImmigrationInfoByCountry = defineTool({
	name: "GET_IMMIGRATION_INFO_BY_COUNTRY",
	description: "Get immigration services, requirements and fees available for a specific country.",
	parameters: params,
	execute: async ({ countryCode }) => {
		const info = await immigrationContentService.getImmigrationInfoByCountry(countryCode);

		let out = `💼 Immigration information for ${countryCode}:\n`;

		if (info?.data && Array.isArray(info.data.data) && info.data.data.length > 0) {
			for (const service of info.data.data) {
				out += `\n🏛️ Service: ${service.name || "N/A"}`;
				out += `\n📄 Description: ${service.description || "N/A"}`;
				out += `\n💬 Consultation Note: ${service.consultation_note || "N/A"}`;

				if (Array.isArray(service.countries) && service.countries.length > 0) {
					for (const country of service.countries) {
						out += `\n🌍 Country: ${country.country_code || "N/A"}`;
						out += `\n💰 Consultation Fee: $${country.consultation_fee || "N/A"}`;
						out += `\n💰 Service Fee: $${country.service_fee || "N/A"}`;

						if (Array.isArray(country.requirements) && country.requirements.length > 0) {
							out += "\n✅ Requirements:";
							for (const req of country.requirements) {
								out += `\n  - ${req.requirement || "N/A"} (${req.response_type || "N/A"})`;
							}
						} else {
							out += "\nNo specific requirements listed for this country.";
						}
						out += "\n";
					}
				} else {
					out += "\nNo country-specific information available.";
				}
				out += "\n---\n";
			}
		} else {
			out += "No specific immigration information found for this country.";
		}

		return truncateForLLM(dedent`${out}`);
	},
});

export const immigrationContentTools: AnyTool[] = [getImmigrationInfoByCountry];
