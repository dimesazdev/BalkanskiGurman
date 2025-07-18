import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from './Button';
import Colors from '@/constants/Colors';
import { getAmenityIcon } from '../utils/getAmenityIcon';
import { Image } from 'react-native';

const cuisineOptions = [
    { code: 'MK', label: 'cuisines.MK', icon: require('../assets/images/mk-flag-icon.png') },
    { code: 'SR', label: 'cuisines.SR', icon: require('../assets/images/sr-flag-icon.png') },
    { code: 'SL', label: 'cuisines.SL', icon: require('../assets/images/si-flag-icon.png') },
    { code: 'BA', label: 'cuisines.BA', icon: require('../assets/images/ba-flag-icon.png') },
    { code: 'HR', label: 'cuisines.HR', icon: require('../assets/images/hr-flag-icon.png') },
    { code: 'ME', label: 'cuisines.ME', icon: require('../assets/images/me-flag-icon.png') },
    { code: 'INT', label: 'cuisines.INT', icon: require('../assets/images/int-flag-icon.png') },
];

const amenityOptions = [
    { code: 'DELIV', label: 'filters.delivery' },
    { code: 'PARK', label: 'filters.parking' },
    { code: 'PET', label: 'filters.pet' },
    { code: 'CARD', label: 'filters.card' },
    { code: 'KIDS', label: 'filters.kids' },
    { code: 'SMOK', label: 'filters.smoking' },
    { code: 'VEGAN', label: 'filters.vegan' },
    { code: 'VEGE', label: 'filters.vegetarian' },
    { code: 'GLUT', label: 'filters.glutenfree' },
    { code: 'HALAL', label: 'filters.halal' },
];

type Filters = {
    price: number[];
    rating: number[];
    cuisines: string[];
    amenities: string[];
    hours: string[];
};

type Props = {
    filters: Filters;
    onChange: (updatedFilters: Filters) => void;
};

const FilterSidebar: React.FC<Props> = ({ filters, onChange }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState(false);

    const toggle = <T extends string | number>(category: keyof Filters, value: T) => {
        const current = filters[category] as T[];
        const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        onChange({ ...filters, [category]: updated });
    };

    const renderCheckbox = <T extends string | number>(
        category: keyof Filters,
        code: T,
        label: string,
        iconName?: string
    ) => (
        <TouchableOpacity
            key={String(code)}
            style={styles.filterRow}
            onPress={() => toggle(category, code)}
        >
            <View style={styles.checkbox}>
                {(filters[category] as T[])?.includes(code) && (
                    <Text style={styles.checkmark}>✓</Text>
                )}
            </View>
            {iconName && (
                typeof iconName === 'number' ? (
                    <Image source={iconName} style={styles.icon} />
                ) : (
                    <Icon name={iconName} size={24} color={Colors.red} style={styles.icon} />
                )
            )}
            <Text style={styles.label}>{t(label)}</Text>
        </TouchableOpacity>
    );

    const renderStarsRow = (value: number) => {
        const full = Math.floor(value);
        const hasHalf = value % 1 !== 0;
        const stars = [];

        for (let i = 0; i < full; i++) {
            stars.push(<Icon key={`full-${i}`} name="star" size={24} color={Colors.red} />);
        }
        if (hasHalf) {
            stars.push(<Icon key="half" name="star-half-full" size={24} color={Colors.red} />);
        }
        while (stars.length < 5) {
            stars.push(<Icon key={`empty-${stars.length}`} name="star-outline" size={24} color={Colors.red} />);
        }

        return <View style={styles.starRow}>{stars}</View>;
    };

    return (
        <View style={{ flexShrink: 1 }}>
            <Button variant="red" onPress={() => setModalVisible(true)}>
                {t('filters.title')}
            </Button>

            <Modal visible={modalVisible} animationType="slide">
                <View style={[styles.sidebar, { paddingTop: insets.top + 12 }]}>
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                        <Text style={styles.closeText}>×</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>{t('filters.title')}</Text>
                        <Button
                            variant="red"
                            onPress={() =>
                                onChange({
                                    price: [],
                                    rating: [],
                                    cuisines: [],
                                    amenities: [],
                                    hours: [],
                                })
                            }
                        >
                            {t('filters.reset')}
                        </Button>
                    </View>

                    <ScrollView contentContainerStyle={styles.sections}>
                        <Text style={styles.sectionTitle}>{t('filters.price')} ({t('labels.perPerson')})</Text>
                        {[{ code: 1, label: 'filters.5-10€' }, { code: 2, label: 'filters.10-20€' }, { code: 3, label: 'filters.20€+' }].map(p =>
                            renderCheckbox('price', p.code, p.label)
                        )}

                        <Text style={styles.sectionTitle}>{t('filters.rating')}</Text>
                        {[3.5, 4, 4.5].map(r => (
                            <TouchableOpacity key={r} style={styles.filterRow} onPress={() => toggle('rating', r)}>
                                <View
                                    style={styles.checkbox}
                                >
                                    {filters.rating.includes(r) && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                {renderStarsRow(r)}
                                <Text style={[styles.label, { marginLeft: 8 }]}>{t('filters.up')}</Text>
                            </TouchableOpacity>
                        ))}

                        <Text style={styles.sectionTitle}>{t('filters.cuisines')}</Text>
                        {cuisineOptions.map(c => renderCheckbox('cuisines', c.code, c.label, c.icon))}

                        <Text style={styles.sectionTitle}>{t('filters.amenities')}</Text>
                        {amenityOptions.map(a =>
                            renderCheckbox('amenities', a.code, a.label, getAmenityIcon(a.code))
                        )}

                        <Text style={styles.sectionTitle}>{t('filters.hours')}</Text>
                        {['openNow', 'afterMidnight'].map(h =>
                            renderCheckbox('hours', h, `filters.${h}`)
                        )}
                    </ScrollView>

                    <Button
                        variant="green"
                        onPress={() => setModalVisible(false)}
                        style={styles.saveButton}
                    >
                        {t('buttons.saveChanges')}
                    </Button>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        flex: 1,
        backgroundColor: Colors.beige,
        padding: 16,
    },
    closeBtn: {
        position: 'absolute',
        top: 40,
        right: 16,
        zIndex: 10,
    },
    closeText: {
        fontSize: 32,
        color: Colors.black,
    },
    header: {
        marginTop: 48,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontFamily: 'CormorantGaramond-Bold',
        color: Colors.black,
    },
    sections: {
        paddingBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'CormorantGaramond-Regular',
        marginTop: 16,
        marginBottom: 8,
        color: Colors.black,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 25,
        height: 25,
        borderRadius: 4,
        backgroundColor: Colors.beige,
        borderWidth: 1,
        borderColor: Colors.black,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        color: Colors.red,
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 20,
    },
    icon: {
        marginRight: 8,
    },
    label: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: Colors.black,
    },
    starRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveButton: {
        marginTop: 16,
        marginBottom: 16,
        alignSelf: 'center',
    },
});

export default FilterSidebar;