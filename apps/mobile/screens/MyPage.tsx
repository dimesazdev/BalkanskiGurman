import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import ScreenBackground from '@/components/ScreenBackground';
import Title from '@/components/Title';
import RestaurantSelector from '@/components/RestaurantSelector';
import FormTextarea from '@/components/FormTextarea';

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

const MyPage = () => {
    const { t } = useTranslation();

    const allRestaurants = [
        {
            RestaurantId: 1,
            Name: "Baba's Kitchen",
            PriceRange: 2,
            AverageRating: 4.5,
            Details: "Authentic Balkan cuisine with a modern twist.",
            cuisines: ['MK', 'SR'],
            amenities: ['DELIV', 'PARK', 'VEGE'],
            address: { City: 'Skopje', Country: 'North Macedonia' },
            images: [
                {
                    Url: 'https://res.cloudinary.com/dw6c7wdbe/image/upload/v1750188124/review_photos/4f5b47521b3815961b3134d061920916.jpg'
                }
            ],
            IsClaimed: true,
        },
        {
            RestaurantId: 2,
            Name: 'Ćevabdžinica Kod Muse',
            PriceRange: 1,
            AverageRating: 4.8,
            Details: 'Traditional Bosnian ćevapi in old town Sarajevo.',
            cuisines: ['BA'],
            amenities: ['TOILET', 'CARD'],
            address: { City: 'Sarajevo', Country: 'Bosnia and Herzegovina' },
            images: [
                {
                    Url: 'https://res.cloudinary.com/demo/image/upload/v1700000000/sample.jpg'
                }
            ],
            IsClaimed: false,
        }
    ];

    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [explanation, setExplanation] = useState("");

    return (
        <ScreenBackground>
            <View style={styles.container}>
                <Title>Balkanski Gurman</Title>
                <FormTextarea
                    id="explanation"
                    label="Explain the issue"
                    value={explanation}
                    onChange={setExplanation}
                    placeholder="Describe the problem here..."
                />
            </View>
        </ScreenBackground>
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
