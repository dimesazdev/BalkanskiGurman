import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Linking,
} from 'react-native';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useAzureTranslation } from '@/hooks/useAzureTranslation';
import { getOpenCloseStatus, getNextOpeningTime } from '@/utils/openingHoursUtils';
import dayjs from 'dayjs';
import Button from '@/components/Button';
import Title from '@/components/Title';
import MediaGallery from '@/components/MediaGallery';
import InfoCard from '@/components/InfoCard';
import LocationCard from '@/components/LocationCard';
import WorkingHoursCard from '@/components/WorkingHoursCard';
import ReviewCard from '@/components/ReviewCard';
import Popup from '@/components/Popup';
import Alert from '@/components/Alert';
import SortBar from '@/components/SortBar';
import SearchBar from '@/components/SearchBar';
import { RootStackParamList } from '@/types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getApiBaseUrl } from '@/api/config';
import Colors from '@/constants/Colors';
import { getAmenityIcon } from '@/utils/getAmenityIcon';

const OWNER_ROLE_ID = '34fuihi4-5vj8-3v4e-43v5-3jfismy876s5';

const RestaurantPageScreen = () => {
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { id } = route.params as { id: string };
    const { t } = useTranslation();
    const { user } = useAuth();

    const [restaurant, setRestaurant] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [popup, setPopup] = useState<any>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('rating');
    const [showLoginAlert, setShowLoginAlert] = useState(false);

    const now = dayjs();
    const today = now.day() === 0 ? 7 : now.day();

    const getDayName = (dayNum: number) =>
        t(`days.${['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][dayNum - 1]}`);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseUrl = await getApiBaseUrl();

                const res = await fetch(`${baseUrl}/restaurants/${id}`);
                const data = await res.json();
                setRestaurant(data);

                const revRes = await fetch(`${baseUrl}/restaurants/${id}/reviews`);
                const revData = await revRes.json();
                setReviews(revData);

                if (user) {
                    const favRes = await fetch(`${baseUrl}/favorites`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    });
                    const favData = await favRes.json();
                    const favIds = favData.map((f: any) => f.RestaurantId);
                    setIsFavorite(favIds.includes(Number(id)));
                }
            } catch (err) {
                console.error('Failed to load restaurant', err);
            }
        };

        fetchData();
    }, [id, user]);

    const { translatedText: translatedDetailsText } = useAzureTranslation(
        restaurant?.Details || ''
    );

    if (!restaurant) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

    const todayHours = restaurant.workingHours.find(
        (h: any) => h.DayOfWeek === today
    );
    const { isOpen, closeFormatted } = getOpenCloseStatus(todayHours, now, t);
    const nextOpen = getNextOpeningTime(
        restaurant.workingHours,
        today,
        getDayName,
        t
    );

    const renderStars = (rating: number) => {
        const stars = [];
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.25 && rating % 1 < 0.75;
        const empty = 5 - full - (half ? 1 : 0);

        for (let i = 0; i < full; i++) {
            stars.push(<Icon key={`full-${i}`} name="star" size={20} color={Colors.red} />);
        }
        if (half) {
            stars.push(<Icon key="half" name="star-half-full" size={20} color={Colors.red} />);
        }
        for (let i = 0; i < empty; i++) {
            stars.push(<Icon key={`empty-${i}`} name="star-outline" size={20} color={Colors.red} />);
        }

        return stars;
    };

    const handleToggleFavorite = async () => {
        if (!user) return setShowLoginAlert(true);

        try {
            const baseUrl = await getApiBaseUrl();

            if (isFavorite) {
                await fetch(`${baseUrl}/favorites/by-restaurant/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setIsFavorite(false);
                setPopup({ message: t('alerts.favoriteRemoved'), variant: 'success' });
            } else {
                await fetch(`${baseUrl}/favorites`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ RestaurantId: Number(id) }),
                });
                setIsFavorite(true);
                setPopup({ message: t('alerts.favoriteAdded'), variant: 'success' });
            }
        } catch {
            setPopup({ message: t('alerts.favoriteError'), variant: 'error' });
        }
    };

    const approvedReviews = reviews.filter(r => [5, 7].includes(r.StatusId));
    const filteredReviews = approvedReviews.filter(r =>
        r.Comment.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSortedReviews = () => {
        switch (sortOption) {
            case 'highestRating':
                return [...filteredReviews].sort((a, b) => b.Rating - a.Rating);
            case 'lowestRating':
                return [...filteredReviews].sort((a, b) => a.Rating - b.Rating);
            case 'latest':
                return [...filteredReviews].sort(
                    (a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
                );
            default:
                return filteredReviews;
        }
    };

    const userStatus = user?.status?.toLowerCase();
    let disabledReason = '';
    if (userStatus === 'suspended') disabledReason = t('alerts.suspendedAction');
    if (userStatus === 'banned') disabledReason = t('alerts.bannedAction');
    if (user?.role === OWNER_ROLE_ID) disabledReason = t('alerts.ownerCannotReview');

    return (
        <>
            <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Icon name="arrow-left" size={22} color="#FFEEDB" />
                    <Text style={styles.backText}>{t('buttons.goBack')}</Text>
                </TouchableOpacity>

                <Title>{restaurant.Name}</Title>

                <View style={styles.ratingWrapper}>
                    <View style={styles.stars}>
                        {renderStars(restaurant.AverageRating)}
                    </View>
                    <Text style={styles.ratingText}>
                        {restaurant.AverageRating.toFixed(2)} ({t('labels.reviewCount', { count: approvedReviews.length })})
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    <Button
                        variant={isFavorite ? 'red' : 'beige-outline'}
                        onPress={handleToggleFavorite}
                    >
                        <Icon
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={20}
                            color={isFavorite ? '#fff' : Colors.beige}
                        />{' '}
                        {isFavorite ? t('buttons.removeFromFavorites') : t('buttons.addToFavorites')}
                    </Button>
                </View>

                <View style={styles.subinfo}>
                    <Text style={[styles.statusText, { color: isOpen ? '#08FF00' : '#BA3B46' }]}>
                        {isOpen
                            ? `${t('labels.openUntil')} ${closeFormatted}`
                            : `${t('labels.closed')} · ${nextOpen}`}
                    </Text>

                    <Text style={styles.dot}> · </Text>

                    <Text style={styles.subinfoText}>
                        {t(`labels.price${restaurant.PriceRange === 1 ? 'Low' : restaurant.PriceRange === 2 ? 'Mid' : 'High'}`)}
                    </Text>

                    <Text style={styles.dot}> · </Text>

                    <Text style={styles.subinfoText}>
                        {restaurant.cuisines?.map((rc: { cuisine: { Code: string } }) =>
                            t(`cuisines.${rc.cuisine.Code}`)
                        ).join(', ')}
                    </Text>
                </View>

                <MediaGallery media={restaurant.images} />

                <Title>{t('restaurant.details')}</Title>
                <Text style={styles.details}>{translatedDetailsText}</Text>

                {/* Info cards */}
                <View style={styles.infoCardsWrapper}>
                    <InfoCard
                        icon="cash-multiple"
                        label={t('restaurant.price')}
                        value={t(`labels.price${restaurant.PriceRange === 1 ? 'Low' : restaurant.PriceRange === 2 ? 'Mid' : 'High'}`) + ` ${t('labels.perPerson')}`}
                    />

                    <InfoCard
                        icon="silverware-fork-knife"
                        label={t('restaurant.cuisines')}
                        value={restaurant.cuisines?.map((rc: { cuisine: { Code: any; }; }) => t(`cuisines.${rc.cuisine.Code}`)).join(', ')}
                    />

                    <InfoCard
                        icon="phone"
                        label={t('restaurant.phone')}
                        value={restaurant.PhoneNumber || t('labels.notAvailable')}
                        style={{ opacity: restaurant.PhoneNumber ? 1 : 0.5 }}
                        onClick={
                            restaurant.PhoneNumber
                                ? () => Linking.openURL(`tel:${restaurant.PhoneNumber}`)
                                : undefined
                        }
                    />

                    <InfoCard
                        icon="web"
                        label={t('restaurant.website')}
                        value={restaurant.Website || t('labels.notAvailable')}
                        style={{ opacity: restaurant.Website ? 1 : 0.5 }}
                        onClick={
                            restaurant.Website
                                ? () => Linking.openURL(restaurant.Website)
                                : undefined
                        }
                    />

                    <InfoCard
                        icon="file-document"
                        label={t('restaurant.menu')}
                        value={restaurant.MenuUrl ? t('labels.clickToView') : t('labels.notAvailable')}
                        style={{ opacity: restaurant.MenuUrl ? 1 : 0.5 }}
                        onClick={
                            restaurant.MenuUrl
                                ? () => Linking.openURL(restaurant.MenuUrl)
                                : undefined
                        }
                    />
                </View>

                {/* Location and Hours */}
                <View style={styles.locationHoursWrapper}>
                    <Title>{t('restaurant.locationHours')}</Title>
                    <LocationCard
                        address={restaurant.address}
                        label={t('restaurant.location')}
                        buttonText={t('restaurant.goToLocation')}
                    />
                    <WorkingHoursCard
                        hours={[...restaurant.workingHours].sort((a, b) => a.DayOfWeek - b.DayOfWeek)}
                        getDayName={getDayName}
                        label={t('restaurant.workingHours')}
                        buttonText={t('restaurant.suggestEdit')}
                        onSuggestEdit={() => {
                            navigation.navigate('ReportIssue', {
                                issueType: 'Wrong Info',
                                restaurantId: restaurant.RestaurantId,
                            });
                        }}
                    />
                </View>

                <Title>{t('restaurant.amenities')}</Title>
                <View style={styles.amenitiesGrid}>
                    {['DELIV', 'PARK', 'PET', 'CARD', 'KIDS', 'SMOK', 'VEGAN', 'VEGE', 'GLUT', 'HALAL'].map(code => {
                        const hasAmenity = restaurant.amenities?.some((a: any) => a.amenity?.Code === code);
                        return (
                            <InfoCard
                                key={code}
                                icon={getAmenityIcon(code)}
                                label={t(`amenities.${code}`)}
                                value={hasAmenity ? t('labels.available') : t('labels.notAvailable')}
                                style={{ opacity: hasAmenity ? 1 : 0.5 }}
                            />
                        );
                    })}
                </View>

                {/* Reviews */}
                <Title>{t('restaurant.reviews')}</Title>
                <View style={styles.reviewToolbar}>
                    <View style={styles.sortWriteRow}>
                        <SortBar
                            sortOptions={['highestRating', 'lowestRating', 'latest']}
                            selected={sortOption}
                            onSelect={setSortOption}
                            t={t}
                        />
                        <Button
                            variant="red"
                            onPress={() => {
                                if (!user) setShowLoginAlert(true);
                                else navigation.navigate('WriteReview', { id: Number(id) });
                            }}
                            style={{ opacity: disabledReason ? 0.5 : 1 }}
                        >
                            {t('buttons.writeReview')}
                        </Button>
                    </View>

                    <View style={styles.searchRow}>
                        <SearchBar
                            placeholder={t('labels.searchByKeyword')}
                            value={searchTerm}
                            onChange={setSearchTerm}
                        />
                    </View>
                </View>

                {getSortedReviews().length === 0 ? (
                    <Text style={styles.noReviewsText}>
                        {reviews.length === 0
                            ? t('restaurant.noReviews')
                            : t('restaurant.noSearchResults')}
                    </Text>
                ) : (
                    getSortedReviews().map((r) => (
                        <ReviewCard
                            key={r.ReviewId}
                            review={r}
                            onDelete={(id, status) => {
                                setReviews(prev => prev.filter(rev => rev.ReviewId !== id));
                                setPopup({
                                    message: status === 'success' ? t('alerts.reviewDeleted') : t('alerts.deleteReviewError'),
                                    variant: status === 'success' ? 'success' : 'error',
                                });
                            }}
                        />
                    ))
                )}


                <Alert
                    visible={showLoginAlert}
                    message={t('restaurantPage.reviewLogin')}
                    buttonText={t('navbar.login')}
                    cancelText={t('restaurantPage.notNow')}
                    onButtonClick={() => {
                        setShowLoginAlert(false);
                        navigation.navigate('Login');
                    }}
                    onClose={() => setShowLoginAlert(false)}
                />
            </ScrollView>
            {popup && (
                <Popup
                    message={popup.message}
                    variant={popup.variant}
                    onClose={() => setPopup(null)}
                />
            )}
        </>
    );
};

export default RestaurantPageScreen;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#1f1f1f',
    },
    back: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
        marginTop: 15
    },
    backText: {
        color: '#FFEEDB',
        fontSize: 18,
        fontFamily: 'CormorantGaramond-Regular',
    },
    headerActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    subinfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        gap: 4,
    },
    statusText: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
    },
    subinfoText: {
        color: '#FFEEDB',
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
    },
    dot: {
        color: '#FFEEDB',
        fontSize: 16,
        marginHorizontal: 2,
        fontFamily: 'CormorantGaramond-Regular',
    },
    ratingWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        gap: 8,
    },
    stars: {
        flexDirection: 'row',
    },
    ratingText: {
        fontSize: 16,
        color: '#FFEEDB',
        fontFamily: 'CormorantGaramond-Regular',
    },
    details: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        color: '#FFEEDB',
        fontFamily: 'CormorantGaramond-Regular',
        marginBottom: 24,
    },
    infoCardsWrapper: {
        alignItems: 'center',
        marginBottom: 24,
        display: 'flex',
        gap: 15
    },
    locationHoursWrapper: {
        marginBottom: 24,
        display: 'flex',
        gap: 15
    },
    amenitiesGrid: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 15,
        marginBottom: 24,
        alignItems: 'center'
    },
    reviewToolbar: {
        gap: 12,
        marginBottom: 16,
    },
    sortWriteRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    searchRow: {
        width: '100%'
    },
    noReviewsText: {
        fontSize: 16,
        color: '#FFEEDB',
        fontFamily: 'CormorantGaramond-Regular',
        textAlign: 'center',
        marginBottom: 24,
    },
});