import React from 'react';
import { Polygon } from 'react-native-maps';
import Colors from '@/constants/Colors';

type Props = {
    geojson: any;
    onPress?: (feature: any) => void;
    color?: string;
    selected?: string;
};

const getCoordinates = (geometry: any): number[][][] => {
    if (!geometry || !geometry.coordinates) return [];

    if (geometry.type === 'Polygon') return [geometry.coordinates[0]];
    if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat();

    return [];
};

const GeojsonLayer = ({ geojson, onPress, color = Colors.black, selected }: Props) => {
    if (!geojson || !Array.isArray(geojson.features)) {
        console.warn("❌ No geojson features found");
        return null;
    }

    return geojson.features.map((feature: any, index: number) => {
        const coords = getCoordinates(feature.geometry);

        if (!coords.length) return null;

        const parsedPolygons = coords
            .filter(pair => Array.isArray(pair))
            .map(pair =>
                pair
                    .filter(coord => Array.isArray(coord) && coord.length === 2)
                    .map(([lng, lat]) => ({ latitude: lat, longitude: lng }))
            )
            .filter(polygon => polygon.length > 2);

        if (parsedPolygons.length === 0) {
            console.warn("⚠️ No valid polygons after parsing", feature);
            return null;
        }

        const isSelected =
            selected === feature.properties?.NAME_1 ||
            selected === feature.properties?.ADMIN ||
            selected === feature.properties?.admin;

        return parsedPolygons.map((polygon, idx) => (
            <Polygon
                key={`${index}-${idx}`}
                coordinates={polygon}
                strokeColor={color}
                fillColor={isSelected ? Colors.red : 'rgba(255, 91, 65, 0.4)'}
                strokeWidth={2}
                tappable
                onPress={() => onPress?.(feature)}
            />
        ));
    });
};

export default GeojsonLayer;