import Icon from "@mdi/react";
import {
    mdiMedal,
    mdiDiamondStone,
    mdiStar,
    mdiStarHalfFull,
    mdiStarOutline
} from "@mdi/js";
import { useTranslation } from "react-i18next";
import "../../styles/AdminReviewCard.css";
import Button from "../Button";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/mk";
import "dayjs/locale/me";
import "dayjs/locale/sl";

const AdminReviewCard = ({ review, onManage }) => {
    const { t, i18n } = useTranslation();
    const {
        ReviewId,
        CreatedAt,
        Rating,
        user,
        restaurant,
        status
    } = review;

    const statusLabel = status?.Name?.toLowerCase();

    const dayjsLocaleMap = { en: "en", mk: "mk", sr: "me", sl: "sl" };
    dayjs.locale(dayjsLocaleMap[i18n.language] || "en");
    const reviewDate = dayjs(CreatedAt).format("D MMMM YYYY");

    const getMedalIcon = (reviewCount) => {
        if (reviewCount > 50) return { icon: mdiDiamondStone, color: "#00bfff" };
        if (reviewCount >= 26) return { icon: mdiMedal, color: "#ffd700" };
        if (reviewCount >= 11) return { icon: mdiMedal, color: "#c0c0c0" };
        if (reviewCount >= 1) return { icon: mdiMedal, color: "#cd7f32" };
        return { icon: null, color: "" };
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Icon key={`full-${i}`} path={mdiStar} size={0.7} color="var(--red)" />);
        }
        if (halfStar) {
            stars.push(<Icon key="half" path={mdiStarHalfFull} size={0.7} color="var(--red)" />);
        }
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Icon key={`empty-${i}`} path={mdiStarOutline} size={0.7} color="var(--red)" />);
        }
        return stars;
    };

    return (
        <div className="admin-review-card">
            <h4>{t("adminReview.reviewId", { id: ReviewId })}</h4>

            <div className="review-user-row">
                {user.ProfilePictureUrl ? (
                    <img src={user.ProfilePictureUrl} alt="User" />
                ) : (
                    <div className="user-avatar user-avatar-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--red)">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                )}
                <div>
                    <div className="review-user-info">
                        <span className="review-user-name">{user.Name} {user.Surname.charAt(0)}.</span>
                        {(() => {
                            const { icon, color } = getMedalIcon(user._count?.reviews || 0);
                            return icon && <Icon path={icon} size={0.8} color={color} />;
                        })()}
                    </div>
                    <div className="user-location">
                        {user.City}, {user.Country}
                    </div>
                </div>
            </div>

            <div className="review-info">
                <p className="review-info-line">
                    <strong>{t("adminReview.rating")}:</strong>
                    <span className="stars">{renderStars(Rating)}</span>
                    ({Rating.toFixed(1)})
                </p>
                <p className="review-info-line"><strong>{t("adminReview.forRestaurant")}:</strong> {restaurant.Name}</p>
                <p className="review-info-line"><strong>{t("adminReview.location")}:</strong> {restaurant.address?.City}, {restaurant.address?.Country}</p>
                <p className="review-info-line"><strong>{t("adminReview.reviewStatus")}:</strong> <span className={`status ${statusLabel}`}>{t(`reviewStatus.${statusLabel}`)}</span></p>
                <p className="review-info-line"><strong>{t("adminReview.datePosted")}:</strong> {reviewDate}</p>
            </div>

            <Button onClick={onManage} variant="red-outline">
                {t("buttons.manageReview")}
            </Button>
        </div>
    );
};

export default AdminReviewCard;