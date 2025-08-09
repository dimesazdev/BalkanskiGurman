// AdminUserPopup.tsx (React Native version)
import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    Image,
    StyleSheet,
    Pressable,
    ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/mk';
import 'dayjs/locale/me';
import 'dayjs/locale/sl';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import translatedCities from '@/assets/locales/translatedCities.json'
import translatedCountries from '@/assets/locales/translatedCountries.json'

const countryNameToCode: Record<string, string> = {
    Macedonia: 'MK',
    Slovenia: 'SI',
    Croatia: 'HR',
    Serbia: 'RS',
    'Bosnia and Herzegovina': 'BA',
    Montenegro: 'ME'
};

type Props = {
    user: any;
    visible: boolean;
    onClose: () => void;
    onAction: (actionType: string, id: string) => void;
};

const supportedLocales = ['en', 'mk', 'sr', 'sl'] as const;
type LocaleKey = typeof supportedLocales[number];

const AdminUserPopup: React.FC<Props> = ({ user, visible, onClose, onAction }) => {
    const { t, i18n } = useTranslation();

    const supportedLocales = ['en', 'mk', 'sr', 'sl'] as const;
    const currentLocale = supportedLocales.includes(i18n.language as any) ? i18n.language : 'en';
    dayjs.locale(currentLocale);

    const getTranslatedCountry = (name: string) => {
        const match = translatedCountries.find(c => c.name.toLowerCase() === name?.toLowerCase());
        const lang = supportedLocales.includes(i18n.language as any) ? i18n.language as LocaleKey : 'en';
        return match?.translations?.[lang] || name;
    };

    const getFormattedUserLocation = () => {
        if (!user.City) return getTranslatedCountry(user.Country);
        const iso = countryNameToCode[user.Country?.trim()] || user.Country?.trim();
        const cityEntry = translatedCities.find(
            c => c.countryCode === iso && c.name.toLowerCase() === user.City.toLowerCase()
        );

        const lang = supportedLocales.includes(i18n.language as any)
            ? (i18n.language as LocaleKey)
            : 'en';

        const city = cityEntry?.translations?.[lang] || user.City;
        const metro = cityEntry?.metroTranslations?.[lang] || cityEntry?.metro || null;
        const country = getTranslatedCountry(user.Country);

        return metro ? `${metro} (${city}), ${country}` : `${city}, ${country}`;
    };

    const getMedalIcon = (count: number) => {
        if (count > 50) return { icon: 'diamond-stone', color: '#00bfff' };
        if (count >= 26) return { icon: 'medal', color: '#ffd700' };
        if (count >= 11) return { icon: 'medal', color: '#c0c0c0' };
        if (count >= 1) return { icon: 'medal', color: '#cd7f32' };
        return { icon: null, color: '' };
    };

    const userStatus = user?.status?.Name?.toLowerCase() as 'active' | 'suspended' | 'banned';
    const isSuspended = userStatus === 'suspended' && user.SuspendedUntil;
    const medal = getMedalIcon(user._count?.reviews || 0);
    const createdDate = dayjs(user.CreatedAt).format('D MMMM YYYY');
    const lastUpdateDate = user.UpdatedAt ? dayjs(user.UpdatedAt).format('D MMMM YYYY') : '-';
    const role = user?.userRoles?.[0]?.role?.Name?.toLowerCase();

    const handleAction = (type: string) => {
        onAction(type, user.UserId);
    };

    if (!user) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.popup}>
                    <ScrollView>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <MaterialCommunityIcons name="close" size={24} />
                        </Pressable>

                        <Text style={styles.title}>{t('adminUser.userId', { id: user.UserId })}</Text>

                        <View style={styles.userRow}>
                            <View style={styles.userTopRow}>
                                {user.ProfilePictureUrl ? (
                                    <Image source={{ uri: user.ProfilePictureUrl }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={{ fontSize: 24 }}>👤</Text>
                                    </View>
                                )}
                                <View style={{ flex: 1 }}>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{user.Name} {user.Surname}</Text>
                                        {medal.icon && (
                                            <MaterialCommunityIcons
                                                name={medal.icon}
                                                size={18}
                                                color={medal.color}
                                                style={{ marginLeft: 6 }}
                                            />
                                        )}
                                    </View>
                                    <Text style={styles.userLocation}>{getFormattedUserLocation()} · {user._count?.reviews || 0} {t('labels.reviews')}</Text>
                                    <View style={{ gap: 5, alignItems: 'center', flexDirection: 'row' }}>
                                        <Text style={styles.userStatus}>{t('adminUser.status')}:</Text>
                                        <Text style={[styles.status, styles[`status_${userStatus}`]]}>
                                            {userStatus === 'suspended' && user.SuspendedUntil
                                                ? `${t('adminUser.suspendedUntil')}: ${dayjs(user.SuspendedUntil).format('D MMMM YYYY')}`
                                                : t(`userStatus.${userStatus}`)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.infoSection}>
                            <Text style={styles.text}><Text style={styles.bold}>{t('adminUser.role')}:</Text> {t(`roles.${role}`)}</Text>
                            <Text style={styles.text}><Text style={styles.bold}>{t('adminUser.email')}:</Text> {user.Email}</Text>
                            <Text style={styles.text}><Text style={styles.bold}>{t('adminUser.reviewCount')}:</Text> {user._count?.reviews || 0}</Text>
                            <Text style={styles.text}><Text style={styles.bold}>{t('adminUser.createdAt')}:</Text> {createdDate}</Text>
                            <Text style={styles.text}><Text style={styles.bold}>{t('adminUser.lastUpdate')}:</Text> {lastUpdateDate}</Text>
                        </View>

                        <View style={styles.buttonRow}>
                            <Button variant="green" onPress={() => handleAction('activate')} disabled={userStatus === 'active'}>{t('buttons.activate')}</Button>
                            <Button variant="yellow" onPress={() => handleAction('suspend')} disabled={userStatus === 'suspended'}>{t('buttons.suspend')}</Button>
                            <Button variant="red" onPress={() => handleAction('ban')} disabled={userStatus === 'banned'}>{t('buttons.ban')}</Button>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default AdminUserPopup;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        backgroundColor: Colors.beige,
        borderRadius: 20,
        padding: 20,
        maxHeight: '90%',
        width: '90%',
    },
    closeBtn: {
        alignSelf: 'flex-end',
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        fontFamily: 'CormorantGaramond-Bold',
        marginBottom: 16,
    },
    userRow: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 20,
        marginBottom: 12,
    },
    userTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 18,
        fontWeight: '500',
        fontFamily: 'CormorantSC-Bold',
    },
    userLocation: {
        fontSize: 15,
        color: '#666',
        fontFamily: 'CormorantGaramond-Regular'
    },
    status: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        fontSize: 15,
        fontFamily: 'CormorantGaramond-Regular',
        flexWrap: 'wrap',
        maxWidth: '100%',
        flexShrink: 1,
    },
    userStatus: {
        fontSize: 15,
        color: '#333',
        fontFamily: 'CormorantGaramond-Bold'
    },
    status_active: { backgroundColor: '#c8e6c9', color: '#2e7d32' },
    status_suspended: { backgroundColor: '#ffe0b2', color: '#ef6c00' },
    status_banned: { backgroundColor: '#ffcdd2', color: '#c62828' },
    infoSection: {
        gap: 8,
        marginTop: 12,
    },
    bold: {
        fontWeight: 'bold',
        fontSize: 18,
        fontFamily: 'CormorantGaramond-Regular'
    },
    text: {
        fontSize: 18,
        fontFamily: 'CormorantGaramond-Regular'
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: 20,
        flexWrap: 'wrap'
    },
});