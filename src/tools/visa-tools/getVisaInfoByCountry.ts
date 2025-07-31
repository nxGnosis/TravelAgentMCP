
import dedent from "dedent";
import { z } from "zod";
import { visaService } from "../../services/visaService";

const getVisaCountryParam = z.object({
	countryCode: z
		.string()
		.describe(
			"The ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB').",
		),
});

type getVisaCountryParam = z.infer<typeof getVisaCountryParam>;

export const getVisaInfoByCountry = {
		name: "GET_VISA_INFO_BY_COUNTRY",
		description: "Get visa information for a specific country.",
		parameters: getVisaCountryParam,
		execute: async (params: getVisaCountryParam) => {
			try {
				const visaInfo = await visaService.getVisaInfoByCountry(
					params.countryCode,
				);

				// return dedent`
				// 	Visa information for ${params.countryCode}:
				// 	${JSON.stringify(visaInfo, null, 2)}
				// `;
	
				// Rewriting the return text to be relevant to visa information
				let formattedVisaInfo = `Visa information for ${params.countryCode}:\n`;

				if (visaInfo && visaInfo.data && Array.isArray(visaInfo.data.data)) {
					if (visaInfo.data.data.length > 0) {
						visaInfo.data.data.forEach((visa: any) => {
							formattedVisaInfo += `\n- Visa Type: ${visa.visa_type || 'N/A'}`;
							formattedVisaInfo += `\n  Requirements: ${visa.requirements || 'N/A'}`;
							formattedVisaInfo += `\n  Validity: ${visa.validity || 'N/A'}`;
							formattedVisaInfo += `\n  Notes: ${visa.notes || 'N/A'}`;
						});
					} else {
						formattedVisaInfo += "No specific visa information found for this country.";
					}
				} else {
					formattedVisaInfo += "Could not retrieve detailed visa information.";
				}

				return dedent`${formattedVisaInfo}`;
			} catch (error) {
				// Rewriting error messages to be relevant to visa information
				if (error instanceof Error) {
					return `Error fetching visa information for ${params.countryCode}: ${error.message}`;
				}
				return `An unknown error occurred while fetching visa information for ${params.countryCode}`;
			}
		},
};
