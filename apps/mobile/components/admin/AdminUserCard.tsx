import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/mk';
import 'dayjs/locale/me';
import 'dayjs/locale/sl';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import translatedCities from '@/assets/locales/translatedCities.json';
import translatedCountries from '@/assets/locales/translatedCountries.json';

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
    onManage: () => void;
};

const supportedLocales = ['en', 'mk', 'sr', 'sl'] as const;
type LocaleKey = typeof supportedLocales[number];

const AdminUserCard: React.FC<Props> = ({ user, onManage }) => {
    const { t, i18n } = useTranslation();
    const {
        UserId,
        Name,
        Surname,
        Email,
        City,
        Country,
        CreatedAt,
        _count,
        role,
        ProfilePictureUrl,
        status,
        SuspendedUntil,
        userRoles
    } = user;

    const supportedLocales = ['en', 'mk', 'sr', 'sl'] as const;
    const currentLocale = supportedLocales.includes(i18n.language as any) ? i18n.language : 'en';
    dayjs.locale(currentLocale);

    const formattedDate = dayjs(CreatedAt).format('D MMMM YYYY');
    const statusLabel = status?.Name?.toLowerCase() as 'active' | 'suspended' | 'banned';

    const getMedalIcon = (count: number) => {
        if (count > 50) return { icon: 'diamond-stone', color: '#00bfff' };
        if (count >= 26) return { icon: 'medal', color: '#ffd700' };
        if (count >= 11) return { icon: 'medal', color: '#c0c0c0' };
        if (count >= 1) return { icon: 'medal', color: '#cd7f32' };
        return { icon: null, color: '' };
    };

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

    const { icon, color } = getMedalIcon(_count?.reviews || 0);

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{t('adminUser.userId', { id: UserId })}</Text>

            <View style={styles.userRow}>
                {user.ProfilePictureUrl ? (
                    <Image source={{ uri: user.ProfilePictureUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={{ fontSize: 24 }}>👤</Text>
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <View style={styles.userInfo}>
                        <Text
                            style={styles.userName}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {user.Name} {user.Surname ? `${user.Surname.charAt(0)}.` : ''}
                        </Text>
                        {(() => {
                            const { icon, color } = getMedalIcon(user._count?.reviews || 0);
                            return icon && (
                                <MaterialCommunityIcons
                                    name={icon}
                                    size={18}
                                    color={color}
                                    style={styles.iconGap}
                                />
                            );
                        })()}
                    </View>
                    <Text
                        style={styles.userLocation}
                        numberOfLines={2}
                    >
                        {getFormattedUserLocation()}
                    </Text>
                </View>
            </View>

            <View style={styles.info}>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                    <Text style={styles.bold}>{t('adminUser.status')}:</Text>{' '}
                    <Text style={[styles.status, styles[`status_${statusLabel}`]]}>
                        {statusLabel === 'suspended' && SuspendedUntil
                            ? `${t('adminUser.suspendedUntil')}: ${dayjs(SuspendedUntil).format('D MMMM YYYY')}`
                            : t(`userStatus.${statusLabel}`)}
                    </Text>
                </View>
                <Text style={styles.text}><Text style={styles.bold}>{t('adminUser.role')}:</Text> {t(`roles.${userRoles?.[0]?.role?.Name?.toLowerCase()}`)}</Text>
                <Text style={styles.text}><Text style={styles.bold}>{t('adminUser.email')}:</Text> {Email}</Text>
                <Text style={styles.text}><Text style={styles.bold}>{t('adminUser.reviews')}:</Text> {_count?.reviews || 0}</Text>
                <Text style={styles.text}><Text style={styles.bold}>{t('adminUser.createdAt')}:</Text> {formattedDate}</Text>
            </View>

            <Button variant="red-outline" onPress={onManage}>
                {t('buttons.manageUser')}
            </Button>
        </View>
    );
};

export default AdminUserCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.beige,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
    },
    title: {
        fontWeight: '600',
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'CormorantGaramond-Bold'
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 20,
        marginBottom: 12,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        resizeMode: 'cover',
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
        fontFamily: 'CormorantSC-Bold'
    },
    userLocation: {
        fontSize: 15,
        color: '#666',
        fontFamily: 'CormorantGaramond-Regular',
        flexShrink: 1,
        width: '100%'
    },
    iconGap: {
        marginLeft: 6,
    },
    info: {
        marginBottom: 12,
        gap: 6
    },
    bold: {
        fontWeight: 'bold',
        fontFamily: 'CormorantGaramond-Regular',
        fontSize: 18
    },
    text: {
        fontFamily: 'CormorantGaramond-Regular',
        fontSize: 18
    },
    status: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        fontSize: 15,
        fontFamily: 'CormorantGaramond-Regular'
    },
    status_active: {
        backgroundColor: '#c8e6c9',
        color: '#2e7d32',
    },
    status_suspended: {
        backgroundColor: '#ffe0b2',
        color: '#ef6c00',
    },
    status_banned: {
        backgroundColor: '#ffcdd2',
        color: '#c62828',
    }
});