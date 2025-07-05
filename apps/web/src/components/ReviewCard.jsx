import { useEffect, useState } from "react";
import Icon from "@mdi/react";
import { mdiStar, mdiStarHalfFull, mdiStarOutline, mdiMedal, mdiDiamondStone, mdiTrashCan } from "@mdi/js";
import "../styles/ReviewCard.css";
import { useTranslation } from "react-i18next";
import ImageGallery from "./ImageGallery";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/mk";
import "dayjs/locale/me";
import "dayjs/locale/sl";
import Alert from "./Alert";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import { useAzureTranslation } from "../hooks/useAzureTranslation";

const ReviewCard = ({ review, onDelete }) => {
    const {
        user,
        Rating,
        Comment,
        PhotoUrl1,
        PhotoUrl2,
        PhotoUrl3,
        CreatedAt,
    } = review;

    const { user: currentUser } = useAuth();
    const { t, i18n } = useTranslation();

    const [translatedCountries, setTranslatedCountries] = useState([]);
    const [translatedCities, setTranslatedCities] = useState([]);
    const [translatedText, setTranslatedText] = useState("");
    const [detectedLanguage, setDetectedLanguage] = useState("");

    const [showConfirmAlert, setShowConfirmAlert] = useState(false);

    const countryNameToCode = {
        Macedonia: "MK",
        Slovenia: "SI",
        Croatia: "HR",
        Serbia: "RS",
        "Bosnia and Herzegovina": "BA",
        Montenegro: "ME"
    };

    useEffect(() => {
        fetch("/translatedCountries.json").then(res => res.json()).then(setTranslatedCountries).catch(console.error);
    }, []);

    useEffect(() => {
        fetch("/translatedCities.json").then(res => res.json()).then(setTranslatedCities).catch(console.error);
    }, [i18n.language]);

    const { translatedText: aiTranslation, detectedLanguage: aiLang } = useAzureTranslation(Comment);

    useEffect(() => {
        setTranslatedText(aiTranslation);
        setDetectedLanguage(aiLang);
    }, [aiTranslation, aiLang]);

    const shouldTranslate = detectedLanguage && detectedLanguage !== i18n.language && translatedText;

    const getTranslatedCountry = (countryName) => {
        const match = translatedCountries.find(c => c.name.toLowerCase() === countryName?.toLowerCase());
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

    const dayjsLocaleMap = { en: "en", mk: "mk", sr: "me", sl: "sl" };
    dayjs.locale(dayjsLocaleMap[i18n.language] || "en");
    const reviewDate = dayjs(CreatedAt).format("D MMMM YYYY");

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

    const reviewCount = review.user._count.reviews;
    const { icon: medalIcon, color: medalColor } = getMedalIcon(reviewCount);
    const reviewLabel = t("labels.reviewCount", { count: reviewCount });

    const reviewImages = [PhotoUrl1, PhotoUrl2, PhotoUrl3].filter(Boolean).map((url) => ({ Url: url }));

    const handleDelete = () => {
        setShowConfirmAlert(true);
    };

    const performDelete = async () => {
        try {
            const res = await fetch(`http://localhost:3001/reviews/${review.ReviewId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            if (!res.ok) throw new Error();
            if (onDelete) onDelete(review.ReviewId, "success");
        } catch (err) {
            if (onDelete) onDelete(review.ReviewId, "error");
        }
    };

    return (
        <>
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
                            {user?.City
                                ? `${getTranslatedCity(user.City, user.Country)}, ${getTranslatedCountry(user.Country)}`
                                : getTranslatedCountry(user.Country)}
                            {" "} · {reviewLabel}
                        </div>
                        <div className="review-stars">
                            {renderStars(Rating)}
                        </div>
                    </div>
                </div>

                <div className="review-text">{Comment}</div>

                {shouldTranslate && (
                    <div style={{ marginTop: "8px", opacity: 0.9 }}>
                        <hr style={{
                            border: "none",
                            borderTop: "1px solid var(--red)",
                            opacity: 0.5
                        }} />
                        <p style={{ fontStyle: "italic", textAlign: "justify" }}>{translatedText}</p>
                        <span style={{ fontSize: "0.85em", color: "var(--red)" }}>
                            {t("labels.aiTranslated")}
                        </span>
                    </div>
                )}

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

                {currentUser?.id === review.UserId && (
                    <Button
                        variant="red-outline"
                        onClick={handleDelete}
                        style={{ marginTop: "1rem" }}
                    >
                        <Icon path={mdiTrashCan} size={0.9} style={{ marginRight: "6px" }} />
                        {t("buttons.deleteReview")}
                    </Button>
                )}
            </div>

            {
                showConfirmAlert && (
                    <Alert
                        message={t("alerts.confirmDeleteReview")}
                        buttonText={t("buttons.confirm")}
                        cancelText={t("buttons.cancel")}
                        onButtonClick={() => {
                            setShowConfirmAlert(false);
                            performDelete();
                        }}
                        onClose={() => setShowConfirmAlert(false)}
                    />
                )
            }
        </>
    );
};

export default ReviewCard;