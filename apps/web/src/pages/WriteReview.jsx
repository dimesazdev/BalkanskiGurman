import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Title from "../components/Title";
import Button from "../components/Button";
import "../styles/WriteReview.css";
import Icon from "@mdi/react";
import { mdiImage, mdiStar, mdiStarOutline } from "@mdi/js";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

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
    const [dragOver, setDragOver] = useState(false);
    const [restaurant, setRestaurant] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [showGuidelines, setShowGuidelines] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:3001/restaurants/${id}`)
            .then(res => res.json())
            .then(data => setRestaurant(data))
            .catch(console.error);
    }, [id]);

    const isValidImage = (file) => {
        const validTypes = ["image/png", "image/jpeg", "image/jpg"];
        return validTypes.includes(file.type);
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (!files.every(isValidImage)) {
            setShowAlert(true);
            return;
        }

        const newImages = files.slice(0, 3 - images.length).map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.every(isValidImage)) {
            setShowAlert(true);
            return;
        }

        const newImages = files.slice(0, 3 - images.length).map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const handleSubmit = async () => {
        if (!rating || !comment.trim() || !agreed) return;
        if (!user) return;

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
        }
    };

    if (!restaurant) return <div>Loading...</div>;

    return (
        <div className="write-review-container">
            <Title className="write-review-title">{t("titles.writeReview")}</Title>

            <div className="review-grid">
                <div className="restaurant-card-preview">
                    <img src={restaurant?.images?.[0]?.Url} alt={restaurant?.Name} />
                    <div className="restaurant-bottom">
                        <h3 className="restaurant-name">{restaurant.Name}</h3>
                        <p className="restaurant-address">
                            {restaurant.address?.Street}, {restaurant.address?.City}, {restaurant.address?.Country}
                        </p>
                    </div>
                </div>

                <div className="review-form">
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
                        style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", marginBottom: "2rem" }}
                        placeholder={t("placeholders.writeReview")}
                    />

                    <label>{t("labels.addPhotos")}</label>
                    <div
                        className={`image-drop-zone ${dragOver ? "drag-over" : ""}`}
                        onDrop={handleImageDrop}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                    >
                        {images.map((img, i) => (
                            <div
                                key={i}
                                className="image-wrapper"
                                onMouseEnter={(e) => e.currentTarget.classList.add("hover")}
                                onMouseLeave={(e) => e.currentTarget.classList.remove("hover")}
                            >
                                <img src={img.url} alt={`Upload ${i}`} />
                                <Button
                                    variant="red"
                                    className="remove-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setImages(prev => prev.filter((_, index) => index !== i));
                                    }}
                                >
                                    {t("buttons.remove")}
                                </Button>
                            </div>
                        ))}

                        {images.length < 3 && (
                            <label className="upload-placeholder">
                                <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
                                <div className="upload-square" style={{ textAlign: "center" }}>
                                    <Icon path={mdiImage} size={1.5} color="var(--red)" />
                                    <div>{t("labels.chooseOrDrop")}</div>
                                </div>
                            </label>
                        )}
                    </div>

                    <span className="checkbox-wrapper">
                        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                        <span className="agree-label" onClick={() => setShowGuidelines(true)}>
                            <u>{t("checkbox.agree")}</u>
                        </span>
                    </span>

                    <Button variant="red" onClick={handleSubmit}>
                        {t("buttons.postReview")}
                    </Button>
                </div>
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

            {showAlert && (
                <Alert
                    message={t("alerts.unsupportedFile")}
                    buttonText={t("buttons.close")}
                    onButtonClick={() => setShowAlert(false)}
                    onClose={() => setShowAlert(false)}
                    showCancel={false}
                />
            )}
        </div>
    );
}

export default WriteReview;
