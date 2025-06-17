import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from current directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Access environment variables
const apiKey = process.env.VITE_AZURE_TRANSLATOR_KEY;
const endpoint = process.env.VITE_AZURE_TRANSLATOR_ENDPOINT;
const region = process.env.VITE_AZURE_TRANSLATOR_REGION;

if (!apiKey || !endpoint || !region) {
  console.error("❌ Missing environment variables. Please check your .env file.");
  process.exit(1);
}

// Load country data
const raw = fs.readFileSync(path.join(__dirname, 'countryCityList.json'), 'utf-8');
const inputData = JSON.parse(raw);
const countries = inputData.map(c => ({ name: c.name, isoCode: c.isoCode }));

const targetLanguages = {
  mk: 'mk',       // Macedonian (Cyrillic)
  sr: 'sr-Latn',  // Serbian (Latin)
  sl: 'sl'        // Slovenian
};

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
  const names = countries.map(c => c.name);
  const translations = { mk: [], sr: [], sl: [] };

  for (const [langKey, langCode] of Object.entries(targetLanguages)) {
    console.log(`🔤 Translating to ${langKey}...`);
    for (let i = 0; i < names.length; i += 100) {
      const batch = names.slice(i, i + 100);
      const translated = await translateBatch(batch, langCode);
      translations[langKey].push(...translated);
    }
  }

  const final = countries.map((c, i) => ({
    name: c.name,
    isoCode: c.isoCode,
    translations: {
      en: c.name,
      mk: translations.mk[i],
      sr: translations.sr[i],
      sl: translations.sl[i]
    }
  }));

  fs.writeFileSync(path.join(__dirname, 'translatedCountries.json'), JSON.stringify(final, null, 2), 'utf-8');
  console.log("✅ Translation complete. Output saved to translatedCountries.json");
}

main().catch(console.error);