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
    review: any;
    visible: boolean;
    onClose: () => void;
    onAction: (actionType: string, id: string) => void;
};

const supportedLocales = ['en', 'mk', 'sr', 'sl'] as const;
type LocaleKey = typeof supportedLocales[number];

const AdminReviewPopup: React.FC<Props> = ({ review, visible, onClose, onAction }) => {
    const { t, i18n } = useTranslation();
    const [translatedText, setTranslatedText] = useState('');
    const [detectedLanguage, setDetectedLanguage] = useState('');
    const [reviewerState, setReviewerState] = useState<any>(review?.user);

    const user = reviewerState;
    const statusLabel = review?.status?.Name?.toLowerCase() as 'approved' | 'pending' | 'rejected' | 'recheck';
    const userStatus = user?.status?.Name?.toLowerCase() as 'active' | 'suspended' | 'banned';
    const supportedLocales = ['en', 'mk', 'sr', 'sl'] as const;
    const currentLocale = supportedLocales.includes(i18n.language as any) ? i18n.language : 'en';
    dayjs.locale(currentLocale);
    const formattedDate = dayjs(review?.CreatedAt).format('D MMMM YYYY');
    const translationResult = useAzureTranslation(review?.Comment);

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

    const renderStars = (rating: number) => {
        const stars = [];
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.25 && rating % 1 < 0.75;
        const empty = 5 - full - (half ? 1 : 0);
        for (let i = 0; i < full; i++) stars.push(<MaterialCommunityIcons key={`f-${i}`} name="star" size={18} color={Colors.red} />);
        if (half) stars.push(<MaterialCommunityIcons key="half" name="star-half-full" size={18} color={Colors.red} />);
        for (let i = 0; i < empty; i++) stars.push(<MaterialCommunityIcons key={`e-${i}`} name="star-outline" size={18} color={Colors.red} />);
        return stars;
    };

    const handleAction = (type: string) => {
        if (['suspend', 'ban'].includes(type)) {
            onAction(type, user.UserId);
            setReviewerState((prev: any) => ({
                ...prev,
                status: {
                    ...prev.status,
                    Name: type === 'suspend' ? 'Suspended' : 'Banned',
                }
            }));
        } else {
            onAction(type, review.ReviewId);
        }
    };

    if (!review || !user) return null;

    const medal = getMedalIcon(user._count?.reviews || 0);

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.popup}>
                    <ScrollView>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <MaterialCommunityIcons name="close" size={24} />
                        </Pressable>
                        <Text style={styles.title}>{t('adminReview.reviewId', { id: review.ReviewId })}</Text>
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
                                    <Text style={styles.userLocation}>
                                        {`${getFormattedUserLocation()} · ${user._count?.reviews || 0} ${t('labels.reviews')}`}
                                    </Text>
                                    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                        <Text style={styles.userStatus}>{t('adminUser.status')}:</Text>{' '}
                                        <Text style={[styles.status, styles[`status_${userStatus}`]]}>
                                            {userStatus === 'suspended' && user.SuspendedUntil
                                                ? `${t('adminUser.suspendedUntil')}: ${dayjs(user.SuspendedUntil).format('D MMMM YYYY')}`
                                                : t(`userStatus.${userStatus}`)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.actionRow}>
                                <Button variant="yellow-small" onPress={() => handleAction('suspend')}>{t('buttons.suspend')}</Button>
                                <Button variant="red-small" onPress={() => handleAction('ban')}>{t('buttons.ban')}</Button>
                            </View>
                        </View>

                        <View style={styles.infoSection}>
                            <View style={{ flexDirection: 'row', gap: 5 }}>
                                <Text style={styles.bold}>{t('adminReview.reviewStatus')}:</Text>{' '}
                                <Text style={[styles.status, styles[`status_${statusLabel}`]]}>
                                    {t(`reviewStatus.${statusLabel}`)}
                                </Text>
                            </View>
                            <Text style={styles.text}><Text style={styles.bold}>{t('adminReview.datePosted')}:</Text> {formattedDate}</Text>
                            <Text style={styles.text}><Text style={styles.bold}>{t('adminReview.forRestaurant')}:</Text> {review.restaurant?.Name}</Text>
                            <Text style={styles.text}><Text style={styles.bold}>{t('adminReview.location')}:</Text> {review.restaurant?.address?.City}, {review.restaurant?.address?.Country}</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                                <Text style={styles.bold}>{t('adminReview.rating')}:</Text>
                                <View style={{ flexDirection: 'row', marginLeft: 5, alignItems: 'center' }}>
                                    {renderStars(review.Rating)}
                                    <Text style={styles.text}> ({review.Rating.toFixed(1)})</Text>
                                </View>
                            </View>
                            <Text style={styles.comment}>{review.Comment}</Text>
                            {shouldTranslate && (
                                <View style={styles.horizontalLine}>
                                    <Text style={styles.translated}>{translatedText}</Text>
                                    <Text style={styles.translatedNote}>{t('labels.aiTranslated')}</Text>
                                </View>
                            )}
                            {review.RecheckExplanation && statusLabel === 'recheck' && (
                                <View style={styles.recheckBox}>
                                    <Text style={styles.bold}>{t('adminReview.recheckExplanation')}:</Text>
                                    <Text>{review.RecheckExplanation}</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.buttonRow}>
                            <Button variant="green" onPress={() => handleAction('approve')} disabled={statusLabel === 'approved'}>{t('buttons.approve')}</Button>
                            <Button variant="red" onPress={() => handleAction('reject')} disabled={statusLabel === 'rejected'}>{t('buttons.reject')}</Button>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default AdminReviewPopup;

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
    statusLine: {
        fontSize: 14,
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
    status_approved: { backgroundColor: '#c8e6c9', color: '#2e7d32' },
    status_pending: { backgroundColor: '#ffe0b2', color: '#ef6c00' },
    status_rejected: { backgroundColor: '#ffcdd2', color: '#c62828' },
    status_recheck: { backgroundColor: '#bbdefb', color: '#1565c0' },
    status_active: { backgroundColor: '#c8e6c9', color: '#2e7d32' },
    status_suspended: { backgroundColor: '#ffe0b2', color: '#ef6c00' },
    status_banned: { backgroundColor: '#ffcdd2', color: '#c62828' },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
        justifyContent: 'center'
    },
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
    recheckBox: {
        marginTop: 12,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        borderColor: Colors.red,
        borderWidth: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: 20,
    },
    closeBtn: {
        alignSelf: 'flex-end'
    },
    horizontalLine: {
        borderTopWidth: 1,
        borderTopColor: Colors.red
    }
});