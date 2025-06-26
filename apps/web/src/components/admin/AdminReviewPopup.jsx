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
import { useAuth } from "../../context/AuthContext";

const AdminReviewPopup = ({ review, onClose, onAction }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  if (!review) return null;

  const {
    ReviewId,
    CreatedAt,
    Rating,
    Comment,
    user: reviewer,
    restaurant,
    status
  } = review;

  const statusLabel = review.status?.Name?.toLowerCase();
  const [reviewerState, setReviewerState] = useState(reviewer);
  const userStatus = reviewerState?.status?.Name?.toLowerCase();

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

  const handleAction = (actionType) => {
    if (["suspend", "ban"].includes(actionType)) {
      onAction(actionType, reviewer.UserId);

      setReviewerState(prev => ({
        ...prev,
        status: {
          ...prev.status,
          Name: actionType === "suspend" ? "Suspended" : "Banned"
        }
      }));
    } else {
      onAction(actionType, review.ReviewId);
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
              {reviewer.City}, {reviewer.Country} · {reviewer._count?.reviews || 0} {t("labels.reviews")}
            </div>
            <div className="user-status">
              {t("adminReview.userStatus")}: <span className={`status ${userStatus}`}>{t(`userStatus.${userStatus || "active"}`)}</span>
            </div>
            <div className="admin-actions">
              <Button variant="yellow-small" onClick={() => handleAction("suspend")}>
                {t("buttons.suspend")}
              </Button>
              <Button variant="red-small" onClick={() => handleAction("ban")}>
                {t("buttons.ban")}
              </Button>
            </div>
          </div>
        </div>

        <div className="review-section">
          <p><strong>{t("adminReview.reviewStatus")}:</strong> <span className={`status ${statusLabel}`}>{t(`reviewStatus.${statusLabel}`)}</span></p>
          <p><strong>{t("adminReview.datePosted")}:</strong> {formattedDate}</p>
          <p><strong>{t("adminReview.forRestaurant")}:</strong> {restaurant.Name}</p>
          <p><strong>{t("adminReview.location")}:</strong> {restaurant.address?.City}, {restaurant.address?.Country}</p>
          <p className="rating-line"><strong>{t("adminReview.rating")}:</strong> <span className="stars">{renderStars(Rating)}</span> ({Rating.toFixed(1)})</p>
          <p className="comment-line"><strong>{t("adminReview.review")}:</strong> {Comment}</p>
        </div>

        <div className="popup-actions">
          <Button
            variant="green"
            onClick={() => handleAction("approve")}
            disabled={statusLabel === "approved"}
            style={statusLabel === "approved" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
            {t("buttons.approve")}
          </Button>
          <Button
            variant="red"
            onClick={() => handleAction("reject")}
            disabled={statusLabel === "rejected"}
            style={statusLabel === "rejected" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
            {t("buttons.reject")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewPopup;