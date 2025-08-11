import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CompleteProfile.css";
import Button from "../components/Button";
import CountryPicker from "../components/CountryPicker";
import CityPicker from "../components/CityPicker";
import PhoneNumberPicker from "../components/PhoneNumberPicker";
import { useAuth } from "../context/AuthContext";
import Title from "../components/Title";
import Loading from "../components/Loading";
import Popup from "../components/Popup";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import getApiBaseUrl from "../api/config";

const CompleteProfile = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [popup, setPopup] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        countryIso: "",
        country: "",
        city: "",
        phoneNumber: "",
        countryCode: "",
    });

    useEffect(() => {
        if (!user) navigate("/auth/login");
    }, [user, navigate]);

    const formRef = useRef(null);
    const isInView = useInView(formRef, { once: true });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.country) {
            setPopup({
                message: t("completeProfile.selectCountry"),
                variant: "error",
            });
            return;
        }

        setLoading(true);
        setPopup(null);

        try {
            const baseUrl = getApiBaseUrl();

            const normalizedPhone =
                formData.phoneNumber && formData.phoneNumber.trim().length > 0
                    ? formData.phoneNumber.startsWith("+")
                        ? formData.phoneNumber
                        : `+${formData.phoneNumber}`
                    : null;

            const payload = {
                Country: formData.country,
                City: formData.city || "",
                PhoneNumber: normalizedPhone,
                CountryIso: formData.countryCode || "",
            };

            const res = await fetch(`${baseUrl}/auth/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                setPopup({
                    message: data.error || t("completeProfile.updateFailed"),
                    variant: "error",
                });
                setLoading(false);
                return;
            }

            await refreshUser();
            setPopup({ message: t("completeProfile.success"), variant: "success" });

            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            console.error(err);
            setPopup({ message: t("completeProfile.error"), variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="complete-profile">
            <Title>{t("completeProfile.title")}</Title>

            {popup && (
                <Popup
                    message={popup.message}
                    variant={popup.variant}
                    onClose={() => setPopup(null)}
                />
            )}

            {loading ? (
                <Loading />
            ) : (
                <motion.form
                    className="complete-profile-form"
                    ref={formRef}
                    initial={{ opacity: 0, x: -60 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    onSubmit={handleSubmit}
                >
                    <CountryPicker
                        value={formData.countryIso}
                        onChange={({ countryIso, countryName }) =>
                            setFormData((prev) => ({
                                ...prev,
                                countryIso,
                                country: countryName,
                                city: "",
                            }))
                        }
                    />

                    <CityPicker
                        countryIso={formData.countryIso}
                        value={formData.city}
                        onChange={(city) =>
                            setFormData((prev) => ({ ...prev, city }))
                        }
                        disabled={!formData.countryIso}
                    />

                    <PhoneNumberPicker
                        value={{ phoneNumber: formData.phoneNumber }}
                        onChange={({ phoneNumber, countryCode }) =>
                            setFormData((prev) => ({
                                ...prev,
                                phoneNumber,
                                countryCode, 
                            }))
                        }
                    />

                    <Button variant="red" type="submit" disabled={loading}>
                        {t("completeProfile.button")}
                    </Button>
                </motion.form>
            )}
        </div>
    );
};

export default CompleteProfile;