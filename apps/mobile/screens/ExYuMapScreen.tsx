import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE, LatLng } from 'react-native-maps';
import GeojsonLayer from '../components/GeojsonLayer';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Button from '@/components/Button';
import { useTranslation } from 'react-i18next';
import Loading from '@/components/Loading';
import Colors from '@/constants/Colors';

const COUNTRY_CODES = {
    Macedonia: 'MK',
    Serbia: 'RS',
    Croatia: 'HR',
    Slovenia: 'SI',
    'Bosnia and Herzegovina': 'BA',
    Montenegro: 'ME',
} as const;

const REGION_DATA: Record<string, any> = {
    Macedonia: require('../assets/geojson/macedonia-regions.json'),
    Serbia: require('../assets/geojson/serbia-regions.json'),
    Croatia: require('../assets/geojson/croatia-regions.json'),
    Slovenia: require('../assets/geojson/slovenia-regions.json'),
    'Bosnia and Herzegovina': require('../assets/geojson/bosnia-regions.json'),
    Montenegro: require('../assets/geojson/montenegro-regions.json'),
};

const REGION_DATA_KEYS = Object.keys(REGION_DATA).reduce((acc, key) => {
    acc[key.toLowerCase()] = REGION_DATA[key];
    return acc;
}, {} as Record<string, any>);

const translatedCities = require('../assets/locales/translatedCities.json');

const ExYuMapScreen = () => {
    const [countryGeo, setCountryGeo] = useState<any>(null);
    const [regionGeo, setRegionGeo] = useState<any>(null);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const mapRef = useRef<MapView>(null);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const [mapRenderKey, setMapRenderKey] = useState(Date.now());
    const [loadingMap, setLoadingMap] = useState(false);

    useEffect(() => {
        try {
            const data = require('../assets/geojson/ex-yu-countries.json');
            if (data?.features?.length) {
                console.log('🌍 Loaded ex-yu-countries.json with', data.features.length, 'features');
                setCountryGeo(data);
            } else {
                console.warn('⚠️ ex-yu-countries.json is empty or invalid');
            }
        } catch (err) {
            console.error('❌ Failed to load ex-yu-countries.json', err);
        }
    }, []);

    const extractPolygonCoordinates = (geometry: any): LatLng[] => {
        const polygons =
            geometry?.type === 'Polygon'
                ? [geometry.coordinates[0]]
                : geometry?.type === 'MultiPolygon'
                    ? geometry.coordinates.flat()
                    : [];

        return polygons
            .flat()
            .filter((coord: any) => Array.isArray(coord) && coord.length === 2)
            .map(([lng, lat]: number[]) => ({ latitude: lat, longitude: lng }));
    };

    const [renderKey, setRenderKey] = useState(Date.now());

    const onCountryPress = (feature: any) => {
        const name = feature.properties?.name_sort ?? feature.properties?.admin;
        if (!name) return;

        const safeKey = name.toLowerCase();
        const region = REGION_DATA_KEYS[safeKey];

        if (!region || !Array.isArray(region?.features)) {
            console.warn('❌ Region data not found or invalid for', name);
            return;
        }

        setLoadingMap(true);
        setRegionGeo(null);
        setSelectedCountry(null);

        setTimeout(() => {
            const cloned = JSON.parse(JSON.stringify(region));
            setRegionGeo(cloned);
            setSelectedCountry(name);
            setRenderKey(Date.now());
            setMapRenderKey(Date.now());
            setLoadingMap(false);
        }, 150);

        const coords = extractPolygonCoordinates(feature.geometry);
        if (coords.length && mapRef.current) {
            setTimeout(() => {
                try {
                    mapRef.current?.fitToCoordinates(coords, {
                        edgePadding: { top: 50, bottom: 50, left: 50, right: 50 },
                        animated: true,
                    });
                } catch (e) {
                    console.warn('⚠️ Error in fitToCoordinates:', e);
                }
            }, 300);
        }
    };

    const onRegionPress = (feature: any) => {
        const regionName = feature?.properties?.NAME_1;
        const countryName = selectedCountry;
        if (!regionName || !countryName) return;

        const iso = COUNTRY_CODES[countryName as keyof typeof COUNTRY_CODES];
        const normalize = (s: string) =>
            s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        const entry = translatedCities.find(
            (c: any) =>
                c.countryCode === iso &&
                (normalize(c.name).includes(normalize(regionName)) ||
                    normalize(regionName).includes(normalize(c.name)))
        );

        const city = entry?.translations?.en || regionName;
        const metro = entry?.metro || null;

        console.log('🚀 Navigating to Restaurants with', { city, country: countryName, metro });

        navigation.navigate('Restaurants', {
            city,
            country: countryName,
            ...(metro ? { metro } : {}),
        });
    };

    const resetToCountries = () => {
        console.log('🔙 Resetting to countries');
        setRegionGeo(null);
        setTimeout(() => {
            setSelectedCountry(null);
        }, 100);

        if (mapRef.current) {
            mapRef.current.animateToRegion(
                {
                    latitude: 43.8,
                    longitude: 18.2,
                    latitudeDelta: 9,
                    longitudeDelta: 10,
                },
                500
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    {regionGeo ? t("map.choosePlace") : t("map.chooseCountry")}
                </Text>
            </View>
            {!countryGeo || loadingMap ? (
                <Loading />
            ) : (
                <>
                    <MapView
                        key={`map-${mapRenderKey}`}
                        ref={mapRef}
                        style={StyleSheet.absoluteFill}
                        provider={PROVIDER_GOOGLE}
                        initialRegion={{
                            latitude: 43.8,
                            longitude: 18.2,
                            latitudeDelta: 9,
                            longitudeDelta: 10,
                        }}
                        minZoomLevel={4}
                    >
                        {regionGeo ? (
                            <GeojsonLayer
                                key={`region-${renderKey}`}
                                geojson={regionGeo}
                                onPress={onRegionPress}
                            />
                        ) : (
                            <GeojsonLayer
                                key="countries"
                                geojson={countryGeo}
                                onPress={onCountryPress}
                                selected={selectedCountry ?? undefined}
                            />
                        )}
                    </MapView>

                    {regionGeo && (
                        <Button
                            variant="red"
                            onPress={resetToCountries}
                            style={styles.backButton}
                        >
                            {t("buttons.backToCountries")}
                        </Button>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    backButton: {
        position: 'absolute',
        bottom: 30,
        left: '50%',
        transform: [{ translateX: -100 }],
        width: 200,
        paddingVertical: 10,
        alignItems: 'center',
        elevation: 5,
    },
    header: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 100,
        backgroundColor: '#BA3B46',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    headerText: {
        top: 20,
        fontSize: 22,
        fontFamily: 'CormorantSC-Bold',
        color: Colors.white,
    },
});

export default ExYuMapScreen;