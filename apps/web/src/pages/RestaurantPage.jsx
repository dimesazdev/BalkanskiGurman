import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../components/Button";
import InfoCard from "../components/InfoCard";
import LocationCard from "../components/LocationCard";
import WorkingHoursCard from "../components/WorkingHoursCard";
import Popup from "../components/Popup";
import { getAmenityIcon } from "../utils/getAmenityIcon";
import ReviewCard from "../components/ReviewCard";
import Icon from "@mdi/react";
import ImageGallery from "../components/ImageGallery";
import {
  mdiArrowLeft,
  mdiCheckCircle,
  mdiPhone,
  mdiWeb,
  mdiSilverwareForkKnife,
  mdiCashMultiple,
  mdiFileDocument,
  mdiStar,
  mdiStarHalfFull,
  mdiStarOutline,
  mdiHeart,
  mdiHeartOutline,
  mdiMagnify
} from "@mdi/js";
import "../styles/RestaurantPage.css";
import { useAuth } from "../context/AuthContext";
import Title from "../components/Title";
import { useAzureTranslation } from '../hooks/useAzureTranslation';
import TranslatedReviewCard from "../components/TranslatedReviewCard";
import dayjs from "dayjs";
import { getOpenCloseStatus, getNextOpeningTime } from "../utils/openingHoursUtils";

function RestaurantPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [popup, setPopup] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState("rating");

  const allAmenityCodes = [
    "DELIV", "PARK", "PET", "CARD", "KIDS",
    "SMOK", "VEGAN", "VEGE", "GLUT", "HALAL"
  ];

  const now = dayjs();
  const todayDayOfWeek = now.day() === 0 ? 7 : now.day();
  const todayHours = restaurant?.workingHours?.find(h => h.DayOfWeek === todayDayOfWeek);

  const { isOpen, closeFormatted: openUntil } = todayHours
    ? getOpenCloseStatus(todayHours, now, t)
    : { isOpen: false, closeFormatted: null };

  const getNextOpenTime = () =>
    getNextOpeningTime(restaurant?.workingHours, todayDayOfWeek, getDayName, t);

  useEffect(() => {
    fetch(`http://localhost:3001/restaurants/${id}`)
      .then(res => res.json())
      .then(data => setRestaurant(data))
      .catch(console.error);

    fetch(`http://localhost:3001/restaurants/${id}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(console.error);

    if (user) {
      fetch("http://localhost:3001/favorites", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const favoriteIds = data.map((fav) => fav.RestaurantId);
          setIsFavorite(favoriteIds.includes(Number(id)));
        })
        .catch(console.error);
    }
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      setPopup({ message: t("alerts.loginRequired"), variant: "error" });
      setTimeout(() => setPopup(null), 3000);
      return;
    }

    if (isFavorite) {
      await fetch(`http://localhost:3001/favorites/by-restaurant/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setIsFavorite(false);
      setPopup({ message: t("alerts.favoriteRemoved"), variant: "success" });
    } else {
      await fetch("http://localhost:3001/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ RestaurantId: Number(id) }),
      });
      setIsFavorite(true);
      setPopup({ message: t("alerts.favoriteAdded"), variant: "success" });
    }
  };

  const getDayName = (dayNum) => {
    const dayMap = {
      1: t("days.mon"),
      2: t("days.tue"),
      3: t("days.wed"),
      4: t("days.thu"),
      5: t("days.fri"),
      6: t("days.sat"),
      7: t("days.sun"),
    };
    return dayMap[dayNum];
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getPriceLabel = (priceRange) => {
    switch (priceRange) {
      case 1: return "5–10€";
      case 2: return "10–20€";
      case 3: return "20€+";
      default: return "-";
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={`full-${i}`} path={mdiStar} size={0.9} color="var(--red)" />);
    }
    if (halfStar) {
      stars.push(<Icon key="half" path={mdiStarHalfFull} size={0.9} color="var(--red)" />);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Icon key={`empty-${i}`} path={mdiStarOutline} size={0.9} color="var(--red)" />);
    }
    return stars;
  };

  const { translatedText: translatedDetailsText } = useAzureTranslation(restaurant?.Details ?? "");

  if (!restaurant) return <div>Loading...</div>;

  const getSortedReviews = () => {
    const filtered = reviews.filter(r =>
      r.Comment.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortOption) {
      case "highestRating":
        return filtered.sort((a, b) => b.Rating - a.Rating);
      case "lowestRating":
        return filtered.sort((a, b) => a.Rating - b.Rating);
      case "latest":
        return filtered.sort(
          (a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)
        );
      default:
        return filtered;
    }
  };

  return (
    <div className="restaurant-page">
      <div className="go-back" onClick={() => navigate(-1)}>
        <Icon path={mdiArrowLeft} size={1} color="var(--beige)" /> {t("buttons.goBack")}
      </div>

      <div className="restaurant-header">
        <div className="restaurant-header-left">
          <h1 className="restaurant-title">{restaurant.Name}</h1>
          {restaurant.IsClaimed && (
            <Icon path={mdiCheckCircle} size={1} color="#08FF00" title="Claimed" />
          )}
          <div className="restaurant-rating-stars">
            {renderStars(restaurant.AverageRating)}
            <span className="restaurant-rating-value">
              {restaurant.AverageRating.toFixed(2)} ({t("labels.reviewCount", { count: restaurant.reviews?.length || 0 })})
            </span>
          </div>
        </div>

        <Button variant={isFavorite ? "red" : "beige-outline"} onClick={handleToggleFavorite}>
          <Icon path={isFavorite ? mdiHeart : mdiHeartOutline} size={0.9} />{" "}
          {isFavorite ? t("buttons.removeFromFavorites") : t("buttons.addToFavorites")}
        </Button>
      </div>

      <div className="restaurant-subinfo">
        {todayHours && !todayHours.IsClosed && isOpen ? (
          <span className="open">{t("labels.openUntil")} {openUntil}</span>
        ) : (
          <span className="closed">{t("labels.closed")} · {getNextOpenTime()}</span>
        )}
        <span className="dot">•</span>
        <span>{getPriceLabel(restaurant.PriceRange)}</span>
        <span className="dot">•</span>
        <span>
          {restaurant.cuisines?.map((rc) => t(`cuisines.${rc.cuisine.Code}`)).join(", ")}
        </span>
      </div>

      <ImageGallery images={restaurant.images} />

      <Title>{t("restaurant.details")}</Title>
      <p className="restaurant-details">{translatedDetailsText}</p>

      <div className="info-cards">
        <InfoCard
          icon={mdiCashMultiple}
          label={t("restaurant.price")}
          value={`${getPriceLabel(restaurant.PriceRange)} ${t("labels.perPerson")}`}
        />

        <InfoCard
          icon={mdiSilverwareForkKnife}
          label={t("restaurant.cuisines")}
          value={
            <span>
              {restaurant.cuisines?.map((rc) => t(`cuisines.${rc.cuisine.Code}`)).join(", ")}
            </span>
          }
        />

        <a
          href={restaurant.PhoneNumber ? `tel:${restaurant.PhoneNumber}` : undefined}
          target={restaurant.PhoneNumber ? "_self" : undefined}
          rel="noreferrer"
          style={{ textDecoration: "none", pointerEvents: restaurant.PhoneNumber ? "auto" : "none" }}
        >
          <InfoCard
            icon={mdiPhone}
            label={t("restaurant.phone")}
            value={restaurant.PhoneNumber ? restaurant.PhoneNumber : t("labels.notAvailable")}
            style={{
              opacity: restaurant.PhoneNumber ? 1 : 0.5,
              cursor: restaurant.PhoneNumber ? "pointer" : "default"
            }}
          />
        </a>

        <a
          href={restaurant.Website ? restaurant.Website : undefined}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "none", pointerEvents: restaurant.Website ? "auto" : "none" }}
        >
          <InfoCard
            icon={mdiWeb}
            label={t("restaurant.website")}
            value={restaurant.Website ? restaurant.Website : t("labels.notAvailable")}
            style={{
              opacity: restaurant.Website ? 1 : 0.5,
              cursor: restaurant.Website ? "pointer" : "default"
            }}
          />
        </a>

        <a
          href={restaurant.MenuUrl ? restaurant.MenuUrl : undefined}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "none", pointerEvents: restaurant.MenuUrl ? "auto" : "none" }}
        >
          <InfoCard
            icon={mdiFileDocument}
            label={t("restaurant.menu")}
            value={restaurant.MenuUrl ? t("labels.clickToView") : t("labels.notAvailable")}
            style={{
              opacity: restaurant.MenuUrl ? 1 : 0.5,
              cursor: restaurant.MenuUrl ? "pointer" : "default"
            }}
          />
        </a>
      </div>

      <Title>{t("restaurant.locationHours")}</Title>
      <div className="location-hours-grid">
        <LocationCard
          address={restaurant.address}
          label={t("restaurant.location")}
          buttonText={t("restaurant.goToLocation")}
        />
        <WorkingHoursCard
          hours={[...restaurant.workingHours].sort((a, b) => a.DayOfWeek - b.DayOfWeek)}
          getDayName={getDayName}
          label={t("restaurant.workingHours")}
          buttonText={t("restaurant.suggestEdit")}
        />
      </div>

      <Title>{t("restaurant.amenities")}</Title>
      <div className="restaurant-amenities">
        {allAmenityCodes.map((code) => {
          const amenity = restaurant.amenities?.find((a) => a.amenity.Code === code);
          return (
            <InfoCard
              key={code}
              icon={getAmenityIcon(code)}
              label={t(`amenities.${code}`)}
              value={amenity ? t("labels.available") : t("labels.notAvailable")}
              style={{ opacity: amenity ? 1 : 0.5, minWidth: "160px" }}
            />
          );
        })}
      </div>

      <Title>{t("restaurant.reviews")}</Title>

      <div className="settings-bar">
        {/* Sort Control */}
        <div className="sort-group">
          <label className="sort-label">{t("sort.label")}</label>
          <div
            className={`sort-select ${showSortDropdown ? "open" : ""}`}
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            {t(`sort.${sortOption}`)} {showSortDropdown ? "▾" : "▸"}
            {showSortDropdown && (
              <ul className="sort-dropdown">
                <li onClick={() => setSortOption("highestRating")}>{t("sort.highestRating")}</li>
                <li onClick={() => setSortOption("lowestRating")}>{t("sort.lowestRating")}</li>
                <li onClick={() => setSortOption("latest")}>{t("sort.latest")}</li>
              </ul>
            )}
          </div>
        </div>

        {/* Write Review Button */}
        <Button variant="red" onClick={() => navigate(`/restaurants/${id}/reviews`)}>
          {t("buttons.writeReview")}
        </Button>

        {/* Search Bar */}
        <div className="search-group">
          <div className="search-bar">
            <input
              type="text"
              placeholder={t("labels.searchByKeyword")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">
              <Icon path={mdiMagnify} size={1} color="#2f2f2f" />
            </button>
          </div>
        </div>
      </div>

      {getSortedReviews().length === 0 ? (
        <p style={{ color: "var(--beige)" }}>
          {reviews.length === 0
            ? t("restaurant.noReviews")
            : t("restaurant.noSearchResults")}
        </p>
      ) : (
        <div className="reviews-columns">
          <div className="reviews-column">
            {getSortedReviews()
              .filter((_, i) => i % 2 === 0)
              .map((r) => (
                <TranslatedReviewCard key={r.ReviewId} review={r} />
              ))}
          </div>
          <div className="reviews-column">
            {getSortedReviews()
              .filter((_, i) => i % 2 !== 0)
              .map((r) => (
                <TranslatedReviewCard key={r.ReviewId} review={r} />
              ))}
          </div>
        </div>
      )}

      {popup && (
        <Popup
          message={popup.message}
          variant={popup.variant}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}

export default RestaurantPage;