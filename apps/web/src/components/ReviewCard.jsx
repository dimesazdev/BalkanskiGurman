import Icon from "@mdi/react";
import { mdiStar, mdiStarHalfFull, mdiStarOutline } from "@mdi/js";
import "../styles/ReviewCard.css";
import {
    mdiMedal,
    mdiDiamondStone
} from "@mdi/js";
import { useTranslation } from "react-i18next";

const ReviewCard = ({ review }) => {
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
        if (reviewCount >= 26) return { icon: mdiMedal, color: "#ffd700" }; // Gold
        if (reviewCount >= 11) return { icon: mdiMedal, color: "#c0c0c0" }; // Silver
        return { icon: mdiMedal, color: "#cd7f32" }; // Bronze
    };

    const reviewDate = new Date(CreatedAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const reviewCount = review.user._count.reviews;
    const { icon: medalIcon, color: medalColor } = getMedalIcon(reviewCount);
    const reviewLabel = t("labels.reviewCount", { count: reviewCount });

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
                        {user?.City}, {user?.Country} · {reviewLabel}
                    </div>
                    <div className="review-stars">
                        {renderStars(Rating)}
                    </div>
                </div>
            </div>

            <div className="review-text">
                {Comment}
            </div>

            <div className="review-images">
                {PhotoUrl1 && <img src={PhotoUrl1} alt="Review 1" />}
                {PhotoUrl2 && <img src={PhotoUrl2} alt="Review 2" />}
                {PhotoUrl3 && <img src={PhotoUrl3} alt="Review 3" />}
            </div>

            <div className="review-date">
                {reviewDate}
            </div>
        </div>
    );
};

export default ReviewCard;