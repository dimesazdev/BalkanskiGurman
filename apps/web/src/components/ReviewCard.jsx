import Icon from "@mdi/react";
import { mdiStar, mdiStarHalfFull, mdiStarOutline, mdiMedal, mdiDiamondStone } from "@mdi/js";
import "../styles/ReviewCard.css";
import { useTranslation } from "react-i18next";
import ImageGallery from "./ImageGallery";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/mk";
import "dayjs/locale/me";
import "dayjs/locale/sl";
import { useEffect, useState } from "react";
import i18n from "../i18n";

const ReviewCard = ({ review, children }) => {
    const {
        user,
        Rating,
        Comment,
        PhotoUrl1,
        PhotoUrl2,
        PhotoUrl3,
        CreatedAt,
    } = review;

    const { t } = useTranslation();
    const [translatedCountries, setTranslatedCountries] = useState([]);
    const [translatedCities, setTranslatedCities] = useState([]);

    const countryNameToCode = {
        "Macedonia": "MK",
        "Slovenia": "SI",
        "Croatia": "HR",
        "Serbia": "RS",
        "Bosnia and Herzegovina": "BA",
        "Montenegro": "ME"
    }

    useEffect(() => {
        fetch("/translatedCountries.json")
            .then((res) => res.json())
            .then(setTranslatedCountries)
            .catch(console.error);
    }, []);

    useEffect(() => {
        fetch("/translatedCities.json")
            .then((res) => res.json())
            .then(setTranslatedCities)
            .catch(console.error);
    }, [i18n.language]);

    const getTranslatedCountry = (countryName) => {
        const match = translatedCountries.find(
            (c) => c.name.toLowerCase() === countryName?.toLowerCase()
        );
        return match?.translations[i18n.language] || countryName;
    };

    const getTranslatedCity = (cityName, countryName) => {
        if (!cityName || !countryName) return cityName;

        const isoCode = countryNameToCode[countryName.trim()] || countryName.trim();

        const match = translatedCities.find(
            (c) =>
                c.name.trim().toLowerCase() === cityName.trim().toLowerCase() &&
                c.countryCode.toUpperCase() === isoCode.toUpperCase()
        );

        return match?.translations?.[i18n.language] || cityName;
    };

    const dayjsLocaleMap = {
        en: "en",
        mk: "mk",
        sr: "me",
        sl: "sl",
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

    const getMedalIcon = (reviewCount) => {
        if (reviewCount > 50) return { icon: mdiDiamondStone, color: "#00bfff" };
        if (reviewCount >= 26) return { icon: mdiMedal, color: "#ffd700" };
        if (reviewCount >= 11) return { icon: mdiMedal, color: "#c0c0c0" };
        return { icon: mdiMedal, color: "#cd7f32" };
    };

    dayjs.locale(dayjsLocaleMap[i18n.language] || "en");
    const reviewDate = dayjs(CreatedAt).format("D MMMM YYYY");

    const reviewCount = review.user._count.reviews;
    const { icon: medalIcon, color: medalColor } = getMedalIcon(reviewCount);
    const reviewLabel = t("labels.reviewCount", { count: reviewCount });

    const reviewImages = [PhotoUrl1, PhotoUrl2, PhotoUrl3]
        .filter(Boolean)
        .map((url) => ({ Url: url }));

    return (
        <div className="review-card">
            <div className="review-user-header">
                {user?.ProfilePictureUrl ? (
                    <img
                        src={user.ProfilePictureUrl}
                        alt={`${user.Name} ${user.Surname}`}
                        className="review-user-avatar"
                    />
                ) : (
                    <div className="review-user-avatar review-user-avatar-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--red)">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                )}

                <div className="review-user-info">
                    <div className="review-user-name">
                        {user?.Name} {user?.Surname}{" "}
                        <Icon path={medalIcon} size={0.8} color={medalColor} />
                    </div>
                    <div className="review-user-meta">
                        {getTranslatedCity(user?.City, user?.Country)}, {getTranslatedCountry(user?.Country)} · {reviewLabel}
                    </div>
                    <div className="review-stars">
                        {renderStars(Rating)}
                    </div>
                </div>
            </div>

            <div className="review-text">{Comment}</div>

            {children}

            <div className="review-images">
                {reviewImages.length > 0 && (
                    <div style={{ maxWidth: "100%", overflow: "hidden" }}>
                        <ImageGallery
                            images={reviewImages}
                            arrowColor="var(--red)"
                            arrowSize={1.5}
                        />
                    </div>
                )}
            </div>

            <div className="review-date">{reviewDate}</div>
        </div>
    );
};

export default ReviewCard;