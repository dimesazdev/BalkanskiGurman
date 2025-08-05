import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import FormSelect from './FormSelect';
import i18n from '../i18n';
import Colors from '@/constants/Colors';
import translatedCountries from '../assets/locales/translatedCountries.json';

interface Country {
    name: string;
    isoCode: string;
    translations: Record<string, string>;
}

interface CountryPickerProps {
    value?: string;
    onChange: (country: { countryIso: string; countryName: string }) => void;
    required?: boolean;
    disabled?: boolean;
    allowedIsoCodes?: string[];
}

const CountryPicker: React.FC<CountryPickerProps> = ({
    value,
    onChange,
    required = false,
    disabled = false,
    allowedIsoCodes,
}) => {
    const { t } = useTranslation();
    const [countryList, setCountryList] = useState<
        { label: string; value: string; originalName: string }[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const lang = i18n.language?.split('-')[0] || 'en';

        const filtered = allowedIsoCodes
            ? translatedCountries.filter((c) => allowedIsoCodes.includes(c.isoCode))
            : translatedCountries;

        const translated = filtered.map((c) => ({
            label: (c.translations as Record<string, string>)?.[lang] || c.translations?.en || c.name,
            value: c.isoCode,
            originalName: c.name,
        }));

        setCountryList(translated.sort((a, b) => a.label.localeCompare(b.label)));
        setLoading(false);
    }, [i18n.language, allowedIsoCodes]);

    const handleChange = (val: string | number) => {
        const selected = countryList.find((c) => c.value === val);
        onChange({
            countryIso: String(val),
            countryName: selected?.originalName || '',
        });
    };

    if (loading) {
        return <ActivityIndicator size="small" color={Colors.red} />;
    }

    return (
        <FormSelect
            label={t('register.country') + ' *'}
            value={(value ?? '') as string}
            onChange={handleChange}
            options={[{ label: t('register.countryPlaceholder'), value: '' }, ...countryList]}
            placeholder={t('register.countryPlaceholder')}
        />
    );
};

export default CountryPicker;