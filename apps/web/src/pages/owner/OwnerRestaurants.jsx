import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import RestaurantCard from "../../components/RestaurantCard";
import Popup from "../../components/Popup";
import { useAuth } from "../../context/AuthContext";
import Title from "../../components/Title";
import "../../styles/Restaurants.css";

function OwnerRestaurants() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [restaurants, setRestaurants] = useState([]);
    const [popup, setPopup] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://localhost:3001/restaurants");
                const data = await res.json();
                const owned = data.filter(r => r.ClaimedByUserId === user?.id);
                setRestaurants(owned);
            } catch (err) {
                console.error("Failed to fetch restaurants:", err);
            }
        };
        fetchData();
    }, [user]);

    return (
        <motion.div
            className="admin-restaurants-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {popup && (
                <Popup
                    message={popup.message}
                    variant={popup.variant}
                    onClose={() => setPopup(null)}
                />
            )}

            <Title>{t("owner.myRestaurants")}</Title>

            <motion.div
                className="restaurants-grid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            >
                {restaurants.length === 0 ? (
                    <p style={{ color: "var(--beige)", fontSize: "1.1rem", textAlign: "center" }}>{t("noResults")}</p>
                ) : (
                    restaurants.map(r => (
                        <RestaurantCard
                            key={r.RestaurantId}
                            restaurant={r}
                            adminActions={{
                                onEdit: (id) => navigate(`/admin/restaurants/edit/${id}`),
                            }}
                        />
                    ))
                )}
            </motion.div>
        </motion.div>
    );
}

export default OwnerRestaurants;