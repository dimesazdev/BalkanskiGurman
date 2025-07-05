import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../components/Title";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import Popup from "../components/Popup";
import { useTranslation } from "react-i18next";
import "../styles/ChangePassword.css";
import { validateFields } from "../utils/validators";
import { motion } from "framer-motion";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [retypePassword, setRetypePassword] = useState("");
    const [popup, setPopup] = useState(null);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { search } = useLocation();

    const [token, setToken] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(search);
        const tokenFromUrl = params.get("token");
        if (!tokenFromUrl) {
            setPopup({
                message: t("resetPassword.invalid"),
                variant: "error",
            });
        } else {
            setToken(tokenFromUrl);
        }
    }, [search, t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateFields(
            {
                password: newPassword,
                retypePassword: retypePassword
            },
            t
        );

        if (Object.keys(validationErrors).length > 0) {
            const firstError = validationErrors.password || validationErrors.retypePassword;
            setPopup({
                message: firstError,
                variant: "error",
            });
            return;
        }

        setLoading(true);
        try {
            console.log({
                token,
                newPassword,
                confirmPassword: retypePassword
            });

            const res = await fetch("http://localhost:3001/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    newPassword,
                    confirmPassword: retypePassword,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setPopup({
                    message: t("resetPassword.error"),
                    variant: "error",
                });
                return;
            }

            setPopup({
                message: t("resetPassword.success"),
                variant: "success",
            });

            setTimeout(() => navigate("/auth/login"), 3000);
        } catch (err) {
            console.error(err);
            setPopup({
                message: t("resetPassword.unexpected"),
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
            <Title>{t("resetPassword.title")}</Title>
            <motion.form
                onSubmit={handleSubmit}
                className="change-password-form"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <FormInput
                    id="newPassword"
                    label={t("resetPassword.new")}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("resetPassword.newPlaceholder")}
                    required
                />
                <FormInput
                    id="retypePassword"
                    label={t("resetPassword.retype")}
                    type="password"
                    value={retypePassword}
                    onChange={(e) => setRetypePassword(e.target.value)}
                    placeholder={t("resetPassword.retypePlaceholder")}
                    required
                />
                <Button type="submit" variant="red" disabled={loading}>
                    {loading ? t("resetPassword.resetting") : t("resetPassword.button")}
                </Button>
            </motion.form>
        </div>
    );
};

export default ResetPassword;