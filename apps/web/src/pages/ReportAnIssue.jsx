import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Title from "../components/Title";
import FormSelect from "../components/FormSelect";
import FormTextarea from "../components/FormTextarea";
import ImagePicker from "../components/ImagePicker";
import Button from "../components/Button";
import Popup from "../components/Popup";
import { useAuth } from "../context/AuthContext";
import "../styles/ReportAnIssue.css";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import RestaurantSelector from "../components/RestaurantSelector";

const ReportAnIssue = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [issueType, setIssueType] = useState("");
    const [explanation, setExplanation] = useState("");
    const [images, setImages] = useState([]);
    const [popup, setPopup] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [loadingRestaurants, setLoadingRestaurants] = useState(false);

    const issueOptions = [
        { value: "Bug Report", label: t("report.issueTypes.bugReport") },
        { value: "Wrong Info", label: t("report.issueTypes.wrongInfo") },
        { value: "Other", label: t("report.issueTypes.other") }
    ];

    useEffect(() => {
        if (issueType === "Wrong Info") {
            setLoadingRestaurants(true);
            fetch("http://localhost:3001/restaurants")
                .then(res => res.json())
                .then(data => setRestaurants(data))
                .catch(console.error)
                .finally(() => setLoadingRestaurants(false));
        }
    }, [issueType]);

    const uploadImages = async () => {
        const imageFiles = images.filter(img => img.file);
        if (imageFiles.length === 0) return [];

        const formData = new FormData();
        imageFiles.forEach(img => formData.append("files", img.file));

        const res = await fetch("http://localhost:3001/upload/restaurant-photos", {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Failed to upload images");
        const data = await res.json();
        return data.urls;
    };

    const handleSubmit = async () => {
        if (!issueType || !explanation.trim()) {
            setPopup({ message: t("report.errorRequired"), variant: "error" });
            return;
        }

        if (issueType === "Wrong Info" && !selectedRestaurant) {
            setPopup({ message: t("report.errorRestaurant"), variant: "error" });
            return;
        }

        setSubmitting(true);

        try {
            const uploadedUrls = await uploadImages();
            const [photo1, photo2, photo3] = uploadedUrls;

            const payload = {
                IssueType: issueType,
                Explanation: explanation,
                PhotoUrl1: photo1 || null,
                PhotoUrl2: photo2 || null,
                PhotoUrl3: photo3 || null,
                RestaurantId: selectedRestaurant?.RestaurantId || null
            };

            const res = await fetch("http://localhost:3001/issues", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error();

            setPopup({ message: t("report.success"), variant: "success" });
            setIssueType("");
            setExplanation("");
            setImages([]);
            setSelectedRestaurant(null);
        } catch (error) {
            console.error(error);
            setPopup({ message: t("report.errorSubmit"), variant: "error" });
        } finally {
            setSubmitting(false);
            setTimeout(() => navigate("/"), 2000);
        }
    };

    if (submitting) return <Loading />;

    return (
        <div className="report-issue-page">
            {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
            <Title className="title">{t("report.title")}</Title>

            <div className="report-issue-form">
                <FormSelect
                    label={t("report.issueType")}
                    name="issueType"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    options={issueOptions}
                    required
                    placeholder={t("report.selectIssueType")}
                />

                {issueType === "Wrong Info" && (
                    <div>
                        <label className="text-white">{t("report.chooseRestaurant")} *</label>
                        {loadingRestaurants ? (
                            <p style={{ color: "white", fontStyle: "italic" }}>Loading restaurants...</p>
                        ) : (
                            <RestaurantSelector
                                restaurants={restaurants}
                                selectedRestaurant={selectedRestaurant}
                                onSelect={(r) => setSelectedRestaurant(r)}
                            />
                        )}
                    </div>
                )}

                <div className="form-group">
                    <label className="text-white">{t("report.addPhotos")}</label>
                    <ImagePicker images={images} setImages={setImages} maxImages={3} />
                </div>

                <FormTextarea
                    id="explanation"
                    label={t("report.explanation")}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder={t("report.explanationPlaceholder")}
                    required
                    rows={4}
                />

                <Button
                    variant="red"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="submit-btn"
                >
                    {submitting ? t("report.submitting") : t("report.submit")}
                </Button>
            </div>
        </div>
    );
};

export default ReportAnIssue;