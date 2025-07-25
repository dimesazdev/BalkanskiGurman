import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Linking,
    TouchableOpacity,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@/constants/Colors';

type Address = {
    Street: string;
    City: string;
    Country: string;
};

type Props = {
    address: Address;
    label: string;
    buttonText: string;
};

const LocationCard: React.FC<Props> = ({ address, label, buttonText }) => {
    const fullAddress = `${address.Street}, ${address.City}, ${address.Country}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
        fullAddress
    )}&zoom=15&size=600x300&markers=color:red%7C${encodeURIComponent(
        fullAddress
    )}&key=AIzaSyBonEPTKfyC3gP3JCFjVihDM_TUWzsS1GE`;

    const handleOpenMaps = () => {
        Linking.openURL(mapsUrl);
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Icon name="map-marker" size={24} color={Colors.red} />
                <Text style={styles.label}>{label}</Text>
            </View>

            <View style={styles.mapContainer}>
                <Image
                    source={{ uri: staticMapUrl }}
                    style={styles.map}
                    resizeMode="cover"
                />
            </View>

            <Text style={styles.address}>{fullAddress}</Text>

            <TouchableOpacity onPress={handleOpenMaps} style={styles.button}>
                <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LocationCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.beige,
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
        alignItems: 'center',
        textAlign: 'center',
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    label: {
        fontSize: 22,
        fontFamily: 'CormorantSC-Bold',
        color: '#333',
    },
    mapContainer: {
        width: '100%',
        height: 250,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.red,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    fallback: {
        fontSize: 14,
        color: '#555',
        fontFamily: 'CormorantGaramond-Regular',
    },
    address: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'CormorantGaramond-Regular',
        textAlign: 'center',
    },
    button: {
        backgroundColor: Colors.red,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontFamily: 'CormorantSC-SemiBold',
        fontSize: 16,
    },
});