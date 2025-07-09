import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import "../styles/ExYuMap.css";

window.translatedCities = translatedCities;
window.__usedCityKeys = new Set();

import translatedCountries from "../../public/translatedCountries.json";
import translatedCities from "../../public/translatedCities.json";

const REGION_FILES = {
    "Macedonia": "macedonia-regions.geojson",
    "Serbia": "serbia-regions.geojson",
    "Croatia": "croatia-regions.geojson",
    "Slovenia": "slovenia-regions.geojson",
    "Bosnia and Herzegovina": "bosnia-regions.geojson",
    "Montenegro": "montenegro-regions.geojson"
};

const COUNTRY_CODES = {
    "Macedonia": "MK",
    "Serbia": "RS",
    "Croatia": "HR",
    "Slovenia": "SI",
    "Bosnia and Herzegovina": "BA",
    "Montenegro": "ME"
};

const FlyToBounds = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.flyToBounds(bounds, {
                padding: [50, 50],
                duration: 1.5
            });
        }
    }, [bounds, map]);
    return null;
};

const ResetView = ({ visible, onReset }) => {
    const { t } = useTranslation();
    const map = useMap();
    if (!visible) return null;
    return (
        <div
            style={{
                position: "absolute",
                top: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000
            }}
        >
            <Button
                variant="red"
                onClick={() => {
                    map.setView([43.5, 20.5], 6);
                    onReset();
                }}
            >
                {t("buttons.backToCountries")}
            </Button>
        </div>
    );
};

function getCountryTranslation(name, lang) {
    const match = translatedCountries.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    return match?.translations?.[lang] || name;
}

function getCityTranslation(name, countryCode, lang) {
    const normalize = (s) =>
        s
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const match = translatedCities.find(
        (c) =>
            normalize(c.name) === normalize(name) &&
            c.countryCode.toUpperCase() === countryCode.toUpperCase()
    );

    const result = match?.translations?.[lang];

    if (result !== undefined) {
        window.__usedCityKeys.add(`${match.countryCode}|${match.name}`);
    } else {
        console.log(
            "⚠️ getCityTranslation MISSING:",
            name,
            "| country:",
            countryCode,
            "| lang:",
            lang,
            "| fallback to original name"
        );
    }

    return result || name;
}

const ExYuMap = ({ onCountrySelect }) => {
    const { i18n } = useTranslation();
    const [geoData, setGeoData] = useState(null);
    const [regionGeoData, setRegionGeoData] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedBounds, setSelectedBounds] = useState(null);
    const [activeCountry, setActiveCountry] = useState(null);
    const [activeRegion, setActiveRegion] = useState(null);

    useEffect(() => {
        fetch("/ex-yu-countries.geojson")
            .then((res) => res.json())
            .then(setGeoData)
            .catch(console.error);
    }, []);

    const onEachCountry = (feature, layer) => {
        const countryName =
            feature.properties.ADMIN ||
            feature.properties.NAME ||
            feature.properties.name ||
            "Unknown";

        const translated = getCountryTranslation(countryName, i18n.language);

        layer.on({
            click: async () => {
                const bounds = layer.getBounds();
                setSelectedBounds(bounds);
                setActiveCountry(countryName);
                setSelectedCountry(countryName);
                onCountrySelect?.({ feature, name: countryName });

                const filename = REGION_FILES[countryName];
                if (filename) {
                    try {
                        const res = await fetch(`/geojson/${filename}`);
                        const data = await res.json();
                        setRegionGeoData(data);
                    } catch (err) {
                        console.error(`Error loading ${filename}:`, err);
                    }
                }
            },
            mouseover: () => {
                layer.setStyle({ fillOpacity: 0.7, weight: 2 });
            },
            mouseout: () => {
                layer.setStyle({ fillOpacity: 0.4, weight: 1 });
            }
        });

        layer.bindTooltip(translated, { sticky: true });
    };

    const onEachRegion = (feature, layer) => {
        const field = "NAME_1";
        const regionName = feature.properties[field] || "Unknown";

        const iso = COUNTRY_CODES[selectedCountry] || "MK";

        const translatedRegion = getCityTranslation(regionName, iso, i18n.language);

        const cityEntry = translatedCities.find(
            (c) =>
                c.countryCode === iso &&
                c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
                regionName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        );

        const metroRaw = cityEntry?.metro || null;
        const translatedMetro =
            cityEntry?.metroTranslations?.[i18n.language] || metroRaw;

        layer.on({
            click: () => {
                const cityEn = cityEntry?.translations?.en || regionName;
                const metroEn = cityEntry?.metro || "";

                const url = `/restaurants?city=${encodeURIComponent(cityEn)}&country=${encodeURIComponent(selectedCountry)}${metroEn ? `&metro=${encodeURIComponent(metroEn)}` : ""
                    }`;
                window.location.href = url;
            },
            mouseover: () => {
                setActiveRegion(regionName);
                layer.setStyle({ fillOpacity: 0.7, weight: 2 });
            },
            mouseout: () => {
                setActiveRegion(null);
                layer.setStyle({ fillOpacity: 0.4, weight: 1 });
            }
        });

        layer.bindTooltip(
            metroRaw
                ? `${translatedMetro} (${translatedRegion})`
                : translatedRegion,
            { sticky: true }
        );
    };

    return (
        <MapContainer
            center={[43.5, 20.5]}
            zoom={6}
            style={{ height: "600px", width: "100%" }}
            scrollWheelZoom={true}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />

            {!regionGeoData && geoData && (
                <GeoJSON
                    key={i18n.language}
                    data={geoData}
                    style={(feature) => {
                        const countryName =
                            feature.properties.ADMIN ||
                            feature.properties.NAME ||
                            feature.properties.name ||
                            "Unknown";
                        return {
                            fillColor: "#BA3B46",
                            fillOpacity: countryName === activeCountry ? 1 : 0.4,
                            color: "#BA3B46",
                            weight: countryName === activeCountry ? 2 : 1
                        };
                    }}
                    onEachFeature={onEachCountry}
                />
            )}

            {regionGeoData && (
                <GeoJSON
                    key={`${selectedCountry}-${i18n.language}`}
                    data={regionGeoData}
                    style={(feature) => {
                        const field = "NAME_1";
                        const regionName = feature.properties[field] || "Unknown";
                        return {
                            fillColor: "#BA3B46",
                            fillOpacity: regionName === activeRegion ? 1 : 0.4,
                            color: "#BA3B46",
                            weight: regionName === activeRegion ? 2 : 1
                        };
                    }}
                    onEachFeature={onEachRegion}
                />
            )}

            {selectedBounds && <FlyToBounds bounds={selectedBounds} />}

            <ResetView
                visible={regionGeoData}
                onReset={() => {
                    setRegionGeoData(null);
                    setSelectedCountry(null);
                    setSelectedBounds(null);
                    setActiveCountry(null);
                }}
            />
        </MapContainer>
    );
};

export default ExYuMap;