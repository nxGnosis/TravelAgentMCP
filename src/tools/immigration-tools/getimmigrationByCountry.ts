
import dedent from "dedent";
import { z } from "zod";
import { immigrationService } from "../../services/immigrationService";

const getImmigrationCountryParam = z.object({
	countryCode: z
		.string()
		.describe(
			"The ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB').",
		),
});

type getImmigrationCountryParam = z.infer<typeof getImmigrationCountryParam>;

export const getImmigrationInfoByCountry = {
		name: "GET_IMMIGRATION_INFO_BY_COUNTRY",
		description: "Get immigration information for a specific country.",
		parameters: getImmigrationCountryParam,
		execute: async (params: getImmigrationCountryParam) => {
			try {
				const immigrationInfo = await immigrationService.getImmigrationInfoByCountry(
					params.countryCode,
				);

				// return dedent`
				// 	Immigration information for ${params.countryCode}:
				// 	${JSON.stringify(immigrationInfo, null, 2)}
				// `;
	
				// Rewriting the return text to be relevant to immigration information
				let formattedImmigrationInfo = `Immigration information for ${params.countryCode}:\n`;

				if (immigrationInfo && immigrationInfo.data && Array.isArray(immigrationInfo.data.data)) {
					if (immigrationInfo.data.data.length > 0) {
						immigrationInfo.data.data.forEach((immigration: any) => {
							formattedImmigrationInfo += `\n- Immigration Type: ${immigration.visa_type || 'N/A'}`;
							formattedImmigrationInfo += `\n  Requirements: ${immigration.requirements || 'N/A'}`;
							formattedImmigrationInfo += `\n  Validity: ${immigration.validity || 'N/A'}`;
							formattedImmigrationInfo += `\n  Notes: ${immigration.notes || 'N/A'}`;
						});
					} else {
						formattedImmigrationInfo += "No specific immigration information found for this country.";
					}
				} else {
					formattedImmigrationInfo += "Could not retrieve detailed immigration information.";
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
