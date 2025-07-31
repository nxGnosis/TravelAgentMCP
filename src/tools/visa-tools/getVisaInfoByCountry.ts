
import dedent from "dedent";
import { z } from "zod";
import { visaService } from "../../services/visaService";

const getVisaCountryParam = z.object({
	countryCode: z
		.string()
		.describe(
			"The ISO 3166-1 alpha-2 country code (e.g., 'USA', 'GHA').",
		),
	currencyCode: z
		.string()
		.optional()
		.describe(
			"Optional currency code for the country, if applicable (e.g., 'USD', 'EUR').",
		),
});

type getVisaCountryParam = z.infer<typeof getVisaCountryParam>;

export const getVisaInfoByCountry = {
		name: "GET_VISA_INFO_BY_COUNTRY",
		description: "Get visa information for a specific country.",
		parameters: getVisaCountryParam,
		execute: async (params: getVisaCountryParam) => {
			try {
				const visaInfoResponse = await visaService.getVisaInfoByCountry(
					params.countryCode,
					params.currencyCode,
				);

				let formattedOutput = `Visa information for ${params.countryCode}:\n`;

				if (visaInfoResponse && visaInfoResponse.data) {
					const { visaCountry, visaNews, visaFaq, visaTypes, bookingsCount } = visaInfoResponse.data;

					if (visaCountry) {
						formattedOutput += `\nCountry: ${visaCountry.name} (${visaCountry.country_code})`;
						formattedOutput += `\nImage: ${visaCountry.image}`;
						formattedOutput += `\nBanned Countries: ${visaCountry.banned.join(', ') || 'None'}`;
						formattedOutput += `\nNo Visa Required For: ${visaCountry.no_visa.join(', ') || 'None'}`;
						formattedOutput += `\nStatus: ${visaCountry.status}`;
					} else {
						formattedOutput += "\nNo country details found.";
					}

					if (visaNews && visaNews.length > 0) {
						formattedOutput += "\n\nVisa News:";
						visaNews.forEach((news: any) => {
							formattedOutput += `\n- ${news.title || 'No title'}: ${news.content || 'No content'}`;
						});
					}

					if (visaFaq && visaFaq.length > 0) {
						formattedOutput += "\n\nVisa FAQ:";
						visaFaq.forEach((faq: any) => {
							formattedOutput += `\n- Question: ${faq.question || 'No question'}`;
							formattedOutput += `\n  Answer: ${faq.answer || 'No answer'}`;
						});
					}

					if (visaTypes && visaTypes.length > 0) {
						formattedOutput += "\n\nVisa Types:";
						visaTypes.forEach((type: any) => {
							formattedOutput += `\n- Type: ${type.visa_type || 'N/A'}`;
							formattedOutput += `\n  Requirements: ${type.requirements || 'N/A'}`;
							formattedOutput += `\n  Validity: ${type.validity || 'N/A'}`;
							formattedOutput += `\n  Notes: ${type.notes || 'N/A'}`;
						});
					}

					formattedOutput += `\n\nTotal Bookings: ${bookingsCount}`;

				} else {
					formattedOutput += "Could not retrieve visa information.";
				}

				return dedent`${formattedOutput}`;
			} catch (error) {
				if (error instanceof Error) {
					return `Error fetching visa information for ${params.countryCode}: ${error.message}`;
				}
				return `An unknown error occurred while fetching visa information for ${params.countryCode}`;
			}
		},
};
