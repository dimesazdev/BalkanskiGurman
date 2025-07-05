import { useState } from "react";
import Title from "../components/Title";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import Popup from "../components/Popup";
import { useTranslation } from "react-i18next";
import "../styles/ChangePassword.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [popup, setPopup] = useState(null);
    const [loading, setLoading] = useState(false);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3001/auth/request-password-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    language: i18n.language
                }),
            });

            const data = await res.json();

            setPopup({
                message: t("forgotPassword.success"),
                variant: "success",
            });
            setEmail("");
            setTimeout(() => {
                navigate("/auth/login");
            }, 3000);
        } catch (err) {
            console.error(err);
            setPopup({
                message: t("forgotPassword.error"),
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-container">
            {popup && (
                <Popup
                    message={popup.message}
                    variant={popup.variant}
                    onClose={() => setPopup(null)}
                />
            )}
            <Title>{t("forgotPassword.title")}</Title>
            <motion.form
                onSubmit={handleSubmit}
                className="change-password-form"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <FormInput
                    id="email"
                    label={t("forgotPassword.email")}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("forgotPassword.emailPlaceholder")}
                    required
                />
                <Button type="submit" variant="red" disabled={loading}>
                    {loading ? t("forgotPassword.sending") : t("forgotPassword.button")}
                </Button>
            </motion.form>
        </div>
    );
};

export default ForgotPassword;