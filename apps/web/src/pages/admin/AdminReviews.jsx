import { useEffect, useState } from "react";
import Title from "../../components/Title";
import AdminReviewCard from "../../components/admin/AdminReviewCard";
import AdminReviewPopup from "../../components/admin/AdminReviewPopup";
import "../../styles/AdminReviews.css";
import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import Popup from "../../components/Popup";

const AdminReviews = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [reviews, setReviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("newest");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [popup, setPopup] = useState(null);

    useEffect(() => {
        if (!user?.token) return;
        fetch("http://localhost:3001/reviews", {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setReviews(data))
            .catch(console.error);
    }, [user]);

    const filtered = reviews
        .filter((r) =>
            statusFilter === "all" ? true : r.status?.Name?.toLowerCase() === statusFilter
        )
        .filter((r) =>
            searchTerm.trim() === ""
                ? true
                : r.Comment?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOption === "rating") return b.Rating - a.Rating;
            if (sortOption === "newest") return new Date(b.CreatedAt) - new Date(a.CreatedAt);
            if (sortOption === "oldest") return new Date(a.CreatedAt) - new Date(b.CreatedAt);
            return 0;
        });

    const handleReviewAction = async (action, reviewId) => {
        try {
            const res = await fetch(`http://localhost:3001/reviews/${reviewId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ action }),
            });

            if (!res.ok) throw new Error();
            const updatedReview = await res.json();

            setReviews((prev) =>
                prev.map((r) =>
                    r.ReviewId === reviewId
                        ? { ...r, status: updatedReview.status, StatusId: updatedReview.StatusId }
                        : r
                )
            );

            setSelectedReview((prev) =>
                prev && prev.ReviewId === reviewId
                    ? { ...prev, status: updatedReview.status, StatusId: updatedReview.StatusId }
                    : prev
            );

            setPopup({
                message: t(`popup.statusChangeSuccess.${action}`),
                variant: "success",
            });
        } catch {
            setPopup({
                message: t(`popup.statusChangeError.${action}`),
                variant: "error",
            });
        }
    };

    const handleUserStatusChange = async (userId, statusId) => {
        try {
            const res = await fetch(`http://localhost:3001/users/${userId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ StatusId: statusId }),
            });

            if (!res.ok) throw new Error();
            const updatedUser = await res.json();

            setReviews(prev =>
                prev.map(r =>
                    r.user.UserId === userId
                        ? { ...r, user: { ...r.user, ...updatedUser } }
                        : r
                )
            );

            setSelectedReview(prev =>
                prev && prev.user.UserId === userId
                    ? { ...prev, user: { ...prev.user, ...updatedUser } }
                    : prev
            );

            setPopup({
                message: t(`popup.statusChangeSuccess.${statusId === 2 ? "suspend" : "ban"}`),
                variant: "success",
            });
        } catch {
            setPopup({
                message: t(`popup.statusChangeError.${statusId === 2 ? "suspend" : "ban"}`),
                variant: "error",
            });
        }
    };

    return (
        <div className="admin-reviews-page">
            {popup && <Popup {...popup} onClose={() => setPopup(null)} />}

            <Title>{t("labels.reviews")}</Title>

            <div className="review-header-row">
                <div className="top-row">
                    <div className="review-filters">
                        {["all", "pending", "approved", "rejected"].map((status) => (
                            <button
                                key={status}
                                className={`status-filter ${status === statusFilter ? "active" : ""} ${status !== "all" ? status : ""}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {t(`reviewStatus.${status}`)}
                            </button>
                        ))}
                    </div>

                    <div className="search-bar">
                        <input
                            placeholder={t("labels.searchByKeyword")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button>
                            <Icon path={mdiMagnify} size={1} color="#2f2f2f" />
                        </button>
                    </div>
                </div>

                <div className="bottom-row">
                    <div className="sort-bar">
                        <label>{t("sort.label")}</label>
                        <div
                            className={`sort-select ${showSortDropdown ? "open" : ""}`}
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                        >
                            {t(`sort.${sortOption}`)} {showSortDropdown ? "▾" : "▸"}
                            {showSortDropdown && (
                                <ul className="sort-dropdown">
                                    <li onClick={() => setSortOption("rating")}>{t("sort.rating")}</li>
                                    <li onClick={() => setSortOption("newest")}>{t("sort.newest")}</li>
                                    <li onClick={() => setSortOption("oldest")}>{t("sort.oldest")}</li>
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="review-count-label">
                        {t("labels.reviewCount", { count: filtered.length })}
                    </div>
                </div>
            </div>

            <div className="reviews-grid">
                {filtered.map((review) => (
                    <AdminReviewCard
                        key={review.ReviewId}
                        review={review}
                        onManage={() => setSelectedReview(review)}
                    />
                ))}
            </div>

            {selectedReview && (
                <AdminReviewPopup
                    review={selectedReview}
                    onClose={() => setSelectedReview(null)}
                    setPopup={setPopup}
                    onAction={(actionType, id) => {
                        if (["suspend", "ban"].includes(actionType)) {
                            const statusMap = { suspend: 2, ban: 3 };
                            handleUserStatusChange(id, statusMap[actionType]);
                        } else {
                            handleReviewAction(actionType, id);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default AdminReviews;