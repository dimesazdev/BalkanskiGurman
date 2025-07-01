import { useEffect, useState } from "react";
import Title from "../../components/Title";
import AdminReviewCard from "../../components/admin/AdminReviewCard";
import OwnerReviewPopup from "../../components/owner/OwnerReviewPopup";
import "../../styles/AdminReviews.css";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import Popup from "../../components/Popup";
import { motion } from "framer-motion";
import SearchBar from "../../components/SearchBar";
import SortBar from "../../components/SortBar";

const OwnerReviews = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    if (!user?.token) return;
    fetch(`http://localhost:3001/restaurants`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((restaurants) => {
        const owned = restaurants.filter(r => r.ClaimedByUserId === user?.id);
        return Promise.all(
          owned.map(r =>
            fetch(`http://localhost:3001/restaurants/${r.RestaurantId}/reviews/owner`, {
              headers: { Authorization: `Bearer ${user.token}` },
            }).then(res => res.json())
          )
        );
      })
      .then((reviewsArrays) => {
        const allReviews = reviewsArrays.flat();
        setReviews(allReviews);
      })
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

  const handleRequestRecheck = async (reviewId) => {
    try {
      const res = await fetch(`http://localhost:3001/reviews/${reviewId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ action: "recheck" }),
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
        message: t("popup.statusChangeSuccess.requestRecheck"),
        variant: "success",
      });
    } catch {
      setPopup({
        message: t("popup.statusChangeError.requestRecheck"),
        variant: "error",
      });
    }
  };

  return (
    <motion.div
      className="admin-reviews-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}

      <Title>{t("owner.reviews")}</Title>

      <motion.div
        className="review-header-row"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        <div className="top-row">
          <div className="review-filters">
            {["all", "pending", "approved", "rejected", "recheck"].map((status) => (
              <button
                key={status}
                className={`status-filter ${status === statusFilter ? "active" : ""} ${status !== "all" ? status : ""}`}
                onClick={() => setStatusFilter(status)}
              >
                {t(`reviewStatus.${status}`)}
              </button>
            ))}
          </div>

          <SearchBar
            placeholder={t("labels.searchByKeyword")}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        <div className="bottom-row">
          <SortBar
            label={t("sort.label")}
            sortOptions={["rating", "newest", "oldest"]}
            selected={sortOption}
            onSelect={setSortOption}
            t={t}
          />

          <div className="review-count-label">
            {t("labels.reviewCount", { count: filtered.length })}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="reviews-grid"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
      >
        {filtered.map((review) => (
          <AdminReviewCard
            key={review.ReviewId}
            review={review}
            onManage={() => setSelectedReview(review)}
          />
        ))}
      </motion.div>

      {selectedReview && (
        <OwnerReviewPopup
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          userToken={user.token}
          onRecheckSuccess={(updatedReview) => {
            setReviews((prev) =>
              prev.map((r) =>
                r.ReviewId === updatedReview.ReviewId ? updatedReview : r
              )
            );
            setSelectedReview(updatedReview);
          }}
        />
      )}
    </motion.div>
  );
};

export default OwnerReviews;