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
    Montenegro: 'ME',
};

type Props = {
    issue: any;
    onManage: () => void;
};

const supportedLocales = ['en', 'mk', 'sr', 'sl'] as const;
type LocaleKey = typeof supportedLocales[number];

const AdminIssueCard: React.FC<Props> = ({ issue, onManage }) => {
    const { t, i18n } = useTranslation();
    const {
        IssueId,
        IssueType,
        Explanation,
        CreatedAt,
        status,
        user
    } = issue;

    const supportedLocales = ['en', 'mk', 'sr', 'sl'] as const;
    const currentLocale = supportedLocales.includes(i18n.language as any) ? i18n.language : 'en';
    dayjs.locale(currentLocale);
    const formattedDate = dayjs(CreatedAt).format('D MMMM YYYY');

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

    const statusLabel = status?.Name?.trim().toLowerCase() as 'resolved' | 'pending';

    const getMedalIcon = (count: number) => {
        if (count > 50) return { icon: 'diamond-stone', color: '#00bfff' };
        if (count >= 26) return { icon: 'medal', color: '#ffd700' };
        if (count >= 11) return { icon: 'medal', color: '#c0c0c0' };
        if (count >= 1) return { icon: 'medal', color: '#cd7f32' };
        return { icon: null, color: '' };
    };

    const { icon, color } = getMedalIcon(user?._count?.reviews || 0);

    const getIssueTypeTranslation = () => {
        switch (IssueType) {
            case 'Wrong Info': return t('report.issueTypes.wrongInfo');
            case 'Bug Report': return t('report.issueTypes.bugReport');
            default: return t('report.issueTypes.other');
        }
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{t('adminIssue.issueId', { id: IssueId })}</Text>

            <View style={styles.userRow}>
                {user.ProfilePictureUrl ? (
                    <Image source={{ uri: user.ProfilePictureUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={{ fontSize: 24 }}>👤</Text>
                    </View>
                )}
                <View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>
                            {user.Name} {user.Surname ? `${user.Surname.charAt(0)}.` : ''}
                        </Text>
                        {icon && <MaterialCommunityIcons name={icon} size={18} color={color} style={{ marginLeft: 6 }} />}
                    </View>
                    <Text style={styles.userLocation}>{getFormattedUserLocation()}</Text>
                </View>
            </View>

            <View style={styles.info}>
                <Text style={styles.text}><Text style={styles.bold}>{t('adminUser.role')}:</Text> {t(`roles.${user.userRoles?.[0]?.role?.Name?.toLowerCase()}`)}</Text>
                <Text style={styles.text}><Text style={styles.bold}>{t('adminUser.email')}:</Text> {user.Email}</Text>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                    <Text style={styles.bold}>{t('adminIssue.status')}:</Text>
                    <Text style={[styles.status, styles[`status_${statusLabel}`]]}>
                        {t(`issueStatus.${statusLabel}`)}
                    </Text>
                </View>
                <Text style={styles.text}><Text style={styles.bold}>{t('adminIssue.createdAt')}:</Text> {formattedDate}</Text>
                <Text style={styles.text}><Text style={styles.bold}>{t('adminIssue.type')}:</Text> {getIssueTypeTranslation()}</Text>
            </View>

            <Button variant="red-outline" onPress={onManage}>
                {t('buttons.manageIssue')}
            </Button>
        </View>
    );
};

export default AdminIssueCard;

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
        fontFamily: 'CormorantGaramond-Regular'
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
    status_resolved: {
        backgroundColor: '#c8e6c9',
        color: '#2e7d32',
    },
    status_pending: {
        backgroundColor: '#ffe0b2',
        color: '#ef6c00',
    },
    status_unknown: {
        backgroundColor: '#ddd',
        color: '#333',
    },
});