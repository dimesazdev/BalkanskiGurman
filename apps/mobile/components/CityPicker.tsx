import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { City } from 'country-state-city';
import FormSelect from './FormSelect';
import i18n from '../i18n';
import translatedCities from '../assets/locales/translatedCities.json';

const countriesWithStates = ['US', 'CA', 'AU'];
const exYuCountries = ['MK', 'RS', 'HR', 'BA', 'ME', 'SI'];

type CityPickerProps = {
    countryIso: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    disabled?: boolean;
};

const CityPicker: React.FC<CityPickerProps> = ({
    countryIso,
    value,
    onChange,
    required = false,
    disabled = false,
}) => {
    const { t } = useTranslation();
    const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!countryIso) return;

        const lang = (i18n.language || 'en').split('-')[0];
        setLoading(true);

        if (exYuCountries.includes(countryIso)) {
            const exYu = translatedCities
                .filter((c) => c.countryCode === countryIso)
                .map((c) => {
                    const cityLabel = (c.translations && (c.translations as Record<string, string>)[lang]) || c.translations?.en || c.name;
                    const metroLabel = c.metroTranslations?.[lang as keyof typeof c.metroTranslations] || c.metro || null;

                    return {
                        value: c.name,
                        label: metroLabel ? `${metroLabel} (${cityLabel})` : cityLabel,
                    };
                })
                .sort((a, b) => a.label.localeCompare(b.label));

            setCityOptions(exYu);
        } else {
            const fallbackCities = City.getCitiesOfCountry(countryIso) || [];

            const localized = fallbackCities.map((city) => {
                const baseLabel =
                    (translatedCities.find(
                        (c) => c.countryCode === countryIso && c.name === city.name
                    )?.translations as Record<string, string> | undefined)?.[lang] || city.name;

                const label = countriesWithStates.includes(countryIso)
                    ? `${baseLabel}, ${city.stateCode}`
                    : baseLabel;

                const value = countriesWithStates.includes(countryIso)
                    ? `${city.name}, ${city.stateCode}`
                    : city.name;

                return { value, label };
            });

            setCityOptions(localized.sort((a, b) => a.label.localeCompare(b.label)));
        }

        setLoading(false);
    }, [countryIso, i18n.language]); 

    const renderContent = () => {
        if (!countryIso || disabled) return null;
        if (loading) return <ActivityIndicator size="small" color="#BA3B46" />;

        const options =
            cityOptions.length > 0
                ? cityOptions
                : [{ label: t('register.noCities'), value: '' }];

        return (
            <FormSelect
                label={t('register.city')}
                value={value}
                onChange={(val) => onChange(String(val))}
                options={options}
                placeholder={t('register.cityPlaceholder')}
            />
        );
    };

    return <View style={{ width: '100%' }}>{renderContent()}</View>;
};

export default CityPicker;