import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';
import Title from '@/components/Title';
import Popup from '@/components/Popup';
import RestaurantCard from '@/components/RestaurantCard';
import { useAuth } from '@/context/AuthContext';
import { getApiBaseUrl } from '@/api/config';
import { RootStackParamList } from '@/types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PopupState {
    message: string;
    variant: 'error' | 'success' | 'warning';
}

interface Restaurant {
    RestaurantId: number;
    Name: string;
    PriceRange: number;
    AverageRating: number;
    Details: string;
    cuisines: { Code: string }[];
    amenities: { Code: string }[];
    workingHours?: any[];
    IsClaimed: boolean;
    ClaimedByUserId?: string;
    images: { Url: string }[];
    reviews?: { StatusId: number }[];
}

const OwnerRestaurantsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { user } = useAuth();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [popup, setPopup] = useState<PopupState | null>(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const url = await getApiBaseUrl();
                const res = await fetch(`${url}/restaurants`);

                if (!res.ok) throw new Error(`Status ${res.status}`);

                const data: Restaurant[] = await res.json();
                const owned = data.filter(r => r.ClaimedByUserId === user?.id);
                setRestaurants(owned);
            } catch (err) {
                console.error('Failed to fetch restaurants:', err);
                setPopup({ message: t('errors.fetchFailed'), variant: 'error' });
            }
        };
        if (user) fetchRestaurants();
    }, [user]);

    return (
        <>
            {popup && (
                <Popup
                    message={popup.message}
                    variant={popup.variant}
                    onClose={() => setPopup(null)}
                />
            )}
            <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top }]}>
                <Title>{t('owner.myRestaurants')}</Title>

                {restaurants.length === 0 ? (
                    <Text style={styles.noResults}>{t('noResults')}</Text>
                ) : (
                    restaurants.map((r, index) => (
                        <MotiView
                            key={r.RestaurantId}
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: index * 100, duration: 400 }}
                            style={styles.cardWrapper}
                        >
                            <RestaurantCard
                                restaurant={r}
                                isFavorite={false}
                                onToggleFavorite={() => { }}
                                adminActions={{
                                    onEdit: () => navigation.navigate('RestaurantForm', { id: r.RestaurantId }),
                                }}
                            />
                        </MotiView>
                    ))
                )}
            </ScrollView>
        </>
    );
};

export default OwnerRestaurantsScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 16,
    },
    noResults: {
        textAlign: 'center',
        fontSize: 16,
        color: '#BA3B46',
        fontFamily: 'CormorantGaramond-Regular',
    },
    cardWrapper: {
        marginBottom: 12,
    },
});