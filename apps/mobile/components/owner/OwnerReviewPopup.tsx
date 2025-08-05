import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    Image,
    StyleSheet,
    Pressable,
    ScrollView,
    TextInput,
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
import Popup from '../Popup';
import FormTextarea from '@/components/FormTextarea';

type PopupProps = {
    message: string;
    variant: 'success' | 'error' | 'warning';
    onClose: () => void;
};

const countryNameToCode: Record<string, string> = {
    Macedonia: 'MK',
    Slovenia: 'SI',
    Croatia: 'HR',
    Serbia: 'RS',
    'Bosnia and Herzegovina': 'BA',
    Montenegro: 'ME'
};

type LocaleKey = 'en' | 'mk' | 'sr' | 'sl';

type ReviewPopupProps = {
    review: any;
    visible: boolean;
    onClose: () => void;
    userToken: string;
    onRecheckSuccess?: (updatedReview: any) => void;
};

const OwnerReviewPopup: React.FC<ReviewPopupProps> = ({ review, visible, onClose, userToken, onRecheckSuccess }) => {
    const { t, i18n } = useTranslation();
    const [translatedText, setTranslatedText] = useState('');
    const [detectedLanguage, setDetectedLanguage] = useState('');
    const [explanation, setExplanation] = useState('');
    const [popup, setPopup] = useState<PopupProps | null>(null);
    const [hasRequested, setHasRequested] = useState(review?.HasRequestedRecheck);
    const [status, setStatus] = useState(review?.status?.Name?.toLowerCase());

    const user = review?.user;
    const statusLabel = review?.status?.Name?.toLowerCase() as 'approved' | 'pending' | 'rejected' | 'recheck';
    const currentLocale = ['en', 'mk', 'sr', 'sl'].includes(i18n.language) ? i18n.language as LocaleKey : 'en';
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
        return match?.translations?.[currentLocale] || name;
    };

    const getFormattedUserLocation = () => {
        if (!user.City) return getTranslatedCountry(user.Country);
        const iso = countryNameToCode[user.Country?.trim()] || user.Country?.trim();
        const cityEntry = translatedCities.find(c => c.countryCode === iso && c.name.toLowerCase() === user.City.toLowerCase());

        const city = cityEntry?.translations?.[currentLocale] || user.City;
        const metro = cityEntry?.metroTranslations?.[currentLocale] || cityEntry?.metro || null;
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

    const handleRequestRecheck = async () => {
        if (!explanation.trim()) {
            setPopup({ message: t('alerts.explanationRequired'), variant: 'error', onClose: () => setPopup(null) });
            return;
        }

        try {
            const res = await fetch(`http://192.168.100.31:3001/reviews/${review.ReviewId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    action: 'recheck',
                    recheckExplanation: explanation.trim(),
                }),
            });

            if (!res.ok) throw new Error('Request failed');

            setStatus('recheck');
            setHasRequested(true);
            setPopup({ message: t('popup.statusChangeSuccess.requestRecheck'), variant: 'success', onClose });

            if (onRecheckSuccess) {
                onRecheckSuccess({
                    ...review,
                    StatusId: 7,
                    status: { Name: 'Recheck' },
                    HasRequestedRecheck: true,
                    RecheckExplanation: explanation.trim(),
                });
            }
        } catch (err) {
            console.error(err);
            setPopup({ message: t('popup.statusChangeError.requestRecheck'), variant: 'error', onClose: () => setPopup(null) });
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
                                    <View style={styles.avatarPlaceholder}><Text>👤</Text></View>
                                )}
                                <View style={{ flex: 1 }}>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{user.Name} {user.Surname?.charAt(0)}.</Text>
                                        {medal.icon && <MaterialCommunityIcons name={medal.icon} size={18} color={medal.color} style={{ marginLeft: 6 }} />}
                                    </View>
                                    <Text style={styles.userLocation}>{`${getFormattedUserLocation()} · ${user._count?.reviews || 0} ${t('labels.reviews')}`}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.infoSection}>
                            <View style={{ flexDirection: 'row', gap: 5 }}>
                                <Text style={styles.bold}>{t('adminReview.reviewStatus')}:</Text>
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
                            {review.HasRequestedRecheck ? (
                                status === 'approved' ? (
                                    <Text style={styles.success}>{t('alerts.recheckRejected')}</Text>
                                ) : status === 'rejected' ? (
                                    <Text style={styles.success}>{t('alerts.recheckAccepted')}</Text>
                                ) : null
                            ) : (
                                status !== 'pending' && (
                                    <FormTextarea
                                        id="recheckExplanation"
                                        value={explanation}
                                        onChange={setExplanation}
                                        placeholder={t('placeholders.recheckExplanation') || ''}
                                        dashed
                                    />
                                )
                            )}
                        </View>

                        <View style={styles.buttonRow}>
                            <Button
                                variant="blue"
                                onPress={handleRequestRecheck}
                                disabled={status === 'pending' || status === 'recheck' || hasRequested}
                            >
                                {t('buttons.requestRecheck')}
                            </Button>
                        </View>

                        {popup && (
                            <Popup
                                message={popup.message}
                                variant={popup.variant}
                                onClose={popup.onClose}
                            />
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default OwnerReviewPopup;

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
    status: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        fontSize: 15,
        fontFamily: 'CormorantGaramond-Regular',
    },
    status_approved: { backgroundColor: '#c8e6c9', color: '#2e7d32' },
    status_pending: { backgroundColor: '#ffe0b2', color: '#ef6c00' },
    status_rejected: { backgroundColor: '#ffcdd2', color: '#c62828' },
    status_recheck: { backgroundColor: '#bbdefb', color: '#1565c0' },
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
    textarea: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderColor: Colors.red,
        borderWidth: 1,
        padding: 10,
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        marginTop: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    closeBtn: {
        alignSelf: 'flex-end'
    },
    horizontalLine: {
        borderTopWidth: 1,
        borderTopColor: Colors.red,
        marginTop: 8,
    },
    success: {
        marginTop: 10,
        fontSize: 16,
        color: Colors.green,
        fontFamily: 'CormorantGaramond-Regular'
    }
});