import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
} from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';

type FormInputProps = {
    id: string;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    type?: TextInputProps['keyboardType'];
    secure?: boolean;
};

const FormInput = ({
    id,
    label,
    value,
    onChangeText,
    placeholder,
    error,
    required = false,
    disabled = false,
    type = 'default',
    secure = false
}: FormInputProps) => {
    return (
        <View style={styles.formGroup}>
            <Text style={styles.label}>
                {label}
                {required && <Text style={{ color: Colors.red }}> *</Text>}
            </Text>

            <TextInput
                style={[styles.input, error && styles.inputError]}
                onChangeText={onChangeText}
                value={value}
                placeholder={placeholder}
                editable={!disabled}
                keyboardType={type}
                placeholderTextColor="#666"
                secureTextEntry={secure}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

export default FormInput;

const styles = StyleSheet.create({
    formGroup: {
        position: 'relative',
    },
    label: {
        ...Typography.label
    },
    input: {
        height: 48,
        backgroundColor: Colors.beige,
        borderRadius: 20,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: '#000',
    },
    inputError: {
        borderWidth: 2,
        borderColor: Colors.red,
    },
    errorText: {
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: 4,
        backgroundColor: Colors.red,
        color: '#ffbaba',
        fontSize: 14,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        fontFamily: 'CormorantGaramond',
        zIndex: 10,
    }
});