export const getLocalizedCities = (isoCode, lang, fallbackCities, translatedCities) => {
    const localized = fallbackCities.map((city) => {
        const override = translatedCities.find(
            (c) => c.countryCode === isoCode && c.name === city.name
        );

        return {
            value: city.name,
            label: override?.translations?.[lang] || city.name,
        };
    });

    return localized.sort((a, b) => a.label.localeCompare(b.label));
};