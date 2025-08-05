import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import CountryPicker, {
    Country,
    getAllCountries,
    FlagType,
} from 'react-native-country-picker-modal';
import Colors from '@/constants/Colors';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

type PhoneValue = {
    phoneNumber: string;
    countryIso: string;
};

type Props = {
    value: PhoneValue;
    onChange: (val: PhoneValue) => void;
    label: string;
    required?: boolean;
    allowedIsoCodes?: string[];
    defaultIso?: string;
};

const DEFAULT_ISO = 'MK';
const DEFAULT_CODE = '389';

const PhoneNumberPicker: React.FC<Props> = ({ value, onChange, label, required, allowedIsoCodes, defaultIso }) => {
    const [allCountries, setAllCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [visible, setVisible] = useState(false);
    const [nationalNumber, setNationalNumber] = useState('');

    useEffect(() => {
        getAllCountries(FlagType.FLAT).then((countries) => {
            if (allowedIsoCodes) {
                setAllCountries(
                    countries.filter(c => allowedIsoCodes!.includes(c.cca2))
                );
            } else {
                setAllCountries(countries);
            }
        });
    }, [allowedIsoCodes]);

    useEffect(() => {
        if (allCountries.length === 0) return;

        const parsed = parsePhoneNumberFromString(value.phoneNumber);
        const detectedIso = parsed?.country || '';

        // Try to find matching country from parsed code
        let matchedCountry: Country | undefined;

        if (detectedIso) {
            matchedCountry = allCountries.find(c => c.cca2 === detectedIso);
        }

        if (!matchedCountry) {
            const fallbackIso = value.countryIso || defaultIso || DEFAULT_ISO;
            matchedCountry = allCountries.find(c => c.cca2 === fallbackIso);
        }

        if (!matchedCountry) return;

        setSelectedCountry(matchedCountry);

        if (parsed?.isValid()) {
            setNationalNumber(parsed.nationalNumber);
        } else {
            const dialCode = matchedCountry.callingCode[0];
            const fallback = value.phoneNumber.startsWith(`+${dialCode}`)
                ? value.phoneNumber.slice(dialCode.length + 1)
                : value.phoneNumber.replace(/^\+/, '');
            setNationalNumber(fallback);
        }
    }, [value.phoneNumber, value.countryIso, allCountries]);

    const handleSelect = (country: Country) => {
        setSelectedCountry(country);
        setVisible(false);
        const fullNumber = `+${country.callingCode[0]}${nationalNumber}`;
        onChange({ phoneNumber: fullNumber, countryIso: country.cca2 });
    };

    const handleNumberChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        setNationalNumber(cleaned);
        if (selectedCountry) {
            const dialCode = selectedCountry.callingCode[0];
            const full = `+${dialCode}${cleaned}`;
            onChange({ phoneNumber: full, countryIso: selectedCountry.cca2 });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}{required && " *"}</Text>
            <View style={styles.inputWrapper}>
                <TouchableOpacity style={styles.flagButton} onPress={() => setVisible(true)}>
                    {selectedCountry && (
                        <CountryPicker
                            withCallingCode
                            withFilter
                            withFlag
                            countryCode={selectedCountry.cca2}
                            visible={visible}
                            onClose={() => setVisible(false)}
                            onSelect={handleSelect}
                        />
                    )}
                    <Text style={styles.code}>
                        {selectedCountry ? `+${selectedCountry.callingCode[0]}` : ''}
                    </Text>
                </TouchableOpacity>
                <TextInput
                    value={nationalNumber}
                    onChangeText={handleNumberChange}
                    keyboardType="phone-pad"
                    style={styles.textInput}
                    placeholder="70123456"
                    placeholderTextColor="#666"
                />
            </View>
        </View>
    );
};

export default PhoneNumberPicker;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        color: Colors.white,
        fontSize: 18,
        fontFamily: 'CormorantGaramond-Regular',
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.beige,
        borderRadius: 20,
        height: 48,
        overflow: 'hidden',
    },
    flagButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: '100%',
    },
    code: {
        marginLeft: 8,
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: '#000',
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: '#000',
        paddingHorizontal: 16,
    },
});