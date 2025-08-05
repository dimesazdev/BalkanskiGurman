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
import { useAzureTranslation } from '@/hooks/useAzureTranslation';
import MediaGallery from '@/components/MediaGallery';
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
    issue: any;
    visible: boolean;
    onClose: () => void;
    onResolve: () => void;
};

type IssueStatusKey = 'pending' | 'resolved';

const supportedLocales = ['en', 'mk', 'sr', 'sl'] as const;
type LocaleKey = typeof supportedLocales[number];

const AdminIssuePopup: React.FC<Props> = ({ issue, visible, onClose, onResolve }) => {
    const { t, i18n } = useTranslation();
    const [translatedText, setTranslatedText] = useState('');
    const [detectedLanguage, setDetectedLanguage] = useState('');

    const user = issue?.user;
    const supportedLocales = ['en', 'mk', 'sr', 'sl'] as const;
    const currentLocale = supportedLocales.includes(i18n.language as any) ? i18n.language : 'en';
    dayjs.locale(currentLocale);

    const translationResult = useAzureTranslation(issue?.Explanation);

    useEffect(() => {
        setTranslatedText(translationResult.translatedText);
        setDetectedLanguage(translationResult.detectedLanguage);
    }, [translationResult]);

    const shouldTranslate = detectedLanguage && detectedLanguage !== i18n.language && translatedText;

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
    const issueStatus = issue?.status?.Name?.toLowerCase() as IssueStatusKey;
    const medal = getMedalIcon(user._count?.reviews || 0);

    const images = [issue.PhotoUrl1, issue.PhotoUrl2, issue.PhotoUrl3].filter(Boolean);

    if (!issue || !user) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.popup}>
                    <ScrollView>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <MaterialCommunityIcons name="close" size={24} />
                        </Pressable>

                        <Text style={styles.title}>{t('adminIssue.issueId', { id: issue.IssueId })}</Text>

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
                                        <Text style={styles.userName}>{user.Name} {user.Surname?.charAt(0)}.</Text>
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
                                    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                        <Text style={styles.userStatus}>{t('adminUser.status')}:</Text>
                                        <Text style={[styles.status, styles[`status_${userStatus}`]]}>
                                            {t(`userStatus.${userStatus}`)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.infoSection}>
                            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                <Text style={styles.bold}>{t('adminIssue.status')}:</Text>
                                <Text style={[styles.status, styles[`status_${issueStatus}`]]}>
                                    {t(`issueStatus.${issueStatus}`)}
                                </Text>
                            </View>
                            <Text style={styles.text}>
                                <Text style={styles.bold}>{t('adminIssue.type')}: </Text>
                                {t(`report.issueTypes.${issue.IssueType === "Wrong Info"
                                    ? "wrongInfo"
                                    : issue.IssueType === "Bug Report"
                                        ? "bugReport"
                                        : "other"
                                    }`)}
                            </Text>
                            <Text style={styles.text}><Text style={styles.bold}>{t('adminUser.email')}:</Text> {user.Email}</Text>
                            <Text style={styles.bold}>{t('adminIssue.forRestaurant')}:</Text>
                            {issue.IssueType === 'Wrong Info' && issue.restaurant && (
                                <View style={styles.restaurantCard}>
                                    <Image source={{ uri: issue.restaurant.images?.[0]?.Url || '/default-restaurant.jpg' }} style={styles.restaurantImage} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.restaurantName}>{issue.restaurant.Name}</Text>
                                        <Text style={styles.restaurantAddress}>
                                            {issue.restaurant.address?.Street}, {issue.restaurant.address?.City}, {issue.restaurant.address?.Country}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            <Text style={styles.comment}>{issue.Explanation}</Text>
                            {shouldTranslate && (
                                <View style={styles.horizontalLine}>
                                    <Text style={styles.translated}>{translatedText}</Text>
                                    <Text style={styles.translatedNote}>{t('labels.aiTranslated')}</Text>
                                </View>
                            )}
                            {images.length > 0 && (
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.bold}>{t('adminIssue.images')}:</Text>
                                    <MediaGallery dotColor={Colors.red} media={images.map(url => ({ Url: url }))} />
                                </View>
                            )}
                        </View>

                        <View style={styles.buttonRow}>
                            <Button variant="green" onPress={onResolve} disabled={issueStatus === 'resolved'}>
                                {t('buttons.resolve')}
                            </Button>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default AdminIssuePopup;

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
    title: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        fontFamily: 'CormorantGaramond-Bold',
        marginBottom: 16,
    },
    closeBtn: {
        alignSelf: 'flex-end'
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
    userStatus: {
        fontSize: 15,
        color: '#333',
        fontFamily: 'CormorantGaramond-Bold'
    },
    status: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        fontSize: 15,
        fontFamily: 'CormorantGaramond-Regular',
        flexWrap: 'wrap',
        flexShrink: 1,
    },
    status_active: { backgroundColor: '#c8e6c9', color: '#2e7d32' },
    status_suspended: { backgroundColor: '#ffe0b2', color: '#ef6c00' },
    status_banned: { backgroundColor: '#ffcdd2', color: '#c62828' },
    status_resolved: { backgroundColor: '#c8e6c9', color: '#2e7d32' },
    status_pending: { backgroundColor: '#ffe0b2', color: '#ef6c00' },
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
    comment: {
        marginTop: 10,
        fontSize: 18,
        fontFamily: 'CormorantGaramond-Regular'
    },
    translated: {
        marginTop: 10,
        fontStyle: 'italic',
        opacity: 0.9,
        fontFamily: 'CormorantGaramond-Italic',
        fontSize: 18
    },
    translatedNote: {
        fontSize: 15,
        color: Colors.red,
        marginTop: 5,
        fontFamily: 'CormorantGaramond-Regular'
    },
    horizontalLine: {
        borderTopWidth: 1,
        borderTopColor: Colors.red
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: 20,
    },
    restaurantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: Colors.red,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 12,
        marginTop: 10,
        gap: 12,
    },
    restaurantImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    restaurantName: {
        fontWeight: '600',
        fontSize: 18,
        fontFamily: 'CormorantSC-Bold',
    },
    restaurantAddress: {
        fontSize: 16,
        color: '#555',
        fontFamily: 'CormorantGaramond-Regular',
    }
});