import { contentApiRequest, getVisaContentConfig } from "@travelagent-mcp/shared";

export const visaContentService = {
	getVisaInfoByCountry: async (countryCode: string, currencyCode?: string): Promise<any> => {
		const rawData = await contentApiRequest<any>(
			getVisaContentConfig(),
			`/visa/country/details/${countryCode}`,
			{ currencyCode },
		);

		return {
			data: {
				visaCountry: rawData.data?.visaCountry ?? null,
				visaNews: rawData.data?.visaNews ?? [],
				visaFaq: rawData.data?.visaFaq ?? [],
				visaTypes: rawData.data?.visaTypes ?? [],
				bookingsCount: rawData.data?.bookingsCount ?? 0,
			},
		};
	},
};
