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
import getApiBaseUrl from "../api/config";
import Icon from "@mdi/react";
import { mdiEyeOutline } from "@mdi/js";

const ChangePassword = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [retypePassword, setRetypePassword] = useState("");
    const [popup, setPopup] = useState(null);
    const [loading, setLoading] = useState(false);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showRetype, setShowRetype] = useState(false);

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
            const baseUrl = getApiBaseUrl();
            const res = await fetch(`${baseUrl}/auth/change-password`, {
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

    const renderPasswordField = (id, label, value, setValue, show, setShow, placeholder) => (
        <div style={{ position: "relative" }}>
            <FormInput
                id={id}
                label={label}
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                eye
                required
            />
            <Icon
                path={mdiEyeOutline}
                size={1}
                color={"var(--red)"}
                style={{
                    position: "absolute",
                    right: "20px",
                    top: "70%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                }}
                onMouseDown={() => setShow(true)}
                onMouseUp={() => setShow(false)}
                onMouseLeave={() => setShow(false)}
                onTouchStart={() => setShow(true)}
                onTouchEnd={() => setShow(false)}
            />
        </div>
    );

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
                {renderPasswordField(
                    "currentPassword",
                    t("changePassword.current"),
                    currentPassword,
                    setCurrentPassword,
                    showCurrent,
                    setShowCurrent,
                    t("changePassword.currentPlaceholder")
                )}
                {renderPasswordField(
                    "newPassword",
                    t("changePassword.new"),
                    newPassword,
                    setNewPassword,
                    showNew,
                    setShowNew,
                    t("changePassword.newPlaceholder")
                )}
                {renderPasswordField(
                    "retypePassword",
                    t("changePassword.retype"),
                    retypePassword,
                    setRetypePassword,
                    showRetype,
                    setShowRetype,
                    t("changePassword.retypePlaceholder")
                )}

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