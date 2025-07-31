import dedent from "dedent";
import { visaService } from "./src/services/visaService";

async function checkVisaInfo() {
    const countryCode = "XX"; // Placeholder country code
    try {
        const visaInfo = await visaService.getVisaInfoByCountry(countryCode);
        const formattedOutput = dedent`
            Visa information for ${countryCode}:
            ${JSON.stringify(visaInfo, null, 2)}
        `;
        console.log(formattedOutput);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching visa information for ${countryCode}: ${error.message}`);
        } else {
            console.error(`An unknown error occurred while fetching visa information for ${countryCode}`);
        }
    }
}

checkVisaInfo();
