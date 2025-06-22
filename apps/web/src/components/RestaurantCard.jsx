import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    mdiCheckCircle,
    mdiHeartOutline,
    mdiHeart,
    mdiClockOutline,
    mdiTruckDelivery,
    mdiParking,
    mdiPaw,
    mdiCreditCardCheck,
    mdiTeddyBear,
    mdiSmoking,
    mdiSproutOutline,
    mdiFoodApple,
    mdiBarley,
    mdiFoodHalal,
    mdiHelpCircle,
    mdiStar,
    mdiStarHalfFull,
    mdiStarOutline,
    mdiPencil,
    mdiDelete
} from "@mdi/js";
import Icon from "@mdi/react";
import "../styles/RestaurantCard.css";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getOpenCloseStatus, getNextOpeningTime } from "../utils/openingHoursUtils";
import { useAzureTranslation } from '../hooks/useAzureTranslation';

dayjs.extend(utc);
dayjs.extend(timezone);

function RestaurantCard({ restaurant, isFavorite, onToggleFavorite, searchTerm = "", adminActions }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const {
        RestaurantId,
        Name,
        PriceRange,
        AverageRating,
        Details,
        cuisines,
        amenities,
        workingHours,
        IsClaimed,
        images
    } = restaurant;

    const { translatedText: translatedDetailsText } = useAzureTranslation(Details || "");

    const firstImage = images?.[0]?.Url || "/placeholder.jpg";

    const localTZ = dayjs.tz.guess();
    const now = dayjs().tz(localTZ);
    const todayDayOfWeek = now.day() === 0 ? 7 : now.day();

    const todayHours = workingHours?.find(h => h.DayOfWeek === todayDayOfWeek);

    const getPriceLabel = () => {
        switch (PriceRange) {
            case 1: return "5–10€";
            case 2: return "10–20€";
            case 3: return "20€+";
            default: return "-";
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
            7: t("days.sun")
        };
        return dayMap[dayNum];
    };

    const { isOpen, closeFormatted } = getOpenCloseStatus(todayHours, now, t);
    const nextOpeningText = getNextOpeningTime(workingHours, todayDayOfWeek, getDayName, t);

    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(AverageRating);
        const halfStar = AverageRating % 1 >= 0.25 && AverageRating % 1 < 0.75;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Icon key={`full-${i}`} path={mdiStar} size={0.8} color="var(--red)" />);
        }
        if (halfStar) {
            stars.push(<Icon key="half" path={mdiStarHalfFull} size={0.8} color="var(--red)" />);
        }
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Icon key={`empty-${i}`} path={mdiStarOutline} size={0.8} color="var(--red)" />);
        }
        return stars;
    };

    const highlightMatch = (text) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, "gi");
        return text?.split(regex).map((part, i) =>
            part.toLowerCase() === searchTerm.toLowerCase()
                ? <mark key={i} style={{ backgroundColor: "yellow", fontWeight: "bold" }}>{part}</mark>
                : part
        );
    };

    return (
        <div className="restaurant-card" onClick={() => navigate(`/restaurants/${RestaurantId}`)}>
            <div className="card-image-section">
                <img src={firstImage} alt={Name} className="restaurant-image" />
                {adminActions ? (
                    <div className="stacked-buttons">
                        <div className="favorite-btn" onClick={(e) => e.stopPropagation()}>
                            <Icon
                                path={mdiPencil}
                                size={1.3}
                                color="var(--red)"
                                title="Edit"
                                onClick={() => adminActions.onEdit(RestaurantId)}
                                style={{ cursor: "pointer" }} />
                        </div>
                        <div className="favorite-btn" style={{ marginTop:"4rem" }} onClick={(e) => e.stopPropagation()}>
                            <Icon
                                path={mdiDelete}
                                size={1.3}
                                color="var(--red)"
                                title="Delete"
                                onClick={() => adminActions.onDelete(RestaurantId)}
                                style={{ cursor: "pointer" }} />
                        </div>
                    </div>
                ) : (
                    <div
                        className="favorite-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(RestaurantId);
                        }}
                    >
                        <Icon path={isFavorite ? mdiHeart : mdiHeartOutline} size={1.5} color="var(--red)" />
                    </div>
                )}
            </div>

            <div className="card-content-section">
                <div className="header-row">
                    <h2 className="restaurant-name">{highlightMatch(Name)}</h2>
                    {IsClaimed && (
                        <Icon path={mdiCheckCircle} size={1} color="green" title="Claimed" style={{ marginLeft: 5 }} />
                    )}
                </div>

                {todayHours && !todayHours.IsClosed && isOpen ? (
                    <div className="restaurant-info-line open-now">
                        <Icon path={mdiClockOutline} size={0.8} />
                        {t("labels.openUntil")} {closeFormatted}
                    </div>
                ) : (
                    <div className="restaurant-info-line closed-now">
                        <Icon path={mdiClockOutline} size={0.8} />
                        {t("labels.closed")}{" · "}{nextOpeningText}
                    </div>
                )}

                <div className="restaurant-info-line rating-row">
                    <strong>{t("labels.rating")}:</strong>
                    <span className="stars-red">{renderStars()}<span className="rating-value"> {AverageRating.toFixed(2)}</span></span>
                    {restaurant.reviews && (
                        <span className="review-count-card" style={{ color: "ba3b46" }}>
                            ({t("labels.reviewCount", { count: restaurant.reviews.length })})
                        </span>
                    )}
                </div>

                <div className="restaurant-info-line">
                    <strong>{t("labels.price")}:</strong>{getPriceLabel()} {t("labels.perPerson")}
                </div>

                <div className="restaurant-info-line">
                    <strong>{t("labels.cuisines")}:</strong>{" "}
                    {cuisines.map(c => t(`cuisines.${c.Code}`)).join(", ")}
                </div>

                <div className="restaurant-info-line details-line">
                    {translatedDetailsText}
                </div>

                <div className="amenities-line">
                    {amenities.map(a => (
                        <Icon key={a.Code} path={getAmenityIcon(a.Code)} size={1} title={a.Name} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function getAmenityIcon(code) {
    const iconMap = {
        DELIV: mdiTruckDelivery,
        PARK: mdiParking,
        PET: mdiPaw,
        CARD: mdiCreditCardCheck,
        KIDS: mdiTeddyBear,
        SMOK: mdiSmoking,
        VEGAN: mdiSproutOutline,
        VEGE: mdiFoodApple,
        GLUT: mdiBarley,
        HALAL: mdiFoodHalal
    };
    return iconMap[code] || mdiHelpCircle;
}

export default RestaurantCard;
