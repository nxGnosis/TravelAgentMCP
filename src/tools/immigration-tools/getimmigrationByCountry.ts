import dedent from "dedent";
import { z } from "zod";
import { immigrationService } from "../../services/immigrationService.js";

const getImmigrationCountryParam = z.object({
	countryCode: z
		.string()
		.describe("The ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB')."),
});

type getImmigrationCountryParam = z.infer<typeof getImmigrationCountryParam>;

export const getImmigrationInfoByCountry = {
	name: "GET_IMMIGRATION_INFO_BY_COUNTRY",
	description: "Get immigration information for a specific country.",
	parameters: getImmigrationCountryParam,
	execute: async (params: getImmigrationCountryParam) => {
		try {
			const immigrationInfo =
				await immigrationService.getImmigrationInfoByCountry(
					params.countryCode,
				);

			// return dedent`
			// 	Immigration information for ${params.countryCode}:
			// 	${JSON.stringify(immigrationInfo, null, 2)}
			// `;

			// Rewriting the return text to be relevant to immigration information
			let formattedImmigrationInfo = `Immigration information for ${params.countryCode}:\n`;

			if (
				immigrationInfo && immigrationInfo.data && Array.isArray(immigrationInfo.data.data)
			) {
				if (immigrationInfo.data.data.length > 0) {
					immigrationInfo.data.data.forEach((service: any) => {
						formattedImmigrationInfo += `\nService: ${service.name || "N/A"}`;
						formattedImmigrationInfo += `\n  Description: ${service.description || "N/A"}`;
						formattedImmigrationInfo += `\n  Consultation Note: ${service.consultation_note || "N/A"}`;

						if (Array.isArray(service.countries)) {
							service.countries.forEach((countryInfo: any) => {
								if (countryInfo.country_code === params.countryCode) {
									formattedImmigrationInfo += `\n  Country: ${countryInfo.country_code || "N/A"}`;
									formattedImmigrationInfo += `\n    Consultation Fee: ${countryInfo.consultation_fee || "N/A"}`;
									formattedImmigrationInfo += `\n    Service Fee: ${countryInfo.service_fee || "N/A"}`;

									if (Array.isArray(countryInfo.requirements) && countryInfo.requirements.length > 0) {
										formattedImmigrationInfo += "\n    Requirements:";
										countryInfo.requirements.forEach((req: any) => {
											formattedImmigrationInfo += `\n      - ${req.requirement || "N/A"} (${req.response_type || "N/A"})`;
										});
									} else {
										formattedImmigrationInfo += "\n    No specific requirements listed for this country.";
									}
								}
							});
						} else {
							formattedImmigrationInfo += "\n  No country-specific information available.";
						}
					});
				} else {
					formattedImmigrationInfo +=
						"No specific immigration information found for this country.";
				}
			} else {
				formattedImmigrationInfo +=
					"Could not retrieve detailed immigration information.";
			}

			return dedent`${formattedImmigrationInfo}`;
		} catch (error) {
			// Rewriting error messages to be relevant to immigration information
			if (error instanceof Error) {
				return `Error fetching immigration information for ${params.countryCode}: ${error.message}`;
			}
			return `An unknown error occurred while fetching immigration information for ${params.countryCode}`;
		}
	},
};
