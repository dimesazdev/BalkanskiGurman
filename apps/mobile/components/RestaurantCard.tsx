import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Colors from '@/constants/Colors';
import { RootStackParamList } from '@/types/navigation';
import { getAmenityIcon } from '@/utils/getAmenityIcon';
import { getOpenCloseStatus, getNextOpeningTime } from '@/utils/openingHoursUtils';
import dayjs from 'dayjs';

type Restaurant = {
    RestaurantId: number;
    Name: string;
    PriceRange: number;
    AverageRating: number;
    Details: string;
    cuisines: { Code: string }[];
    amenities: { Code: string }[];
    workingHours?: any[];
    IsClaimed: boolean;
    images: { Url: string }[];
    reviews?: { StatusId: number }[];
};

type AdminActions = {
    onEdit?: (id: number | string) => void;
    onDelete?: (id: number | string) => void;
};

type RestaurantCardProps = {
    restaurant: Restaurant;
    isFavorite: boolean;
    onToggleFavorite: (id: number | string) => void;
    searchTerm?: string;
    adminActions?: AdminActions;
};

const RestaurantCard: React.FC<RestaurantCardProps> = ({
    restaurant,
    isFavorite,
    onToggleFavorite,
    searchTerm = "",
    adminActions,
}) => {
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const {
        RestaurantId,
        Name,
        PriceRange,
        AverageRating,
        Details,
        cuisines = [],
        amenities = [],
        IsClaimed,
        images = []
    } = restaurant;

    const image = images?.[0]?.Url || 'https://via.placeholder.com/400x300';

    const getPriceLabel = () => {
        switch (PriceRange) {
            case 1: return '5–10€';
            case 2: return '10–20€';
            case 3: return '20€+';
            default: return '-';
        }
    };

    const renderStars = () => {
        if (typeof AverageRating !== 'number') return null;
        const full = Math.floor(AverageRating);
        const half = AverageRating % 1 >= 0.25 && AverageRating % 1 < 0.75;
        const empty = 5 - full - (half ? 1 : 0);

        const stars = [];
        for (let i = 0; i < full; i++) stars.push(<Icon key={`full-${i}`} name="star" size={20} color={Colors.red} />);
        if (half) stars.push(<Icon key="half" name="star-half-full" size={20} color={Colors.red} />);
        for (let i = 0; i < empty; i++) stars.push(<Icon key={`empty-${i}`} name="star-outline" size={20} color={Colors.red} />);

        return <View style={styles.stars}>{stars}</View>;
    };

    const now = dayjs();
    const todayDay = ((now.day() + 6) % 7) + 1;
    const todayHours = restaurant.workingHours?.find(h => h.DayOfWeek === todayDay);

    const getDayName = (d: number) => {
        const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        return t(`days.${days[d - 1]}`);
    };

    const { isOpen, closeFormatted } = getOpenCloseStatus(todayHours, now, t);
    const nextOpen = getNextOpeningTime(restaurant.workingHours || [], todayDay, getDayName, t);

    return (
        <TouchableOpacity onPress={() => navigation.navigate('RestaurantPage', { id: RestaurantId })} style={styles.card}>
            <View style={styles.imageWrap}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                    style={styles.favoriteBtn}
                    onPress={() => onToggleFavorite(RestaurantId)}
                >
                    <Icon name={isFavorite ? 'heart' : 'heart-outline'} size={32} color={Colors.red} />
                </TouchableOpacity>
                {adminActions && (
                    <View style={styles.adminBtns}>
                        {adminActions.onEdit && (
                            <TouchableOpacity onPress={() => adminActions.onEdit!(RestaurantId)}>
                                <Icon name="pencil" size={24} color={Colors.red} />
                            </TouchableOpacity>
                        )}
                        {adminActions.onDelete && (
                            <TouchableOpacity onPress={() => adminActions.onDelete!(RestaurantId)}>
                                <Icon name="delete" size={24} color={Colors.red} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{Name}</Text>
                    {IsClaimed && <Icon name="check-circle" size={18} color="green" />}
                </View>

                {todayHours && (
                    <View style={styles.openStatusRow}>
                        <Icon name="clock-outline" size={16} color={isOpen ? 'green' : Colors.red} />
                        <Text style={[styles.openStatusText, { color: isOpen ? 'green' : Colors.red }]}>
                            {isOpen
                                ? `${t('labels.openUntil')} ${closeFormatted}`
                                : `${t('labels.closed')} · ${nextOpen}`}
                        </Text>
                    </View>
                )}

                <View style={styles.row}><Text style={styles.label}>{t('labels.rating')}:</Text>{renderStars()}</View>

                <View style={styles.row}>
                    <Text style={styles.label}>{t('labels.price')}:</Text>
                    <Text style={styles.value}>{getPriceLabel()} {t('labels.perPerson')}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>{t('labels.cuisines')}:</Text>
                    <Text style={styles.value}>{cuisines.map(c => t(`cuisines.${c.Code}`)).join(', ')}</Text>
                </View>

                <Text numberOfLines={2} ellipsizeMode="tail" style={styles.details}>{Details}</Text>

                <View style={styles.amenities}>
                    {amenities.map(a => (
                        <Icon key={a.Code} name={getAmenityIcon(a.Code)} size={20} color={Colors.red} />
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.beige,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 4,
    },
    imageWrap: {
        width: '100%',
        aspectRatio: 16 / 9,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    favoriteBtn: {
        position: 'absolute',
        top: 12,
        left: 12,
        borderRadius: 50,
        width: 50,
        height: 50,
        justifyContent: 'center',
        backgroundColor: Colors.beige,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    adminBtns: {
        position: 'absolute',
        top: 12,
        right: 12,
        gap: 12,
    },
    content: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    name: {
        fontSize: 24,
        fontFamily: 'CormorantSC-Bold',
        color: '#000',
    },
    openStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 6,
    },
    openStatusText: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'CormorantGaramond-Regular',
        marginRight: 4,
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'CormorantGaramond-Regular',
    },
    stars: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    details: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'CormorantGaramond-Regular',
    },
    amenities: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 10,
    },
});

export default RestaurantCard;