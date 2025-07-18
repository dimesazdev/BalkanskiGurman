import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenBackground from '@/components/ScreenBackground';
import RestaurantCard from '@/components/RestaurantCard';
import SearchBar from '@/components/SearchBar';
import SortBar from '@/components/SortBar';
import FilterSidebar from '@/components/FilterSidebar';
import Popup from '@/components/Popup';
import Alert from '@/components/Alert';
import Colors from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

const FavoritesScreen = () => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    type Favorite = {
        RestaurantId: number;
        restaurant: {
            RestaurantId: number;
            Name: string;
            PriceRange: number;
            AverageRating: number;
            cuisines?: { cuisine: any; Code: string }[];
            amenities?: { amenity: any; Code: string }[];
            workingHours?: any[];
            [key: string]: any;
        };
        [key: string]: any;
    };

    const [rawFavorites, setRawFavorites] = useState<Favorite[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [showNoFavoritesAlert, setShowNoFavoritesAlert] = useState(true);
    const [filters, setFilters] = useState<{
        price: number[];
        rating: number[];
        cuisines: string[];
        amenities: string[];
        hours: string[];
    }>({
        price: [],
        rating: [],
        cuisines: [],
        amenities: [],
        hours: [],
    });
    const [popup, setPopup] = useState<{ message: string; variant?: 'success' | 'warning' | 'error' } | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | string | null>(null);
    const [sortOption, setSortOption] = useState('rating');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetch('http://192.168.100.31:3001/favorites', {
                headers: { Authorization: `Bearer ${user.token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    setRawFavorites(data);
                    setFavorites(data.map((fav: { RestaurantId: any; }) => fav.RestaurantId));
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    const showPopup = (message: string, variant: 'success' | 'warning' | 'error' = 'error') => {
        setPopup({ message, variant });
        setTimeout(() => setPopup(null), 3000);
    };

    const toggleFavorite = (restaurantId: number | string) => {
        setConfirmDeleteId(restaurantId);
    };

    const confirmDelete: () => Promise<void> = async () => {
        try {
            await fetch(`http://192.168.100.31:3001/favorites/by-restaurant/${confirmDeleteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setFavorites((prev) => prev.filter((id) => id !== confirmDeleteId));
            setRawFavorites((prev) => prev.filter((f) => f.RestaurantId !== confirmDeleteId && f.restaurant.RestaurantId !== confirmDeleteId));
            showPopup(t('alerts.favoriteRemoved'), 'success');
        } catch {
            showPopup(t('alerts.favoriteError'), 'error');
        }
        setConfirmDeleteId(null);
    };

    const isOpenNow = (workingHours: any[]) => {
        const now = new Date();
        const dbDay = ((now.getDay() + 6) % 7) + 1;
        const entry = workingHours?.find((w) => w.DayOfWeek === dbDay);
        if (!entry || entry.IsClosed) return false;
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const open = (entry.OpenHour ?? 0) * 60 + (entry.OpenMinute ?? 0);
        const close = (entry.CloseHour ?? 0) * 60 + (entry.CloseMinute ?? 0);
        return close > open ? nowMinutes >= open && nowMinutes < close : nowMinutes >= open || nowMinutes < close;
    };

    const isOpenAfterMidnight = (workingHours: any[]) => {
        const now = new Date();
        const dbDay = ((now.getDay() + 6) % 7) + 1;
        const entry = workingHours?.find((w) => w.DayOfWeek === dbDay);
        if (!entry || entry.IsClosed) return false;
        const close = (entry.CloseHour ?? 0) * 60 + (entry.CloseMinute ?? 0);
        return close > 0 && close < 360;
    };

    const filteredRestaurants = rawFavorites
        .map((fav) => {
            const r = fav.restaurant;
            return {
                ...r,
                cuisines: r.cuisines?.map((c) => c.cuisine) ?? [],
                amenities: r.amenities?.map((a) => a.amenity) ?? [],
                Details: r.Details ?? '',
                IsClaimed: r.IsClaimed ?? false,
                images: r.images ?? [],
            };
        })
        .filter((r) => r.Name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((r) => {
            if (filters.price.length && !filters.price.includes(r.PriceRange)) return false;
            if (filters.rating.length && r.AverageRating < Math.min(...filters.rating)) return false;
            const cuisineCodes = r.cuisines.map((c) => c.Code);
            if (filters.cuisines.length && !filters.cuisines.some((code) => cuisineCodes.includes(code))) return false;
            const amenityCodes = r.amenities.map((a) => a.Code);
            if (filters.amenities.length && !filters.amenities.every((code) => amenityCodes.includes(code))) return false;
            if (filters.hours.includes('openNow') && !isOpenNow(r.workingHours ?? [])) return false;
            if (filters.hours.includes('afterMidnight') && !isOpenAfterMidnight(r.workingHours ?? [])) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortOption === 'priceLow') return a.PriceRange - b.PriceRange;
            if (sortOption === 'priceHigh') return b.PriceRange - a.PriceRange;
            return b.AverageRating - a.AverageRating;
        });

    return (
        <ScreenBackground>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {popup && (
                    <Popup message={popup.message} variant={popup.variant} onClose={() => setPopup(null)} />
                )}

                {confirmDeleteId && (
                    <Alert
                        visible={true}
                        message={t('alerts.removeFavoriteConfirm')}
                        buttonText={t('buttons.confirm')}
                        onButtonClick={confirmDelete}
                        onClose={() => setConfirmDeleteId(null)}
                    />
                )}

                {favorites.length === 0 && !loading && showNoFavoritesAlert && (
                    <Alert
                        visible={true}
                        message={t('alerts.noFavorites')}
                        buttonText={t('buttons.backToRestaurants')}
                        onButtonClick={() => {
                            setShowNoFavoritesAlert(false);
                            navigation.navigate('ExYuMap');
                        }}
                        showCancel={false}
                        onClose={() => setShowNoFavoritesAlert(false)}
                    />
                )}

                <View style={styles.settingsBar}>
                    <View style={styles.searchRow}>
                        <SearchBar
                            placeholder={t('labels.searchByKeyword')}
                            value={searchTerm}
                            onChange={setSearchTerm}
                        />
                    </View>
                    <View style={styles.sortFilterRow}>
                        <SortBar
                            sortOptions={['rating', 'priceLow', 'priceHigh']}
                            selected={sortOption}
                            onSelect={setSortOption}
                            t={t}
                        />
                        <FilterSidebar filters={filters} onChange={setFilters} />
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={Colors.beige} />
                ) : filteredRestaurants.length === 0 ? (
                    <Text style={styles.noResults}>{t('noResults')}</Text>
                ) : (
                    <FlatList
                        data={filteredRestaurants}
                        keyExtractor={(item) => item.RestaurantId.toString()}
                        renderItem={({ item }) => (
                            <RestaurantCard
                                restaurant={item}
                                isFavorite={favorites.includes(item.RestaurantId)}
                                onToggleFavorite={toggleFavorite}
                            />
                        )}
                        contentContainerStyle={styles.cards}
                    />
                )}
            </View>
        </ScreenBackground>
    );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
    },
    settingsBar: {
        gap: 12,
        marginBottom: 16,
    },
    searchRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    sortFilterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
    },
    cards: {
        paddingBottom: 100,
    },
    noResults: {
        marginTop: 40,
        color: Colors.beige,
        textAlign: 'center',
        fontSize: 18,
        fontFamily: 'CormorantGaramond-Regular'
    }
});