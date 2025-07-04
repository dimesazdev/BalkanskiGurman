import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../components/Button";
import InfoCard from "../components/InfoCard";
import LocationCard from "../components/LocationCard";
import WorkingHoursCard from "../components/WorkingHoursCard";
import Popup from "../components/Popup";
import { getAmenityIcon } from "../utils/getAmenityIcon";
import Icon from "@mdi/react";
import ImageGallery from "../components/ImageGallery";
import {
  mdiArrowLeft, mdiCheckCircle, mdiPhone, mdiWeb, mdiSilverwareForkKnife,
  mdiCashMultiple, mdiFileDocument, mdiStar, mdiStarHalfFull, mdiStarOutline,
  mdiHeart, mdiHeartOutline
} from "@mdi/js";
import "../styles/RestaurantPage.css";
import { useAuth } from "../context/AuthContext";
import Title from "../components/Title";
import { useAzureTranslation } from '../hooks/useAzureTranslation';
import dayjs from "dayjs";
import { getOpenCloseStatus, getNextOpeningTime } from "../utils/openingHoursUtils";
import { motion, useInView } from "framer-motion";
import SortBar from "../components/SortBar";
import SearchBar from "../components/SearchBar";
import Alert from "../components/Alert";
import { Tooltip } from "react-tooltip";
import ReviewCard from "../components/ReviewCard";

const FadeInSection = ({ children, from = "bottom" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

  const variants = {
    hidden: {
      opacity: 0,
      y: from === "bottom" ? 50 : from === "top" ? -50 : 0,
      x: from === "left" ? -50 : from === "right" ? 50 : 0
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

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
  const [sortOption, setSortOption] = useState("rating");
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const now = dayjs();
  const todayDayOfWeek = now.day() === 0 ? 7 : now.day();
  const todayHours = restaurant?.workingHours?.find(h => h.DayOfWeek === todayDayOfWeek);
  const { isOpen, closeFormatted: openUntil } = todayHours
    ? getOpenCloseStatus(todayHours, now, t)
    : { isOpen: false, closeFormatted: null };
  const getNextOpenTime = () => getNextOpeningTime(restaurant?.workingHours, todayDayOfWeek, getDayName, t);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3001/restaurants/${id}`);
        const data = await res.json();
        setRestaurant(data);

        const revRes = await fetch(`http://localhost:3001/restaurants/${id}/reviews`);
        const revData = await revRes.json();
        setReviews(revData);

        if (user) {
          const favRes = await fetch("http://localhost:3001/favorites", {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          const favData = await favRes.json();
          const favoriteIds = favData.map((fav) => fav.RestaurantId);
          setIsFavorite(favoriteIds.includes(Number(id)));
        }
      } catch (err) {
        console.error("Failed to fetch restaurant data", err);
      }
    };

    fetchData();
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
        headers: { Authorization: `Bearer ${user.token}` },
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
  if (!restaurant) return <div>{t("alerts.notFound")}</div>;

  const filteredReviews = reviews
    .filter(r => r.StatusId === 5 || r.StatusId === 7)
    .filter(r => r.Comment.toLowerCase().includes(searchTerm.toLowerCase()));

  const approvedReviewsCount = reviews.filter(r => r.StatusId === 5 || r.StatusId === 7).length;

  const getSortedReviews = () => {
    switch (sortOption) {
      case "highestRating": return filteredReviews.sort((a, b) => b.Rating - a.Rating);
      case "lowestRating": return filteredReviews.sort((a, b) => a.Rating - b.Rating);
      case "latest": return filteredReviews.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
      default: return filteredReviews;
    }
  };

  const userStatus = user?.status?.toLowerCase();
  const OWNER_ROLE_ID = "34fuihi4-5vj8-3v4e-43v5-3jfismy876s5";

  let disabledReason = "";
  if (userStatus === "suspended") {
    disabledReason = t("alerts.suspendedAction");
  }
  if (userStatus === "banned") {
    disabledReason = t("alerts.bannedAction");
  }
  if (user?.role === OWNER_ROLE_ID) {
    disabledReason = t("alerts.ownerCannotReview");
  }

  return (
    <div className="restaurant-page">
      <div className="go-back" onClick={() => navigate(-1)}>
        <Icon path={mdiArrowLeft} size={1} color="var(--beige)" /> {t("buttons.goBack")}
      </div>

      <FadeInSection from="bottom">
        <div className="restaurant-header">
          <div className="restaurant-header-left">
            <h1 className="restaurant-title">{restaurant.Name}</h1>
            {restaurant.IsClaimed && (
              <Icon path={mdiCheckCircle} size={1} color="#3BBA3B" title="Claimed" />
            )}
            <div className="restaurant-rating-stars">
              {renderStars(restaurant.AverageRating)}
              <span className="restaurant-rating-value">
                {restaurant.AverageRating.toFixed(2)} ({t("labels.reviewCount", { count: approvedReviewsCount })})
              </span>
            </div>
          </div>
          <Button variant={isFavorite ? "red" : "beige-outline"} onClick={handleToggleFavorite}>
            <Icon path={isFavorite ? mdiHeart : mdiHeartOutline} size={0.9} />{" "}
            {isFavorite ? t("buttons.removeFromFavorites") : t("buttons.addToFavorites")}
          </Button>
        </div>
      </FadeInSection>

      <FadeInSection from="bottom">
        <div className="restaurant-subinfo">
          {todayHours && !todayHours.IsClosed && isOpen ? (
            <span className="open">{t("labels.openUntil")} {openUntil}</span>
          ) : (
            <span className="closed">{t("labels.closed")} · {getNextOpenTime()}</span>
          )}
          <span className="dot">•</span>
          <span>{getPriceLabel(restaurant.PriceRange)}</span>
          <span className="dot">•</span>
          <span>{restaurant.cuisines?.map((rc) => t(`cuisines.${rc.cuisine.Code}`)).join(", ")}</span>
        </div>
      </FadeInSection>

      <FadeInSection from="bottom">
        <ImageGallery images={restaurant.images} />
      </FadeInSection>

      <FadeInSection from="left">
        <Title>{t("restaurant.details")}</Title>
        <p className="restaurant-details">{translatedDetailsText}</p>
      </FadeInSection>

      <FadeInSection from="right">
        <div className="info-cards">
          <InfoCard
            icon={mdiCashMultiple}
            label={t("restaurant.price")}
            value={`${getPriceLabel(restaurant.PriceRange)} ${t("labels.perPerson")}`}
          />
          <InfoCard
            icon={mdiSilverwareForkKnife}
            label={t("restaurant.cuisines")}
            value={restaurant.cuisines?.map(rc => t(`cuisines.${rc.cuisine.Code}`)).join(", ")}
          />
          <InfoCard
            icon={mdiPhone}
            label={t("restaurant.phone")}
            value={restaurant.PhoneNumber || t("labels.notAvailable")}
            style={{ opacity: restaurant.PhoneNumber ? 1 : 0.5 }}
            onClick={
              restaurant.PhoneNumber
                ? () => window.open(`tel:${restaurant.PhoneNumber}`)
                : undefined
            }
          />
          <InfoCard
            icon={mdiWeb}
            label={t("restaurant.website")}
            value={restaurant.Website || t("labels.notAvailable")}
            style={{ opacity: restaurant.Website ? 1 : 0.5 }}
            onClick={
              restaurant.Website
                ? () => window.open(restaurant.Website, "_blank")
                : undefined
            }
          />
          <InfoCard
            icon={mdiFileDocument}
            label={t("restaurant.menu")}
            value={restaurant.MenuUrl ? t("labels.clickToView") : t("labels.notAvailable")}
            style={{ opacity: restaurant.MenuUrl ? 1 : 0.5 }}
            onClick={
              restaurant.MenuUrl
                ? () => window.open(restaurant.MenuUrl, "_blank")
                : undefined
            }
          />
        </div>
      </FadeInSection>

      <FadeInSection from="bottom">
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
            onSuggestEdit={() => {
              navigate("/issues", {
                state: {
                  issueType: "Wrong Info",
                  restaurantId: restaurant.RestaurantId
                }
              });
            }}
          />
        </div>
      </FadeInSection>

      <FadeInSection from="bottom">
        <Title>{t("restaurant.amenities")}</Title>
        <div className="restaurant-amenities">
          {["DELIV", "PARK", "PET", "CARD", "KIDS", "SMOK", "VEGAN", "VEGE", "GLUT", "HALAL"].map(code => {
            const amenity = restaurant.amenities?.find(a => a.amenity.Code === code);
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
      </FadeInSection>

      <FadeInSection from="bottom">
        <Title>{t("restaurant.reviews")}</Title>
        <div className="review-bar">
          <div className="review-cell left">
            <SortBar
              label={t("sort.label")}
              sortOptions={["highestRating", "lowestRating", "latest"]}
              selected={sortOption}
              onSelect={setSortOption}
              t={t}
            />
          </div>
          <div className="review-cell center">
            <Button
              variant="red"
              disabled={
                user?.role === OWNER_ROLE_ID ||
                userStatus === "suspended" ||
                userStatus === "banned"
              }
              onClick={() => {
                if (!user) {
                  setShowLoginAlert(true);
                } else if (user?.role !== OWNER_ROLE_ID && userStatus !== "suspended" && userStatus !== "banned") {
                  navigate(`/restaurants/${id}/reviews`);
                }
              }}
              data-tooltip-id="write-review-tooltip"
              style={
                user?.role === OWNER_ROLE_ID ||
                  userStatus === "suspended" ||
                  userStatus === "banned"
                  ? { opacity: 0.5, cursor: "not-allowed" }
                  : {}
              }
            >
              {t("buttons.writeReview")}
            </Button>

            {(user?.role === OWNER_ROLE_ID || userStatus === "suspended" || userStatus === "banned") && (
              <Tooltip id="write-review-tooltip" place="top" content={disabledReason} />
            )}
          </div>
          <div className="review-cell right">
            <SearchBar
              placeholder={t("labels.searchByKeyword")}
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>

        {getSortedReviews().length === 0 ? (
          <p style={{ color: "var(--beige)" }}>
            {reviews.length === 0 ? t("restaurant.noReviews") : t("restaurant.noSearchResults")}
          </p>
        ) : (
          <div className="reviews-columns">
            <div className="reviews-column">
              {getSortedReviews().filter((_, i) => i % 2 === 0).map((r) => (
                <ReviewCard
                  key={r.ReviewId}
                  review={r}
                  onDelete={(id, status) => {
                    setReviews(prev => prev.filter(rev => rev.ReviewId !== id));
                    setPopup({
                      message:
                        status === "success"
                          ? t("alerts.reviewDeleted")
                          : t("alerts.deleteReviewError"),
                      variant: status === "success" ? "success" : "error"
                    });
                  }}
                />

              ))}
            </div>
            <div className="reviews-column">
              {getSortedReviews().filter((_, i) => i % 2 !== 0).map((r) => (
                <ReviewCard
                  key={r.ReviewId}
                  review={r}
                  onDelete={(id, status) => {
                    setReviews(prev => prev.filter(rev => rev.ReviewId !== id));
                    setPopup({
                      message:
                        status === "success"
                          ? t("alerts.reviewDeleted")
                          : t("alerts.deleteReviewError"),
                      variant: status === "success" ? "success" : "error"
                    });
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </FadeInSection>

      {popup && <Popup message={popup.message} variant={popup.variant} onClose={() => setPopup(null)} />}
      {showLoginAlert && (
        <Alert
          message={t("restaurantPage.reviewLogin")}
          buttonText={t("navbar.login")}
          cancelText={t("restaurantPage.notNow")}
          onButtonClick={() => navigate("/auth/login")}
          onClose={() => setShowLoginAlert(false)}
        />
      )}
    </div>
  );
}

export default RestaurantPage;