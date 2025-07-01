import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import "../styles/RestaurantSelector.css";
import SearchBar from "./SearchBar";
import RestaurantCard from "./RestaurantCard";
import Button from "./Button";
import { useTranslation } from "react-i18next";

const RestaurantSelector = ({ restaurants = [], selectedRestaurant, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const { t } = useTranslation();

    const filteredRestaurants = useMemo(() => {
        return restaurants.filter(r =>
            r.Name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [restaurants, searchTerm]);

    if (selectedRestaurant) {
        return (
            <motion.div
                className="selected-restaurant-container"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <RestaurantCard
                    restaurant={selectedRestaurant}
                    onToggleFavorite={() => { }}
                    isFavorite={false}
                />

                <Button
                    variant="red-small"
                    onClick={() => onSelect(null)}
                    style={{ marginTop: "1rem" }}
                >
                    {t("buttons.changeSelection")}
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="restaurant-selector">
            <div className="search-bar-wrapper">
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={t("placeholders.searchRestaurants")}
                />
            </div>

            <div className="restaurant-list">
                {filteredRestaurants.slice(0, 10).map(r => (
                    <div
                        key={r.RestaurantId}
                        className="restaurant-list-item"
                        onClick={() => onSelect(r)}
                    >
                        <img src={r.images?.[0]?.Url || "/placeholder.jpg"} alt={r.Name} />
                        <div>
                            <h4>{r.Name}</h4>
                            <p>
                                {r.address?.City}, {r.address?.Country}
                            </p>
                        </div>
                    </div>
                ))}
                {filteredRestaurants.length === 0 && (
                    <p style={{ opacity: 0.7, fontStyle: "italic", color: "white" }}>
                        {t("noResults")}
                    </p>
                )}
            </div>
        </div>
    );
};

export default RestaurantSelector;