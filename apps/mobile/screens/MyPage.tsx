import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import FilterSidebar from '@/components/FilterSidebar';
import RestaurantCard from '@/components/RestaurantCard';
import SearchBar from '@/components/SearchBar';
import SortBar from '@/components/SortBar';
import ScreenBackground from '@/components/ScreenBackground';

const MyPage = () => {
    const { t } = useTranslation();

    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'rating' | 'name' | 'price'>('rating');
    const [phone, setPhone] = useState({
        phoneNumber: '',
        countryCode: '+389',
    });

    const [filters, setFilters] = useState({
        price: [],
        rating: [],
        cuisines: [],
        amenities: [],
        hours: [],
    });

    const restaurant = {
        RestaurantId: '123',
        Name: "Baba's Kitchen",
        AverageRating: 4.5,
        PriceRange: 2,
        Details: "Authentic Balkan cuisine with a modern twist. Cozy atmosphere and homemade specialties.",
        cuisines: [{ Code: 'MK' }, { Code: 'SR' }],
        amenities: [{ Code: 'DELIV' }, { Code: 'PARK' }, { Code: 'VEGE' }],
        IsClaimed: true,
        images: [{ Url: 'https://via.placeholder.com/600x400.png?text=Restaurant' }],
    };

    return (
        <View />
    );
};

export default MyPage;

const styles = StyleSheet.create({
    container: {
        padding: 24,
        gap: 20,
        marginTop: 60,
    },
});
