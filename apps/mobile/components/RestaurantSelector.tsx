import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';
import SearchBar from './SearchBar';
import RestaurantCard from './RestaurantCard';
import Button from './Button';
import Colors from '@/constants/Colors';

type Restaurant = {
    RestaurantId: number;
    Name: string;
    PriceRange: number;
    AverageRating: number;
    Details: string;
    cuisines: { Code: string; }[];
    amenities: { Code: string; }[];
    address: {
        City: string;
        Country: string;
    };
    images: { Url: string }[];
    IsClaimed: boolean;
};

type Props = {
    restaurants: Restaurant[];
    selectedRestaurant: Restaurant | null;
    onSelect: (r: Restaurant | null) => void;
};

const RestaurantSelector: React.FC<Props> = ({
    restaurants = [],
    selectedRestaurant,
    onSelect,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useTranslation();

    const filteredRestaurants = useMemo(() => {
        return restaurants.filter((r) =>
            r.Name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [restaurants, searchTerm]);

    if (selectedRestaurant) {
        return (
            <MotiView
                style={styles.selectedContainer}
                from={{ translateX: -50, opacity: 0 }}
                animate={{ translateX: 0, opacity: 1 }}
                transition={{ duration: 500 }}
            >
                <RestaurantCard
                    restaurant={selectedRestaurant}
                    onToggleFavorite={() => { }}
                    isFavorite={false}
                />
                <Button
                    variant="red-small"
                    onPress={() => onSelect(null)}
                >
                    {t('buttons.changeSelection')}
                </Button>
            </MotiView>
        );
    }

    return (
        <View style={styles.container}>
            <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t('placeholders.searchRestaurants')}
            />

            {searchTerm.trim().length > 0 ? (
                filteredRestaurants.slice(0, 10).map(item => (
                    <TouchableOpacity
                        key={item.RestaurantId}
                        style={styles.listItem}
                        onPress={() => onSelect(item)}
                    >
                        <Image
                            source={{ uri: item.images?.[0]?.Url || 'https://via.placeholder.com/60' }}
                            style={styles.thumbnail}
                        />
                        <View style={styles.textWrapper}>
                            <Text style={styles.name}>{item.Name}</Text>
                            <Text style={styles.location}>
                                {item.address?.City}, {item.address?.Country}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <Text style={styles.noResults}>
                    {t("noResults")}
                </Text>
            )}
        </View>
    );
};

export default RestaurantSelector;

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    selectedContainer: {
        alignItems: 'center',
    },
    list: {
        maxHeight: 300,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.beige,
        padding: 10,
        borderRadius: 10,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 6,
        objectFit: 'cover',
    },
    textWrapper: {
        flexShrink: 1,
    },
    name: {
        fontSize: 16,
        fontFamily: 'CormorantSC-Bold',
        color: Colors.black,
    },
    location: {
        fontSize: 14,
        fontFamily: 'CormorantGaramond-Regular',
        color: '#333',
    },
    noResults: {
        fontStyle: 'italic',
        opacity: 0.85,
        color: Colors.white,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 4,
        fontFamily: 'CormorantGaramond-Regular',
        fontSize: 16
    },
});