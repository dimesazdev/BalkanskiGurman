import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type WorkingHoursProps = {
    hours: { day: string; from: string; to: string }[];
    onChange: (val: { day: string; from: string; to: string }[]) => void;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WorkingHours: React.FC<WorkingHoursProps> = ({ hours, onChange }) => {
    const { t } = useTranslation();

    const toggleDay = (day: string) => {
        if (hours.some((h) => h.day === day)) {
            onChange(hours.filter((h) => h.day !== day));
        } else {
            onChange([...hours, { day, from: '08:00', to: '22:00' }]);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{t('restaurant.workingHours')}</Text>
            <View style={styles.grid}>
                {DAYS.map((day) => {
                    const isSelected = hours.some((h) => h.day === day);
                    return (
                        <TouchableOpacity
                            key={day}
                            style={[styles.day, isSelected && styles.selected]}
                            onPress={() => toggleDay(day)}
                        >
                            {isSelected && <Icon name="check" size={18} color="#000" />}
                            <Text style={styles.text}>{t(`days.${day}`)}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default WorkingHours;

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        fontFamily: 'CormorantGaramond-Regular',
        color: Colors.white,
        marginBottom: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    day: {
        backgroundColor: Colors.beige,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    selected: {
        borderWidth: 2,
        borderColor: Colors.black,
    },
    text: {
        fontSize: 16,
        color: '#000',
        fontFamily: 'CormorantGaramond-Regular',
    },
});