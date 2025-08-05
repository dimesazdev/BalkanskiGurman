import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import FormSelect from '@/components/FormSelect';

export type WorkingHour = {
    DayOfWeek: number;
    OpenHour: number | '' | null;
    OpenMinute: number | '' | null;
    CloseHour: number | '' | null;
    CloseMinute: number | '' | null;
    IsClosed: boolean;
};

type Props = {
    workingHours: WorkingHour[];
    onChange: (index: number, updated: Partial<WorkingHour>) => void;
};

const WorkingHoursCardList: React.FC<Props> = ({ workingHours, onChange }) => {
    const { t } = useTranslation();

    const timeOptions = (limit: number) =>
        Array.from({ length: limit }, (_, i) => ({
            label: i.toString().padStart(2, '0'),
            value: i,
        }));

    return (
        <View style={styles.container}>
            {workingHours.map((entry, i) => {
                const isClosed = entry.IsClosed;

                return (
                    <View key={i} style={[styles.card, { opacity: isClosed ? 0.5 : 1 }]}>
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayLabel}>{t(`days.${i + 1}`)}</Text>
                        </View>

                        <View style={styles.timeBlock}>
                            <Text style={styles.label}>{t('form.openTime')}</Text>
                            <View style={styles.timeSelects}>
                                <FormSelect
                                    style={styles.select}
                                    value={entry.OpenHour ?? ''}
                                    onChange={(val) => {
                                        const parsed = val === '' ? '' : Number(val);
                                        onChange(i, { OpenHour: parsed });
                                    }}
                                    options={timeOptions(24)}
                                    disabled={isClosed}
                                    placeholder={t('restaurantForm.placeholder.hh')}
                                />
                                <FormSelect
                                    style={styles.select}
                                    value={entry.OpenMinute ?? ''}
                                    onChange={(val) => {
                                        const parsed = val === '' ? '' : Number(val);
                                        onChange(i, { OpenMinute: parsed });
                                    }}
                                    options={timeOptions(60)}
                                    disabled={isClosed}
                                    placeholder={t('restaurantForm.placeholder.mm')}
                                />
                            </View>
                        </View>

                        <View style={styles.timeBlock}>
                            <Text style={styles.label}>{t('form.closeTime')}</Text>
                            <View style={styles.timeSelects}>
                                <FormSelect
                                    style={styles.select}
                                    value={entry.CloseHour ?? ''}
                                    onChange={(val) => {
                                        const parsed = val === '' ? '' : Number(val);
                                        onChange(i, { CloseHour: parsed });
                                    }}
                                    options={timeOptions(24)}
                                    disabled={isClosed}
                                    placeholder={t('restaurantForm.placeholder.hh')}
                                />
                                <FormSelect
                                    style={styles.select}
                                    value={entry.CloseMinute ?? ''}
                                    onChange={(val) => {
                                        const parsed = val === '' ? '' : Number(val);
                                        onChange(i, { CloseMinute: parsed });
                                    }}
                                    options={timeOptions(60)}
                                    disabled={isClosed}
                                    placeholder={t('restaurantForm.placeholder.mm')}
                                />
                            </View>
                        </View>

                        <View style={styles.switchRow}>
                            <Text style={styles.closedLabel}>{t('form.closed')}</Text>
                            <Switch
                                value={isClosed}
                                onValueChange={() => {
                                    onChange(i, {
                                        IsClosed: !isClosed,
                                        ...(isClosed
                                            ? {}
                                            : {
                                                OpenHour: '',
                                                OpenMinute: '',
                                                CloseHour: '',
                                                CloseMinute: '',
                                            }),
                                    });
                                }}
                            />
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

export default WorkingHoursCardList;

const styles = StyleSheet.create({
    container: {
        gap: 20,
        marginTop: 16,
    },
    card: {
        backgroundColor: Colors.beige,
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    dayHeader: {
        backgroundColor: Colors.red,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    dayLabel: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Bold',
        color: Colors.beige,
    },
    timeBlock: {
        gap: 6,
    },
    timeSelects: {
        flexDirection: 'row',
        gap: 8,
    },
    label: {
        color: Colors.black,
        fontSize: 15,
        fontFamily: 'CormorantGaramond-Regular',
    },
    closedLabel: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: Colors.black,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
    },
    select: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.black,
        borderRadius: 20,
    },
});