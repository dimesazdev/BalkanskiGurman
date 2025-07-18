import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import CountryPicker, { Country } from 'react-native-country-picker-modal';
import Colors from '@/constants/Colors';

type PhoneValue = {
    phoneNumber: string;
    countryCode: string;
};

type Props = {
    value: PhoneValue;
    onChange: (val: PhoneValue) => void;
    label: string;
};

const PhoneNumberPicker: React.FC<Props> = ({ value, onChange, label }) => {
    const defaultCountry: Country = {
        cca2: 'MK',
        callingCode: ['389'],
        currency: ['MKD'],
        name: 'North Macedonia',
        region: 'Europe',
        subregion: 'Southern Europe',
        flag: 'flag-mk',
    };

    const [country, setCountry] = useState<Country>(defaultCountry);
    const [visible, setVisible] = useState(false);

    const handleSelect = (selected: Country) => {
        setCountry(selected);
        setVisible(false);
        onChange({
            phoneNumber: value.phoneNumber,
            countryCode: `+${selected.callingCode[0]}`,
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TouchableOpacity style={styles.flagButton} onPress={() => setVisible(true)}>
                    <CountryPicker
                        withCallingCode
                        withFilter
                        withFlag
                        countryCode={country.cca2}
                        visible={visible}
                        onClose={() => setVisible(false)}
                        onSelect={handleSelect}
                    />
                    <Text style={styles.code}>+{country.callingCode[0]}</Text>
                </TouchableOpacity>
                <TextInput
                    value={value.phoneNumber}
                    onChangeText={(text) =>
                        onChange({
                            phoneNumber: text,
                            countryCode: `+${country.callingCode[0]}`,
                        })
                    }
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
