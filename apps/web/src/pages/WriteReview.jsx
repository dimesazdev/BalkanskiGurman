import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Title from "../components/Title";
import Button from "../components/Button";
import "../styles/WriteReview.css";
import Icon from "@mdi/react";
import { mdiStar, mdiStarOutline } from "@mdi/js";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import Popup from "../components/Popup";
import { motion } from "framer-motion";
import ImagePicker from "../components/ImagePicker";
import Loading from "../components/Loading";

function WriteReview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();

    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState([]);
    const [agreed, setAgreed] = useState(false);
    const [restaurant, setRestaurant] = useState(null);
    const [showGuidelines, setShowGuidelines] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [popup, setPopup] = useState(null);
    const [showAlert, setShowAlert] = useState(null);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const res = await fetch(`http://localhost:3001/restaurants/${id}`);
                const data = await res.json();
                setRestaurant(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRestaurant();
    }, [id]);

    const handleSubmit = async () => {
        if (!rating) {
            setPopup({ message: t("alerts.reviewRatingRequired"), variant: "error" });
            return;
        }
        if (!comment.trim()) {
            setPopup({ message: t("alerts.reviewTextRequired"), variant: "error" });
            return;
        }
        if (!agreed) {
            setPopup({ message: t("alerts.reviewAgreementRequired"), variant: "error" });
            return;
        }
        if (!user) return;

        setShowAlert({
            message: t("alerts.reviewModerationNotice"),
            buttonText: t("buttons.confirm"),
            cancelText: t("buttons.cancel"),
            onButtonClick: async () => {
                setShowAlert(null);
                setSubmitting(true);

                const formData = new FormData();
                images.forEach(img => formData.append("files", img.file));

                try {
                    const uploadRes = await fetch("http://localhost:3001/upload/review-photos", {
                        method: "POST",
                        body: formData,
                    });

                    const uploadData = await uploadRes.json();
                    const urls = uploadData.urls || [];

                    await fetch(`http://localhost:3001/restaurants/${id}/reviews`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${user.token}`
                        },
                        body: JSON.stringify({
                            rating,
                            comment,
                            photoUrl1: urls[0] || null,
                            photoUrl2: urls[1] || null,
                            photoUrl3: urls[2] || null,
                        }),
                    });

                    navigate(`/restaurants/${id}`, {
                        state: { popup: t("alerts.reviewSuccess") },
                    });
                } catch (err) {
                    console.error("Error submitting review:", err);
                } finally {
                    setSubmitting(false);
                }
            },
            onClose: () => setShowAlert(null),
        });
    };

    if (submitting) return <Loading />;
    if (!restaurant) return <div>{t("alerts.notFound")}</div>;

    return (
        <div className="write-review-container">
            <Title className="write-review-title">{t("titles.writeReview")}</Title>

            <div className="review-grid">
                <motion.div
                    className="restaurant-card-preview"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <img src={restaurant?.images?.[0]?.Url} alt={restaurant?.Name} />
                    <div className="restaurant-bottom">
                        <h3 className="restaurant-name">{restaurant.Name}</h3>
                        <p className="restaurant-address">
                            {restaurant.address?.Street}, {restaurant.address?.City}, {restaurant.address?.Country}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    className="review-form"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <label>{t("labels.rating")} *</label>
                    <div className="stars-row">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Icon
                                key={i}
                                path={i <= (hovered || rating) ? mdiStar : mdiStarOutline}
                                size={1.3}
                                color="var(--red)"
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => setRating(i)}
                                style={{ cursor: "pointer" }}
                            />
                        ))}
                    </div>

                    <label>{t("labels.review")} *</label>
                    <textarea
                        maxLength={300 * 6}
                        rows={6}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", marginBottom: "1rem" }}
                        placeholder={t("placeholders.writeReview")}
                    />

                    <label>{t("form.photos")}</label>
                    <ImagePicker
                        images={images}
                        setImages={setImages}
                        onInvalid={() =>
                            setPopup({
                                message: t("alerts.unsupportedFile"),
                                variant: "error",
                            })
                        }
                        maxImages={3}
                    />

                    <span className="checkbox-wrapper">
                        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                        <span className="agree-label" onClick={() => setShowGuidelines(true)}>
                            <u>{t("checkbox.agree")}</u>
                        </span>
                    </span>

                    <Button variant="red" onClick={handleSubmit}>
                        {t("buttons.postReview")}
                    </Button>
                </motion.div>
            </div>

            {showGuidelines && (
                <Alert
                    message={t("alerts.reviewGuidelines")}
                    buttonText={t("buttons.understand")}
                    cancelText={t("buttons.close")}
                    onButtonClick={() => setShowGuidelines(false)}
                    onClose={() => setShowGuidelines(false)}
                />
            )}

            {popup && (
                <Popup
                    message={popup.message}
                    variant={popup.variant}
                    onClose={() => setPopup(null)}
                    onConfirm={popup.onConfirm}
                />
            )}

            {showAlert && (
                <Alert
                    message={showAlert.message}
                    buttonText={showAlert.buttonText}
                    cancelText={showAlert.cancelText}
                    onButtonClick={showAlert.onButtonClick}
                    onClose={showAlert.onClose}
                />
            )}
        </div>
    );
}

export default WriteReview;