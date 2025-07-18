import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@/constants/Colors';

type Props = {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    onSubmit?: () => void;
};

const SearchBar: React.FC<Props> = ({
    value,
    onChange,
    placeholder = '',
    onSubmit,
}) => {
    const handleSubmit = () => {
        if (onSubmit) onSubmit();
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#888"
                value={value}
                onChangeText={onChange}
                returnKeyType="search"
                onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity onPress={handleSubmit}>
                <Icon name="magnify" size={24} color="#2f2f2f" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEEDB',
        paddingHorizontal: 16,
        borderRadius: 20,
        height: 48,
        flex: 1,
        minWidth: 200,
        maxWidth: 480,
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontFamily: 'CormorantGaramond-Regular',
        color: '#000',
        height: '100%',
    },
});

export default SearchBar;