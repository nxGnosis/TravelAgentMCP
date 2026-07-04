import { contentApiRequest, getImmigrationContentConfig } from "@travelagent-mcp/shared";

export const immigrationContentService = {
	getImmigrationInfoByCountry: async (countryCode: string): Promise<any> =>
		contentApiRequest<any>(getImmigrationContentConfig(), `/immigration/service/country/${countryCode}`, {
			per_page: 100,
		}),
};
