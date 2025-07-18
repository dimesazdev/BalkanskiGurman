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
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '@/context/AuthContext';

const RestaurantsScreen = () => {
    const insets = useSafeAreaInsets();
    const [sortOption, setSortOption] = useState('rating');
    const [loginAlert, setLoginAlert] = useState(false);
    const route = useRoute<RouteProp<RootStackParamList, 'Restaurants'>>();
    const { city, country, metro } = route.params;
    const { user } = useAuth();

    const { t } = useTranslation();

    const [favorites, setFavorites] = useState<(string | number)[]>([]);
    const [popup, setPopup] = useState<{ message: string; variant: 'success' | 'error' | 'warning' } | null>(null);
    const showPopup = (message: string, variant: 'success' | 'error' | 'warning' = 'error') => {
        setPopup({ message, variant });
        setTimeout(() => setPopup(null), 3000);
    };
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
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const url = `http://192.168.100.31:3001/restaurants?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}${metro ? `&metro=${encodeURIComponent(metro)}` : ''}`;

        fetch(url)
            .then((res) => res.json())
            .then((data) => setRestaurants(data))
            .catch((err) => console.error(err));
    }, [city, country, metro]);

    const toggleFavorite = async (restaurantId: number | string) => {
        if (!user) {
            setLoginAlert(true);
            return;
        }

        const isFav = favorites.includes(restaurantId);

        try {
            if (isFav) {
                await fetch(`http://192.168.100.31:3001/favorites/by-restaurant/${restaurantId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setFavorites(prev => prev.filter(id => id !== restaurantId));
                showPopup(t('alerts.favoriteRemoved'), 'success');
            } else {
                await fetch('http://192.168.100.31:3001/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({ RestaurantId: restaurantId }),
                });
                setFavorites(prev => [...prev, restaurantId]);
                showPopup(t('alerts.favoriteAdded'), 'success');
            }
        } catch {
            showPopup(t('alerts.favoriteError'), 'error');
        }
    };

    const filtered = restaurants
        .filter((r) => r.Name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((r) => {
            if (filters.price.length && !filters.price.includes(r.PriceRange)) return false;
            if (filters.rating.length && r.AverageRating < Math.min(...filters.rating)) return false;
            const cuisines = r.cuisines?.map((c: any) => c.Code) || [];
            if (filters.cuisines.length && !filters.cuisines.some((code) => cuisines.includes(code))) return false;
            const amenities = r.amenities?.map((a: any) => a.Code) || [];
            if (filters.amenities.length && !filters.amenities.every((code) => amenities.includes(code))) return false;
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
                    <Popup
                        message={popup.message}
                        variant={popup.variant}
                        onClose={() => setPopup(null)}
                    />
                )}
                {loginAlert && (
                    <Alert
                        visible={true}
                        message={t('alerts.loginRequired')}
                        buttonText={t('navbar.login')}
                        onButtonClick={() => { }}
                        onClose={() => setLoginAlert(false)}
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

                {(city || metro || country) && (
                    <Text style={styles.resultsLabel}>
                        {t("labels.showingResultsFor")}{" "}
                        <Text style={styles.resultsStrong}>
                            {metro ? `${metro} (${city}), ${country}` : `${city}, ${country}`}
                        </Text>
                    </Text>
                )}

                {filtered.length === 0 ? (
                    <Text style={styles.noResults}>{t('noResults')}</Text>
                ) : (
                    <FlatList
                        data={filtered}
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

export default RestaurantsScreen;

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
    },
    resultsLabel: {
        color: Colors.beige,
        fontSize: 15,
        fontFamily: 'CormorantGaramond-Regular',
        textAlign: 'center',
        marginBottom: 12,
    },

    resultsStrong: {
        fontFamily: 'CormorantGaramond-SemiBold',
    }
});