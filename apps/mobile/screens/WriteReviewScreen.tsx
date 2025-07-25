import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import Popup from '@/components/Popup';
import Title from '@/components/Title';
import Colors from '@/constants/Colors';
import { getApiBaseUrl } from '@/api/config';
import ImagePicker from '@/components/ImagePicker';
import Loading from '@/components/Loading';
import { RootStackParamList } from '../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WriteReviewScreen = () => {
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { id } = route.params as { id: string };

    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState('');
    type ImageType = {
        file: {
            uri: string;
            name: string;
            type: string;
        };
        url: string;
    };
    const [images, setImages] = useState<ImageType[]>([]);
    const [agreed, setAgreed] = useState(false);
    type Restaurant = {
        Name: string;
        images?: { Url: string }[];
        address?: {
            Street?: string;
            City?: string;
            Country?: string;
        };
    };
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [showGuidelines, setShowGuidelines] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    type PopupState = { message: string; variant: 'success' | 'warning' | 'error' } | null;
    const [popup, setPopup] = useState<PopupState>(null);
    type AlertState = {
        message: string;
        buttonText: string;
        cancelText: string;
        onButtonClick: () => void;
        onClose: () => void;
    } | null;
    const [showAlert, setShowAlert] = useState<AlertState>(null);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const baseUrl = await getApiBaseUrl();
                const res = await fetch(`${baseUrl}/restaurants/${id}`);
                const data = await res.json();
                setRestaurant(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRestaurant();
    }, [id]);

    const handleSubmit = async () => {
        if (!rating) {
            return setPopup({ message: t('alerts.reviewRatingRequired'), variant: 'error' });
        }
        if (!comment.trim()) {
            return setPopup({ message: t('alerts.reviewTextRequired'), variant: 'error' });
        }
        if (!agreed) {
            return setPopup({ message: t('alerts.reviewAgreementRequired'), variant: 'error' });
        }
        if (!user) return;

        setShowAlert({
            message: t('alerts.reviewModerationNotice'),
            buttonText: t('buttons.confirm'),
            cancelText: t('buttons.cancel'),
            onButtonClick: async () => {
                setShowAlert(null);
                setSubmitting(true);
                try {
                    const formData = new FormData();
                    images.forEach((img) =>
                        formData.append(
                            'files',
                            {
                                uri: img.file.uri,
                                type: img.file.type,
                                name: img.file.name,
                            } as any,
                            img.file.name
                        )
                    );
                    const baseUrl = await getApiBaseUrl();

                    const uploadRes = await fetch(`${baseUrl}/upload/review-photos`, {
                        method: 'POST',
                        body: formData,
                    });

                    const uploadData = await uploadRes.json();
                    const urls = uploadData.urls || [];

                    await fetch(`${baseUrl}/restaurants/${id}/reviews`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${user.token}`,
                        },
                        body: JSON.stringify({
                            rating,
                            comment,
                            photoUrl1: urls[0] || null,
                            photoUrl2: urls[1] || null,
                            photoUrl3: urls[2] || null,
                        }),
                    });

                    navigation.navigate('RestaurantPage', { id: Number(id) });
                } catch (err) {
                    console.error('Error submitting review:', err);
                } finally {
                    setSubmitting(false);
                }
            },
            onClose: () => setShowAlert(null),
        });
    };

    if (submitting) return <Loading />;
    if (!restaurant) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.red} />;

    return (
        <>
            {popup && <Popup message={popup.message} variant={popup.variant} onClose={() => setPopup(null)} />}

            <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top }]}>
                <Title style={styles.title}>{t('titles.writeReview')}</Title>

                <View style={styles.card}>
                    <Image source={{ uri: restaurant?.images?.[0]?.Url }} style={styles.image} />
                    <Text style={styles.restaurantName}>{restaurant.Name}</Text>
                    <Text style={styles.restaurantAddress}>
                        {restaurant.address?.Street}, {restaurant.address?.City}, {restaurant.address?.Country}
                    </Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>{t('labels.rating')} *</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <TouchableOpacity key={i} onPress={() => setRating(i)}>
                                <Icon
                                    name={i <= (hovered || rating) ? 'star' : 'star-outline'}
                                    size={30}
                                    color={Colors.red}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>{t('labels.review')} *</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        value={comment}
                        onChangeText={setComment}
                        placeholder={t('placeholders.writeReview')}
                        maxLength={300 * 6}
                    />

                    <Text style={styles.label}>{t('form.photos')}</Text>
                    <ImagePicker images={images} setImages={setImages} maxImages={3} />

                    <View style={styles.checkboxWrapper}>
                        <TouchableOpacity
                            onPress={() => setAgreed(prev => !prev)}
                            style={[styles.customCheckbox, agreed && styles.checkedCheckbox]}
                        >
                            {agreed && <Icon name="check" size={16} color={Colors.red} />}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowGuidelines(true)}>
                            <Text style={styles.agreeText}>{t('checkbox.agree')}</Text>
                        </TouchableOpacity>
                    </View>

                    <Button variant="red" onPress={handleSubmit}>
                        {t('buttons.postReview')}
                    </Button>
                </View>

                {showGuidelines && (
                    <Alert
                        message={t('alerts.reviewGuidelines')}
                        buttonText={t('buttons.understand')}
                        cancelText={t('buttons.close')}
                        onButtonClick={() => setShowGuidelines(false)}
                        onClose={() => setShowGuidelines(false)}
                    />
                )}

                {showAlert && (
                    <Alert
                        message={showAlert.message}
                        buttonText={showAlert.buttonText}
                        cancelText={showAlert.cancelText}
                        onButtonClick={showAlert.onButtonClick}
                        onClose={showAlert.onClose}
                    />
                )}
            </ScrollView>
        </>
    );
};

export default WriteReviewScreen;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#1f1f1f',
    },
    title: {
        textAlign: 'center',
        marginBottom: 24,
    },
    card: {
        backgroundColor: Colors.beige,
        borderRadius: 20,
        overflow: 'hidden',
        alignItems: 'center',
        marginBottom: 24,
    },
    image: {
        width: '100%',
        height: 200,
    },
    restaurantName: {
        fontSize: 20,
        fontFamily: 'CormorantSC-Bold',
        marginTop: 10,
    },
    restaurantAddress: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: '#333',
        marginBottom: 12,
    },
    form: {
        gap: 16,
    },
    label: {
        color: Colors.beige,
        fontSize: 18,
        fontFamily: 'CormorantGaramond-Bold',
    },
    starsRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    textArea: {
        backgroundColor: Colors.beige,
        borderRadius: 12,
        padding: 12,
        minHeight: 120,
        textAlignVertical: 'top',
        fontFamily: 'CormorantGaramond-Regular',
    },
    checkboxWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginVertical: 12,
    },
    customCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.beige,
    },
    checkedCheckbox: {
        backgroundColor: Colors.beige,
    },
    agreeText: {
        color: Colors.beige,
        textDecorationLine: 'underline',
        fontFamily: 'CormorantGaramond-Regular',
    },
});