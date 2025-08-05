import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '@/components/Button';
import OwnerReviewPopup from '@/components/owner/OwnerReviewPopup';

const dummyReview = {
    ReviewId: 123,
    CreatedAt: new Date().toISOString(),
    Rating: 4.5,
    Comment: "Amazing food and service!",
    HasRequestedRecheck: false,
    status: { Name: 'Approved' },
    user: {
        Name: 'John',
        Surname: 'Doe',
        City: 'Skopje',
        Country: 'Macedonia',
        ProfilePictureUrl: null,
        _count: { reviews: 12 },
        status: { Name: 'Active' },
    },
    restaurant: {
        Name: 'Balkan Delight',
        address: {
            City: 'Skopje',
            Country: 'Macedonia',
        },
    },
};

const MyPage: React.FC = () => {
    const [visible, setVisible] = useState(false);

    return (
        <View style={styles.container}>
            <Button variant="red" onPress={() => setVisible(true)}>
                Open Owner Review Popup
            </Button>

            <OwnerReviewPopup
                review={dummyReview}
                visible={visible}
                onClose={() => setVisible(false)}
                userToken="test-token"
            />
        </View>
    );
};

export default MyPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
});