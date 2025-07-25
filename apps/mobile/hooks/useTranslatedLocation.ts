import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import translatedCountriesData from '../assets/locales/translatedCountries.json';
import translatedCitiesData from '../assets/locales/translatedCities.json';

type TranslatedEntry = {
    name: string;
    countryCode: string;
    translations: Record<string, string>;
    metro?: string;
    metroTranslations?: Record<string, string>;
};

export function useTranslatedLocation() {
    const { i18n } = useTranslation();
    const [translatedCountries] = useState(translatedCountriesData);
    const [translatedCities, setTranslatedCities] = useState<TranslatedEntry[]>([]);

    const countryNameToCode: Record<string, string> = {
        Macedonia: 'MK',
        Slovenia: 'SI',
        Croatia: 'HR',
        Serbia: 'RS',
        'Bosnia and Herzegovina': 'BA',
        Montenegro: 'ME',
    };

    useEffect(() => {
        setTranslatedCities(translatedCitiesData);
    }, [i18n.language]);

    const getTranslatedLocation = (city?: string, country?: string, language?: string) => {
        if (!country) return '';
        const isoCode = countryNameToCode[country.trim()] || country.trim();

        const translatedCountry =
            translatedCountries.find(c => c.name.toLowerCase() === country.toLowerCase())?.translations?.[i18n.language as keyof typeof translatedCountries[0]['translations']] ||
            country;

        if (!city) return translatedCountry;

        const cityEntry = translatedCities.find(
            c => c.countryCode.toUpperCase() === isoCode.toUpperCase() && c.name.toLowerCase() === city.toLowerCase()
        );

        const translatedCity = cityEntry?.translations?.[i18n.language] || city;
        const translatedMetro = cityEntry?.metroTranslations?.[i18n.language] || cityEntry?.metro;

        if (translatedMetro) {
            return `${translatedMetro} (${translatedCity}), ${translatedCountry}`;
        }

        return `${translatedCity}, ${translatedCountry}`;
    };

    return getTranslatedLocation;
}