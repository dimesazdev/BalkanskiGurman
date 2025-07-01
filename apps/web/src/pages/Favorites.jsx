import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import RestaurantCard from "../components/RestaurantCard";
import FilterSidebar from "../components/FilterSidebar";
import Popup from "../components/Popup";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import "../styles/Restaurants.css";
import "../styles/General.css";
import SortBar from "../components/SortBar";
import SearchBar from "../components/SearchBar";

const FadeIn = ({ children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

function Favorites() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rawFavorites, setRawFavorites] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({
    price: [],
    rating: [],
    cuisines: [],
    amenities: [],
    hours: [],
  });
  const [popup, setPopup] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [sortOption, setSortOption] = useState("rating");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1070);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 1070);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      fetch("http://localhost:3001/favorites", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
        .then(res => res.json())
        .then(data => {
          setRawFavorites(data);
          setFavorites(data.map(fav => fav.RestaurantId));
          setLoading(false);
        })
        .catch(console.error);
    } else {
      setLoading(false);
    }
  }, [user]);

  const showPopup = (message, variant = "error") => {
    setPopup({ message, variant });
    setTimeout(() => setPopup(null), 3000);
  };

  const toggleFavorite = (restaurantId) => {
    setConfirmDeleteId(restaurantId);
  };

  const confirmDelete = async () => {
    try {
      await fetch(`http://localhost:3001/favorites/by-restaurant/${confirmDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFavorites(prev => prev.filter(id => id !== confirmDeleteId));
      setRawFavorites(prev => prev.filter(f => f.RestaurantId !== confirmDeleteId && f.restaurant.RestaurantId !== confirmDeleteId));
      showPopup(t("alerts.favoriteRemoved"), "success");
    } catch {
      showPopup(t("alerts.favoriteError"), "error");
    }
    setConfirmDeleteId(null);
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

  const filteredRestaurants = rawFavorites
    .map(fav => {
      const r = fav.restaurant;
      return {
        ...r,
        cuisines: r.cuisines?.map(c => c.cuisine) ?? [],
        amenities: r.amenities?.map(a => a.amenity) ?? [],
      };
    })
    .filter(r => r.Name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(r => {
      if (filters.price.length && !filters.price.includes(r.PriceRange)) return false;
      if (filters.rating.length && r.AverageRating < Math.min(...filters.rating)) return false;

      if (filters.cuisines.length) {
        const cuisineCodes = r.cuisines.map(c => c.Code);
        if (!filters.cuisines.some(code => cuisineCodes.includes(code))) return false;
      }

      if (filters.amenities.length) {
        const amenityCodes = r.amenities.map(a => a.Code);
        if (!filters.amenities.every(code => amenityCodes.includes(code))) return false;
      }

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

      {confirmDeleteId && (
        <Alert
          message={t("alerts.removeFavoriteConfirm")}
          buttonText={t("buttons.confirm")}
          onButtonClick={confirmDelete}
          onClose={() => setConfirmDeleteId(null)}
        />
      )}

      {!loading && favorites.length === 0 && (
        <Alert
          message={t("alerts.noFavorites")}
          buttonText={t("buttons.backToRestaurants")}
          onButtonClick={() => navigate("/restaurants")}
          showCancel={false}
        />
      )}

      {!isMobileView && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <FilterSidebar filters={filters} onChange={setFilters} />
        </motion.div>
      )}

      <motion.div
        className="restaurants-right"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="settings-bar">
          <SearchBar
            placeholder={t("labels.searchByKeyword")}
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <SortBar
            label={t("sort.label")}
            sortOptions={["rating", "priceLow", "priceHigh"]}
            selected={sortOption}
            onSelect={setSortOption}
            t={t}
          />
          {isMobileView && (
            <FilterSidebar filters={filters} onChange={setFilters} />
          )}
        </div>

        <div className="restaurant-cards">
          {filteredRestaurants.map((restaurant) => (
            <FadeIn key={restaurant.RestaurantId}>
              <RestaurantCard
                restaurant={restaurant}
                isFavorite={favorites.includes(restaurant.RestaurantId)}
                onToggleFavorite={toggleFavorite}
                searchTerm={searchTerm}
              />
            </FadeIn>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Favorites;