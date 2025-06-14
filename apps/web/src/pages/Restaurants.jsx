import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import RestaurantCard from "../components/RestaurantCard";
import FilterSidebar from "../components/FilterSidebar";
import Popup from "../components/Popup";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import "../styles/Restaurants.css";
import "../styles/General.css";

function Restaurants() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [popup, setPopup] = useState(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [sortOption, setSortOption] = useState("rating");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/restaurants")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRestaurants(data);
        else if (Array.isArray(data.restaurants)) setRestaurants(data.restaurants);
      });

    if (user) {
      fetch("http://localhost:3001/favorites", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then(res => res.json())
        .then(data => setFavorites(data.map(fav => fav.RestaurantId)))
        .catch(console.error);
    }
  }, [user]);

  const showPopup = (message, variant = "error") => {
    setPopup({ message, variant });
    setTimeout(() => setPopup(null), 3000);
  };

  const toggleFavorite = async (restaurantId) => {
    if (!user) {
      setShowLoginAlert(true);
      return;
    }

    const isFav = favorites.includes(restaurantId);
    try {
      if (isFav) {
        await fetch(`http://localhost:3001/favorites/by-restaurant/${restaurantId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setFavorites(prev => prev.filter(id => id !== restaurantId));
        showPopup(t("alerts.favoriteRemoved"), "success");
      } else {
        await fetch("http://localhost:3001/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ RestaurantId: restaurantId }),
        });
        setFavorites(prev => [...prev, restaurantId]);
        showPopup(t("alerts.favoriteAdded"), "success");
      }
    } catch (err) {
      showPopup(t("alerts.favoriteError"), "error");
    }
  };

  return (
    <div className="restaurants">
      {popup && (
        <Popup
          message={popup.message}
          variant={popup.variant}
          onClose={() => setPopup(null)}
        />
      )}

      {showLoginAlert && (
        <Alert
          message={t("alerts.loginRequired")}
          buttonText={t("navbar.login")}
          onButtonClick={() => navigate("/auth/login")}
          onClose={() => setShowLoginAlert(false)}
        />
      )}

      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <FilterSidebar />
      </motion.div>

      <motion.div
        className="restaurants-right"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="settings-bar">
          <div className="search-bar">
            <input placeholder={t("search")} />
            <button type="submit">
              <i className="fa fa-search" />
            </button>
          </div>
          <div className="sort-bar">
            <label>{t("sort.label")}</label>
            <div
              className={`sort-select ${showSortDropdown ? "open" : ""}`}
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              {t(`sort.${sortOption}`)} {showSortDropdown ? "▾" : "▸"}
              {showSortDropdown && (
                <ul className="sort-dropdown">
                  <li onClick={() => setSortOption("rating")}>
                    {t("sort.rating")}
                  </li>
                  <li onClick={() => setSortOption("priceLow")}>
                    {t("sort.priceLow")}
                  </li>
                  <li onClick={() => setSortOption("priceHigh")}>
                    {t("sort.priceHigh")}
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="restaurant-cards">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.RestaurantId}
              restaurant={restaurant}
              isFavorite={favorites.includes(restaurant.RestaurantId)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Restaurants;