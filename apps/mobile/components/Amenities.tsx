import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAmenityIcon } from '@/utils/getAmenityIcon';

type AmenitiesProps = {
    selected: string[];
    onChange: (val: string[]) => void;
};

const AMENITY_CODES = ['DELIV', 'PARK', 'PET', 'CARD', 'KIDS', 'SMOK', 'VEGAN', 'VEGE', 'GLUT', 'HALAL'];

const Amenities: React.FC<AmenitiesProps> = ({ selected, onChange }) => {
    const { t } = useTranslation();

    const toggleAmenity = (code: string) => {
        if (selected.includes(code)) {
            onChange(selected.filter((c) => c !== code));
        } else {
            onChange([...selected, code]);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {AMENITY_CODES.map((code) => {
                    const isSelected = selected.includes(code);
                    return (
                        <TouchableOpacity
                            key={code}
                            style={[styles.card, isSelected && styles.selected]}
                            onPress={() => toggleAmenity(code)}
                        >
                            <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                                {isSelected && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Icon name={getAmenityIcon(code)} size={18} color="#BA3B46" />
                            <Text style={styles.text}>{t(`amenities.${code}`)}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default Amenities;

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        width: '100%',
    },
    grid: {
        flexDirection: 'column',
        gap: 12,
        width: '100%',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.beige,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        minHeight: 56,
        width: '100%',
    },
    selected: {
        borderWidth: 1,
        borderColor: Colors.black,
    },
    checkbox: {
        width: 25,
        height: 25,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: Colors.beige,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    checkboxChecked: {
        backgroundColor: Colors.beige,
    },
    checkmark: {
        color: Colors.red,
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 20,
    },
    text: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: '#000',
    },
});