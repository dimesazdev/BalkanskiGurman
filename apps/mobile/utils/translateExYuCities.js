import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { City } from 'country-state-city';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const apiKey = process.env.VITE_AZURE_TRANSLATOR_KEY;
const endpoint = process.env.VITE_AZURE_TRANSLATOR_ENDPOINT;
const region = process.env.VITE_AZURE_TRANSLATOR_REGION;

if (!apiKey || !endpoint || !region) {
    console.error("❌ Missing environment variables. Please check your .env file.");
    process.exit(1);
}

// Ex-Yugoslav countries
const exYuCountryCodes = ["SI", "HR", "BA", "RS", "ME", "MK"];
const targetLanguages = {
    mk: "mk",
    sr: "sr-Latn",
    sl: "sl"
};

// Extract and deduplicate cities
const citySet = new Set();
const cities = [];

for (const code of exYuCountryCodes) {
    const cityList = City.getCitiesOfCountry(code);
    for (const c of cityList) {
        const key = `${c.name.toLowerCase()}|${code}`;
        if (!citySet.has(key)) {
            cities.push({ name: c.name, countryCode: code });
            citySet.add(key);
        }
    }
}

async function translateBatch(texts, to) {
    const url = `${endpoint}/translate?api-version=3.0&to=${to}`;
    const headers = {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json'
    };
    const body = texts.map(text => ({ Text: text }));

    const response = await axios.post(url, body, { headers });
    return response.data.map(entry => entry.translations[0].text);
}

async function main() {
    const names = cities.map(c => c.name);
    const translations = { mk: [], sr: [], sl: [] };

    for (const [langKey, langCode] of Object.entries(targetLanguages)) {
        console.log(`🔤 Translating cities to ${langKey}...`);
        for (let i = 0; i < names.length; i += 100) {
            const batch = names.slice(i, i + 100);
            const translated = await translateBatch(batch, langCode);
            translations[langKey].push(...translated);

            // wait 1.5 seconds between each batch to avoid 429
            await new Promise(resolve => setTimeout(resolve, 1500));

        }
    }

    const final = cities.map((c, i) => ({
        name: c.name,
        countryCode: c.countryCode,
        translations: {
            en: c.name,
            mk: translations.mk[i],
            sr: translations.sr[i],
            sl: translations.sl[i]
        }
    }));

    fs.writeFileSync(path.join(__dirname, 'translatedExYuCities.json'), JSON.stringify(final, null, 2), 'utf-8');
    console.log("✅ Translation complete. Output saved to translatedExYuCities.json");
}

main().catch(console.error);