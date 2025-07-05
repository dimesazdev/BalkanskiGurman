import { useState, useEffect } from "react";
import Icon from "@mdi/react";
import {
  mdiClose,
  mdiStar,
  mdiStarHalfFull,
  mdiStarOutline,
  mdiMedal,
  mdiDiamondStone
} from "@mdi/js";
import { useTranslation } from "react-i18next";
import "../../styles/AdminReviewPopup.css";
import Button from "../Button";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/mk";
import "dayjs/locale/me";
import "dayjs/locale/sl";
import { useAzureTranslation } from "../../hooks/useAzureTranslation";
import FormTextarea from "../FormTextarea";
import Popup from "../Popup";

const OwnerReviewPopup = ({ review, onClose, userToken, onRecheckSuccess }) => {
  const { t, i18n } = useTranslation();

  if (!review) return null;

  const {
    ReviewId,
    CreatedAt,
    Rating,
    Comment,
    user: reviewer,
    restaurant
  } = review;

  const translationResult = useAzureTranslation(Comment);
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [explanation, setExplanation] = useState("");
  const [popup, setPopup] = useState(null);
  const [hasRequested, setHasRequested] = useState(review.HasRequestedRecheck);
  const [status, setStatus] = useState(review.status?.Name?.toLowerCase());

  const dayjsLocaleMap = { en: "en", mk: "mk", sr: "me", sl: "sl" };
  dayjs.locale(dayjsLocaleMap[i18n.language] || "en");
  const formattedDate = dayjs(CreatedAt).format("D MMMM YYYY");

  const getMedalIcon = (count) => {
    if (count > 50) return { icon: mdiDiamondStone, color: "#00bfff" };
    if (count >= 26) return { icon: mdiMedal, color: "#ffd700" };
    if (count >= 11) return { icon: mdiMedal, color: "#c0c0c0" };
    if (count >= 1) return { icon: mdiMedal, color: "#cd7f32" };
    return { icon: null, color: "" };
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.25 && rating % 1 < 0.75;
    const empty = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < full; i++) stars.push(<Icon key={`f-${i}`} path={mdiStar} size={0.7} color="var(--red)" />);
    if (half) stars.push(<Icon key="half" path={mdiStarHalfFull} size={0.7} color="var(--red)" />);
    for (let i = 0; i < empty; i++) stars.push(<Icon key={`e-${i}`} path={mdiStarOutline} size={0.7} color="var(--red)" />);
    return stars;
  };

  useEffect(() => {
    setTranslatedText(translationResult.translatedText);
    setDetectedLanguage(translationResult.detectedLanguage);
  }, [translationResult]);

  const shouldTranslate =
    detectedLanguage &&
    detectedLanguage !== i18n.language &&
    translatedText;

  const handleRequestRecheck = async () => {
    if (!explanation.trim()) {
      setPopup({
        message: t("alerts.explanationRequired"),
        variant: "error"
      });
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/reviews/${ReviewId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({
          action: "recheck",
          recheckExplanation: explanation.trim()
        })
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      // Update local state to reflect the change
      setStatus("recheck");
      setHasRequested(true);

      setPopup({
        message: t("popup.statusChangeSuccess.recheckRequested"),
        variant: "success",
        onClose: onClose
      });

      if (onRecheckSuccess) {
        onRecheckSuccess({
          ...review,
          StatusId: 7,
          status: { Name: "Recheck" },
          HasRequestedRecheck: true,
          RecheckExplanation: explanation.trim()
        });
      }

    } catch (err) {
      console.error(err);
      setPopup({
        message: t("popup.statusChangeError.requestRecheck"),
        variant: "error"
      });
    }
  };

  return (
    <div className="admin-review-popup">
      <div className="popup-inner">
        <button className="close-btn" onClick={onClose}>
          <Icon path={mdiClose} size={1} />
        </button>

        <h2>{t("adminReview.reviewId", { id: ReviewId })}</h2>

        <div className="user-section">
          {reviewer.ProfilePictureUrl ? (
            <img src={reviewer.ProfilePictureUrl} alt="User" />
          ) : (
            <div className="user-avatar user-avatar-placeholder">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="var(--red)">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
          <div className="user-info">
            <div className="username">
              {reviewer.Name} {reviewer.Surname?.charAt(0)}.
              {(() => {
                const { icon, color } = getMedalIcon(reviewer._count?.reviews || 0);
                return icon && <Icon path={icon} size={0.8} color={color} style={{ marginLeft: 6 }} />;
              })()}
            </div>
            <div className="user-meta">
              {reviewer.City ? `${reviewer.City}, ${reviewer.Country}` : reviewer.Country} · {reviewer._count?.reviews || 0} {t("labels.reviews")}
            </div>
          </div>
        </div>

        <div className="review-section">
          <p><strong>{t("adminReview.reviewStatus")}:</strong> <span className={`status ${status}`}>{t(`reviewStatus.${status}`)}</span></p>
          <p><strong>{t("adminReview.datePosted")}:</strong> {formattedDate}</p>
          <p><strong>{t("adminReview.forRestaurant")}:</strong> {restaurant.Name}</p>
          <p><strong>{t("adminReview.location")}:</strong> {restaurant.address?.City}, {restaurant.address?.Country}</p>
          <p className="rating-line"><strong>{t("adminReview.rating")}:</strong> <span className="stars">{renderStars(Rating)}</span> ({Rating.toFixed(1)})</p>
          <div className="comment-line">
            <p>{Comment}</p>
            {shouldTranslate && (
              <div style={{ marginTop: "8px", opacity: 0.9 }}>
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid var(--red)",
                    opacity: 0.5,
                  }}
                />
                <p style={{ fontStyle: "italic", textAlign: "justify" }}>
                  {translatedText}
                </p>
                <span style={{ fontSize: "0.85em", color: "var(--red)" }}>
                  {t("labels.aiTranslated")}
                </span>
              </div>
            )}
          </div>
        </div>

        {review.HasRequestedRecheck ? (
          status === "approved" ? (
            <div style={{ marginTop: "1rem", color: "#c62828", fontWeight: "600" }}>
              {t("alerts.recheckRejected")}
            </div>
          ) : status === "rejected" ? (
            <div style={{ marginTop: "1rem", color: "#2e7d32", fontWeight: "600" }}>
              {t("alerts.recheckAccepted")}
            </div>
          ) : null
        ) : (
          status !== "pending" && (
            <div className="recheck-explanation" style={{ marginTop: "1rem" }}>
              <FormTextarea
                id="recheckExplanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder={t("placeholders.recheckExplanation")}
                rows={3}
                dashed
              />
            </div>
          )
        )}

        <div className="popup-actions">
          <Button
            variant="blue"
            onClick={handleRequestRecheck}
            disabled={status === "pending" || status === "recheck" || hasRequested}
            style={
              status === "pending" || status === "recheck" || hasRequested
                ? { opacity: 0.5, cursor: "not-allowed" }
                : {}
            }
          >
            {t("buttons.requestRecheck")}
          </Button>
        </div>

        {popup && (
          <Popup
            message={popup.message}
            variant={popup.variant}
            onClose={popup.onClose || (() => setPopup(null))}
          />
        )}
      </div>
    </div>
  );
};

export default OwnerReviewPopup;