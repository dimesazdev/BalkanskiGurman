import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';

type HourEntry = {
    DayOfWeek: number;
    OpenHour: number | null;
    OpenMinute: number | null;
    CloseHour: number | null;
    CloseMinute: number | null;
    IsClosed: boolean;
};

type Props = {
    hours: HourEntry[];
    getDayName: (dayNum: number) => string;
    label: string;
    buttonText: string;
    onSuggestEdit?: () => void;
};

const WorkingHoursCard: React.FC<Props> = ({ hours, getDayName, label, buttonText, onSuggestEdit }) => {
    const { t } = useTranslation();
    const orderedDays = [1, 2, 3, 4, 5, 6, 7];

    const formatTimeManual = (hour: number | null, minute: number | null) => {
        if (hour == null || minute == null) return '';
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Icon name="clock-outline" size={22} color={Colors.red} />
                <Text style={styles.label}>{label}</Text>
            </View>

            <View style={styles.table}>
                {orderedDays.map((dayNum) => {
                    const h = hours.find((entry) => entry.DayOfWeek === dayNum);
                    const timeText = h?.IsClosed
                        ? t('labels.closed')
                        : `${formatTimeManual(h?.OpenHour ?? null, h?.OpenMinute ?? null)} - ${formatTimeManual(h?.CloseHour ?? null, h?.CloseMinute ?? null)}`;
                    return (
                        <View key={dayNum} style={styles.row}>
                            <Text style={styles.day}>{getDayName(dayNum)}</Text>
                            <Text style={styles.time}>{timeText}</Text>
                        </View>
                    );
                })}
            </View>

            <TouchableOpacity style={styles.button} onPress={onSuggestEdit}>
                <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default WorkingHoursCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.beige,
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
        gap: 16,
        alignItems: 'center',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    label: {
        fontSize: 22,
        color: '#333',
        fontFamily: 'CormorantSC-Bold',
    },
    table: {
        width: '100%',
        gap: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    day: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        fontFamily: 'CormorantSC-SemiBold',
    },
    time: {
        fontSize: 20,
        color: '#333',
        fontFamily: 'CormorantSC-Regular',
    },
    button: {
        borderWidth: 2,
        borderColor: Colors.red,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: {
        color: Colors.red,
        fontFamily: 'CormorantSC-SemiBold',
        fontSize: 16,
    },
});