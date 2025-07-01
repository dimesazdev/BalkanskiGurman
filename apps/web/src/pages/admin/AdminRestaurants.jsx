import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import RestaurantCard from "../../components/RestaurantCard";
import FilterSidebar from "../../components/FilterSidebar";
import Popup from "../../components/Popup";
import Alert from "../../components/Alert";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Restaurants.css";
import "../../styles/General.css";
import SortBar from "../../components/SortBar";
import SearchBar from "../../components/SearchBar";

const FadeInSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
};

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
  const [showChoice, setShowChoice] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1070);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 1070);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch("http://localhost:3001/restaurants")
      .then(res => res.json())
      .then(setRestaurants);
  }, []);

  const showPopupMessage = (message, variant = "success") => {
    setPopup({ message, variant });
  };

  const confirmDelete = async () => {
    try {
      await fetch(`http://localhost:3001/restaurants/${confirmDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRestaurants(prev => prev.filter(r => r.RestaurantId !== confirmDeleteId));
      showPopupMessage(t("alerts.deleted"), "success");
    } catch {
      showPopupMessage(t("alerts.deleteError"), "error");
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

      return true;
    })
    .sort((a, b) => {
      if (sortOption === "priceLow") return a.PriceRange - b.PriceRange;
      if (sortOption === "priceHigh") return b.PriceRange - a.PriceRange;
      return b.AverageRating - a.AverageRating;
    });

  return (
    <div className="restaurants">
      {popup && (
        <Popup
          message={popup.message}
          variant={popup.variant}
          onClose={() => setPopup(null)}
        />
      )}

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
          {filteredRestaurants.length === 0 ? (
            <p style={{ color: "var(--beige)", marginTop: "2rem", fontSize: "1.1rem" }}>
              {t("noResults")}
            </p>
          ) : (
            filteredRestaurants.map((r, index) => (
              <FadeInSection key={r.RestaurantId} delay={index * 0.05}>
                <RestaurantCard
                  restaurant={r}
                  searchTerm={searchTerm}
                  adminActions={{
                    onEdit: () => navigate(`/admin/restaurants/edit/${r.RestaurantId}`),
                    onDelete: () => setConfirmDeleteId(r.RestaurantId),
                  }}
                />
              </FadeInSection>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminRestaurants;