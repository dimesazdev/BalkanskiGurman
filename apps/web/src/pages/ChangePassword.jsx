import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Title from "../components/Title";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import Popup from "../components/Popup";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import "../styles/ChangePassword.css";
import { validateFields } from "../utils/validators";
import { motion } from "framer-motion";

const ChangePassword = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [retypePassword, setRetypePassword] = useState("");
    const [popup, setPopup] = useState(null);
    const [loading, setLoading] = useState(false);

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
            const res = await fetch("http://localhost:3001/auth/change-password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword: retypePassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setPopup({
                    message: data.error || t("changePassword.error"),
                    variant: "error",
                });
                return;
            }

            setPopup({
                message: t("changePassword.success"),
                variant: "success",
            });

            setCurrentPassword("");
            setNewPassword("");
            setRetypePassword("");

            setTimeout(() => navigate("/me"), 2000);
        } catch (err) {
            console.error(err);
            setPopup({
                message: t("changePassword.unexpected"),
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

            <Title>{t("changePassword.title")}</Title>

            <motion.form
                onSubmit={handleSubmit}
                className="change-password-form"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <FormInput
                    id="currentPassword"
                    label={t("changePassword.current")}
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t("changePassword.currentPlaceholder")}
                    required
                />
                <FormInput
                    id="newPassword"
                    label={t("changePassword.new")}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("changePassword.newPlaceholder")}
                    required
                />
                <FormInput
                    id="retypePassword"
                    label={t("changePassword.retype")}
                    type="password"
                    value={retypePassword}
                    onChange={(e) => setRetypePassword(e.target.value)}
                    placeholder={t("changePassword.retypePlaceholder")}
                    required
                />

                <div className="forgot-link">
                    <Link to="/forgot-password">{t("changePassword.forgot")}</Link>
                </div>

                <Button type="submit" variant="red" disabled={loading}>
                    {loading ? t("changePassword.changing") : t("changePassword.button")}
                </Button>
            </motion.form>
        </div>
    );
};

export default ChangePassword;