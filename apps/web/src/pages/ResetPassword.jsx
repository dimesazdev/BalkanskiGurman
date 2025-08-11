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
import getApiBaseUrl from "../api/config";
import Icon from "@mdi/react";
import { mdiEyeOutline } from "@mdi/js";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [retypePassword, setRetypePassword] = useState("");
    const [popup, setPopup] = useState(null);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { search } = useLocation();
    const [token, setToken] = useState("");

    const [showNew, setShowNew] = useState(false);
    const [showRetype, setShowRetype] = useState(false);

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
            const baseUrl = getApiBaseUrl();
            const res = await fetch(`${baseUrl}/auth/reset-password`, {
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
            <Title>{t("resetPassword.title")}</Title>
            <motion.form
                onSubmit={handleSubmit}
                className="change-password-form"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {renderPasswordField(
                    "newPassword",
                    t("resetPassword.new"),
                    newPassword,
                    setNewPassword,
                    showNew,
                    setShowNew,
                    t("resetPassword.newPlaceholder")
                )}
                {renderPasswordField(
                    "retypePassword",
                    t("resetPassword.retype"),
                    retypePassword,
                    setRetypePassword,
                    showRetype,
                    setShowRetype,
                    t("resetPassword.retypePlaceholder")
                )}
                <Button type="submit" variant="red" disabled={loading}>
                    {loading ? t("resetPassword.resetting") : t("resetPassword.button")}
                </Button>
            </motion.form>
        </div>
    );
};

export default ResetPassword;