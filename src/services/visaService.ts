import { config } from '../lib/config';

export const visaService = {
	getVisaInfoByCountry: async (countryCode: string): Promise<any> => {
		const url = `${config.visaApi.baseUrl}/immigration/service/country/${countryCode}`;
		try {
			const response = await fetch(url, {
				headers: {
					'x-api-key': config.visaApi.apiKey,
				},
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching visa info:', error);
			throw error;
		}
	},
};
