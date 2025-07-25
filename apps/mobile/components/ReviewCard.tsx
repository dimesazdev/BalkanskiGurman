import React, { useState, useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import MediaGallery from './MediaGallery';
import Button from './Button';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTranslatedLocation } from '@/hooks/useTranslatedLocation';
import 'dayjs/locale/en';
import 'dayjs/locale/mk';
import 'dayjs/locale/me';
import 'dayjs/locale/sl';
import { useAzureTranslation } from '@/hooks/useAzureTranslation';
import { getApiBaseUrl } from '@/api/config';
import Alert from '@/components/Alert';

interface Review {
    ReviewId: number;
    UserId: number;
    user: {
        Name: string;
        Surname: string;
        ProfilePictureUrl?: string;
        Country?: string;
        City?: string;
        _count?: { reviews?: number };
    };
    Rating: number;
    Comment: string;
    PhotoUrl1?: string;
    PhotoUrl2?: string;
    PhotoUrl3?: string;
    CreatedAt: string | Date;
}

interface ReviewCardProps {
    review: Review;
    onDelete?: (reviewId: number, status: 'success' | 'error') => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onDelete }) => {
    const { t, i18n } = useTranslation();
    const { user: currentUser } = useAuth();
    const [showConfirm, setShowConfirm] = useState(false);
    const getTranslatedLocation = useTranslatedLocation();
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const {
        user,
        Rating,
        Comment,
        PhotoUrl1,
        PhotoUrl2,
        PhotoUrl3,
        CreatedAt,
    } = review;

    const renderStars = (rating: number) => {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.25 && rating % 1 < 0.75;
        const empty = 5 - full - (half ? 1 : 0);
        const stars = [];
        for (let i = 0; i < full; i++) stars.push(<Icon key={`f-${i}`} name="star" size={18} color={Colors.red} />);
        if (half) stars.push(<Icon key="h" name="star-half-full" size={18} color={Colors.red} />);
        for (let i = 0; i < empty; i++) stars.push(<Icon key={`e-${i}`} name="star-outline" size={18} color={Colors.red} />);
        return stars;
    };

    const getMedalIcon = (count: number) => {
        if (count > 50) return { name: 'diamond-stone', color: '#00bfff' };
        if (count >= 26) return { name: 'medal', color: '#ffd700' };
        if (count >= 11) return { name: 'medal', color: '#c0c0c0' };
        return { name: 'medal', color: '#cd7f32' };
    };

    const reviewCount = user?._count?.reviews || 0;
    const { name: medalIcon, color: medalColor } = getMedalIcon(reviewCount);
    const reviewImages = [PhotoUrl1, PhotoUrl2, PhotoUrl3]
        .filter((url): url is string => typeof url === 'string')
        .map((url) => ({ Url: url }));

    const dayjsLocaleMap = { en: 'en', mk: 'mk', sr: 'me', sl: 'sl' } as const;
    const localeKey = (Object.keys(dayjsLocaleMap) as Array<keyof typeof dayjsLocaleMap>).includes(i18n.language as keyof typeof dayjsLocaleMap)
        ? (i18n.language as keyof typeof dayjsLocaleMap)
        : 'en';
    dayjs.locale(dayjsLocaleMap[localeKey]);

    const formattedDate = dayjs(CreatedAt).format('D MMMM YYYY');
    const formattedLocation = getTranslatedLocation(user?.City, user?.Country, i18n.language);

    const handleDelete = () => {
        setShowDeleteAlert(true);
    };

    const confirmDelete = async () => {
        setShowDeleteAlert(false);
        try {
            const baseUrl = await getApiBaseUrl();
            const res = await fetch(`${baseUrl}/reviews/${review.ReviewId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${currentUser.token}` },
            });
            if (!res.ok) throw new Error();
            onDelete?.(review.ReviewId, 'success');
        } catch {
            onDelete?.(review.ReviewId, 'error');
        }
    };

    const performDelete = async () => {
        try {
            const baseUrl = await getApiBaseUrl();
            const res = await fetch(`${baseUrl}/reviews/${review.ReviewId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${currentUser.token}` },
            });
            if (!res.ok) throw new Error();
            onDelete?.(review.ReviewId, 'success');
        } catch {
            onDelete?.(review.ReviewId, 'error');
        }
    };

    const { translatedText, detectedLanguage } = useAzureTranslation(Comment);
    const shouldTranslate =
        detectedLanguage &&
        detectedLanguage !== i18n.language &&
        translatedText;


    return (
        <View style={styles.card}>
            <View style={styles.header}>
                {user?.ProfilePictureUrl ? (
                    <Image source={{ uri: user.ProfilePictureUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Icon name="account" size={32} color={Colors.red} />
                    </View>
                )}
                <View style={styles.userInfo}>
                    <Text style={styles.name}>
                        {user?.Name} {user?.Surname} <Icon name={medalIcon} size={16} color={medalColor} />
                    </Text>
                    <Text style={styles.meta}>
                        {formattedLocation} · {t('labels.reviewCount', { count: reviewCount })}
                    </Text>
                    <View style={styles.stars}>{renderStars(Rating)}</View>
                </View>
            </View>

            <Text style={styles.comment}>{Comment}</Text>

            {shouldTranslate && (
                <View style={styles.translationBlock}>
                    <View style={styles.separator} />
                    <Text style={styles.translatedText}>{translatedText}</Text>
                    <Text style={styles.aiLabel}>{t('labels.aiTranslated')}</Text>
                </View>
            )}

            {reviewImages.length > 0 && (
                <View style={styles.gallery}>
                    <MediaGallery
                        media={reviewImages}
                        dotColor={Colors.red}
                        contentStyle={{ width: '85%', maxWidth: '100%', alignSelf: 'center' }}
                    />
                </View>
            )}

            <Text style={styles.date}>{formattedDate}</Text>

            {currentUser?.id === review.UserId && (
                <Button
                    variant="red-outline"
                    onPress={handleDelete}
                    style={{ marginTop: 16 }}
                >
                    <Icon name="trash-can-outline" size={18} color={Colors.red} style={{ marginRight: 6 }} />
                    {t('buttons.deleteReview')}
                </Button>
            )}

            {showDeleteAlert && (
                <Alert
                    message={t('alerts.confirmDeleteReview')}
                    buttonText={t('buttons.confirm')}
                    cancelText={t('buttons.cancel')}
                    onButtonClick={confirmDelete}
                    onClose={() => setShowDeleteAlert(false)}
                />
            )}
        </View>
    );
};

export default ReviewCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.beige,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        resizeMode: 'cover',
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff4eb',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.red,
    },
    userInfo: {
        flex: 1,
        flexDirection: 'column',
    },
    name: {
        fontSize: 21,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'CormorantSC-Bold',
    },
    meta: {
        fontSize: 15,
        color: '#555',
        fontFamily: 'CormorantGaramond-Regular',
    },
    stars: {
        flexDirection: 'row',
        marginTop: 4,
    },
    comment: {
        fontSize: 17,
        color: '#333',
        lineHeight: 24,
        fontFamily: 'CormorantGaramond-Regular',
    },
    gallery: {
        width: '90%',
        alignSelf: 'center',
    },
    date: {
        fontSize: 15,
        color: '#555',
        fontFamily: 'CormorantGaramond-Regular',
    },
    translationBlock: {
        marginTop: 8,
        opacity: 0.9,
    },
    separator: {
        borderTopWidth: 1,
        borderColor: Colors.red,
        opacity: 0.5,
        marginBottom: 6,
    },
    translatedText: {
        fontStyle: 'italic',
        fontSize: 16,
        lineHeight: 22,
        color: '#333',
        fontFamily: 'CormorantGaramond-Regular',
    },
    aiLabel: {
        fontSize: 13,
        color: Colors.red,
        fontFamily: 'CormorantGaramond-Regular',
        marginTop: 4,
    }
});