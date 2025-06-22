import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import RestaurantCard from "../../components/RestaurantCard";
import FilterSidebar from "../../components/FilterSidebar";
import Popup from "../../components/Popup";
import Alert from "../../components/Alert";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "@mdi/react";
import { mdiMagnify, mdiPencil, mdiDelete } from "@mdi/js";
import "../../styles/Restaurants.css";
import "../../styles/General.css";

const AdminRestaurants = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [restaurants, setRestaurants] = useState([]);
    const [filters, setFilters] = useState({
        price: [],
        rating: [],
        cuisines: [],
        amenities: [],
        hours: [],
    });
    const [popup, setPopup] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("rating");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showChoice, setShowChoice] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3001/restaurants")
            .then(res => res.json())
            .then(setRestaurants);
    }, []);

    const showPopup = (message, variant = "success") => {
        setPopup({ message, variant });
    };

    const isOpenNow = (workingHours) => {
        const now = new Date();
        const dbDay = ((now.getDay() + 6) % 7) + 1;
        const entry = workingHours?.find(w => w.DayOfWeek === dbDay);
        if (!entry || entry.IsClosed) return false;

        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const open = (entry.OpenHour ?? 0) * 60 + (entry.OpenMinute ?? 0);
        const close = (entry.CloseHour ?? 0) * 60 + (entry.CloseMinute ?? 0);

        return close > open
            ? nowMinutes >= open && nowMinutes < close
            : nowMinutes >= open || nowMinutes < close;
    };

    const isOpenAfterMidnight = (workingHours) => {
        const now = new Date();
        const dbDay = ((now.getDay() + 6) % 7) + 1;
        const entry = workingHours?.find(w => w.DayOfWeek === dbDay);
        if (!entry || entry.IsClosed) return false;
        const close = (entry.CloseHour ?? 0) * 60 + (entry.CloseMinute ?? 0);
        return close > 0 && close < 360;
    };

    const confirmDelete = async () => {
        try {
            await fetch(`http://localhost:3001/restaurants/${confirmDeleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setRestaurants(prev => prev.filter(r => r.RestaurantId !== confirmDeleteId));
            showPopup(t("alerts.deleted"), "success");
        } catch {
            showPopup(t("alerts.deleteError"), "error");
        } finally {
            setConfirmDeleteId(null);
        }
    };

    const filteredRestaurants = restaurants
        .filter(r => r.Name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(r => {
            if (filters.price.length && !filters.price.includes(r.PriceRange)) return false;
            if (filters.rating.length && r.AverageRating < Math.min(...filters.rating)) return false;

            const cuisineCodes = r.cuisines?.map(c => c.Code) ?? [];
            if (filters.cuisines.length && !filters.cuisines.some(code => cuisineCodes.includes(code))) return false;

            const amenityCodes = r.amenities?.map(a => a.Code) ?? [];
            if (filters.amenities.length && !filters.amenities.every(code => amenityCodes.includes(code))) return false;

            if (filters.hours.includes("openNow") && !isOpenNow(r.workingHours)) return false;
            if (filters.hours.includes("afterMidnight") && !isOpenAfterMidnight(r.workingHours)) return false;

            return true;
        })
        .sort((a, b) => {
            if (sortOption === "priceLow") return a.PriceRange - b.PriceRange;
            if (sortOption === "priceHigh") return b.PriceRange - a.PriceRange;
            return b.AverageRating - a.AverageRating;
        });

    return (
        <div className="restaurants">
            {popup && <Popup message={popup.message} variant={popup.variant} onClose={() => setPopup(null)} />}

            {showChoice && (
                <Alert
                    message={t("admin.chooseRestaurantAction")}
                    buttonText={t("admin.addRestaurant")}
                    cancelText={t("admin.manageExisting")}
                    onButtonClick={() => navigate("/admin/restaurants/add")}
                    onClose={() => setShowChoice(false)}
                />
            )}

            {confirmDeleteId && (
                <Alert
                    message={t("admin.confirmDelete")}
                    buttonText={t("buttons.confirm")}
                    cancelText={t("buttons.cancel")}
                    onButtonClick={confirmDelete}
                    onClose={() => setConfirmDeleteId(null)}
                />
            )}

            <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
                <FilterSidebar filters={filters} onChange={setFilters} />
            </motion.div>

            <motion.div className="restaurants-right" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
                <div className="settings-bar">
                    <div className="search-bar">
                        <input placeholder={t("labels.searchByKeyword")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <button><Icon path={mdiMagnify} size={1} color="#2f2f2f" /></button>
                    </div>
                    <div className="sort-bar">
                        <label>{t("sort.label")}</label>
                        <div className={`sort-select ${showSortDropdown ? "open" : ""}`} onClick={() => setShowSortDropdown(!showSortDropdown)}>
                            {t(`sort.${sortOption}`)} {showSortDropdown ? "▾" : "▸"}
                            {showSortDropdown && (
                                <ul className="sort-dropdown">
                                    <li onClick={() => setSortOption("rating")}>{t("sort.rating")}</li>
                                    <li onClick={() => setSortOption("priceLow")}>{t("sort.priceLow")}</li>
                                    <li onClick={() => setSortOption("priceHigh")}>{t("sort.priceHigh")}</li>
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="restaurant-cards">
                    {filteredRestaurants.length === 0 ? (
                        <p style={{ color: "var(--beige)", marginTop: "2rem", fontSize: "1.1rem" }}>{t("noResults")}</p>
                    ) : (
                        filteredRestaurants.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.RestaurantId}
                                restaurant={restaurant}
                                searchTerm={searchTerm}
                                adminActions={{
                                    onEdit: () => navigate(`/admin/restaurants/edit/${restaurant.RestaurantId}`),
                                    onDelete: () => setConfirmDeleteId(restaurant.RestaurantId)
                                }}
                            />
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AdminRestaurants;