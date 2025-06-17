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
    mdiStarOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import "../styles/RestaurantCard.css";

function RestaurantCard({ restaurant, isFavorite, onToggleFavorite }) {
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

    const firstImage = images?.[0]?.Url || "/placeholder.jpg";

    const today = new Date();
    const todayDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
    const todayHours = workingHours?.find(h => h.DayOfWeek === todayDayOfWeek);

    const isOpen = todayHours && !todayHours.IsClosed && (() => {
        const now = today.getHours() * 60 + today.getMinutes();
        const open = new Date(todayHours.OpenTime).getHours() * 60 + new Date(todayHours.OpenTime).getMinutes();
        const close = new Date(todayHours.CloseTime).getHours() * 60 + new Date(todayHours.CloseTime).getMinutes();
        return now >= open && now < close;
    })();

    const openUntil = isOpen
        ? new Date(todayHours.CloseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        : null;

    const getPriceLabel = () => {
        switch (PriceRange) {
            case 1: return "5–10€";
            case 2: return "10–20€";
            case 3: return "20€+";
            default: return "-";
        }
    };

    const getNextOpenTime = () => {
        for (let i = 1; i <= 7; i++) {
            const nextDayIndex = (todayDayOfWeek + i - 1) % 7 + 1;
            const nextDayHours = workingHours?.find(h => h.DayOfWeek === nextDayIndex);
            if (nextDayHours && !nextDayHours.IsClosed) {
                const openTime = new Date(nextDayHours.OpenTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                });
                const dayName = getDayName(nextDayIndex);
                return `${t("labels.opensAt")} ${openTime} ${t("labels.on")} ${dayName}`;
            }
        }
        return t("labels.closedAllWeek");
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

    return (
        <div className="restaurant-card" onClick={() => navigate(`/restaurants/${RestaurantId}`)}>
            <div className="card-image-section">
                <img src={firstImage} alt={Name} className="restaurant-image" />
                <div
                    className="favorite-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(RestaurantId);
                    }}
                >
                    <Icon path={isFavorite ? mdiHeart : mdiHeartOutline} size={1.5} color="var(--red)" />
                </div>
            </div>

            <div className="card-content-section">
                <div className="header-row">
                    <h2 className="restaurant-name">{Name}</h2>
                    {IsClaimed && (
                        <Icon path={mdiCheckCircle} size={1} color="green" title="Claimed" style={{ marginLeft: 5 }} />
                    )}
                </div>

                {todayHours && !todayHours.IsClosed && isOpen ? (
                    <div className="restaurant-info-line open-now">
                        <Icon path={mdiClockOutline} size={0.8} />
                        {t("labels.openUntil")} {openUntil}
                    </div>
                ) : (
                    <div className="restaurant-info-line closed-now">
                        <Icon path={mdiClockOutline} size={0.8} />
                        {t("labels.closed")}{" · "}{getNextOpenTime()}
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
                    {Details}
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
