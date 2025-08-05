import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import Colors from '@/constants/Colors';

type Props = {
    id: string;
    label?: string;
    value: string;
    onChange: (text: string) => void;
    placeholder?: string;
    rows?: number;
    required?: boolean;
    disabled?: boolean;
    dashed?: boolean;
};

const FormTextarea: React.FC<Props> = ({
    id,
    label,
    value,
    onChange,
    placeholder = '',
    rows = 4,
    required = false,
    disabled = false,
    dashed = false,
}) => {
    return (
        <View style={styles.group}>
            <Text style={styles.label}>{label}{required ? '*' : ''}</Text>
            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor="#666"
                multiline
                numberOfLines={rows}
                editable={!disabled}
                style={[
                    styles.textarea,
                    dashed && styles.dashed,
                    disabled && styles.disabled
                ]}
            />
        </View>
    );
};

export default FormTextarea;

const styles = StyleSheet.create({
    group: {
        marginBottom: 16,
    },
    label: {
        color: 'white',
        fontFamily: 'CormorantGaramond-Regular',
        fontSize: 18,
        marginBottom: 6,
    },
    textarea: {
        minHeight: 160,
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderRadius: 20,
        backgroundColor: Colors.beige,
        color: '#000',
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        textAlignVertical: 'top', 
    },
    dashed: {
        borderWidth: 2,
        borderColor: 'black',
        borderStyle: 'dashed',
    },
    disabled: {
        opacity: 0.5,
    },
});
