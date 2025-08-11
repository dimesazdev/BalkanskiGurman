import { useState } from "react";
import "../styles/General.css";
import "../styles/Register.css";
import logo from "../../public/dark-logo.svg";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import { useTranslation } from "react-i18next";
import PhoneNumberPicker from "../components/PhoneNumberPicker";
import CountryPicker from "../components/CountryPicker";
import CityPicker from "../components/CityPicker";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import Loading from "../components/Loading";
import Popup from "../components/Popup";
import { validateFields } from "../utils/validators";
import getApiBaseUrl from "../api/config";
import Icon from '@mdi/react';
import { mdiEyeOutline } from '@mdi/js';

const Register = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    city: "",
    country: "",
    countryIso: "",
    password: "",
    retypePassword: "",
    countryCode: "+389",
  });

  const [loading, setLoading] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateFields(formData, t);

    if (Object.keys(validationErrors).length > 0) {
      showNextPopup(Object.values(validationErrors));
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${formData.countryCode}${formData.phoneNumber}`.replace(/\D/g, "");
      const cleanedCode = formData.countryCode.replace(/\D/g, "");
      const phoneNumberToSend =
        formData.phoneNumber.trim() === "" || fullPhone === cleanedCode
          ? null
          : `${formData.countryCode}${formData.phoneNumber}`;

      const payload = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phoneNumber: phoneNumberToSend,
        city: formData.city.trim() === "" ? null : formData.city,
        country: formData.country,
        password: formData.password,
        language: i18n.language
      };

      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();

        let message = t("alerts.registerError") || "Registration failed.";

        if (res.status === 409) {
          message = t("register.emailExists") || "An account with this email already exists.";
        }

        setActivePopup({
          message,
          variant: "error",
        });

        setLoading(false);
        return;
      }

      setActivePopup({
        message: t("register.success") || "Registration successful! Please check your email to verify your account before logging in.",
        variant: "success",
      });

      setTimeout(() => {
        navigate("/auth/login");
      }, 5000);
    } catch (err) {
      console.error("🔥 Error during registration:", err);
      setActivePopup({
        message: t("alerts.registerError") || "Registration failed.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const showNextPopup = (messages) => {
    if (messages.length === 0) return;
    const [first, ...rest] = messages;
    setActivePopup({ message: first, variant: "error" });
    setTimeout(() => {
      setActivePopup(null);
      showNextPopup(rest);
    }, 5000);
  };

  return (
    <>
      <Navbar />
      {loading && <Loading />}
      <div className="register-container">
        {activePopup && (
          <Popup
            message={activePopup.message}
            variant={activePopup.variant}
            onClose={() => setActivePopup(null)}
          />
        )}
        <motion.div
          className="register-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="register-header"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className="logo-section">
              <img src={logo} style={{ maxWidth: 150 }} />
            </div>
          </motion.div>

          <motion.div
            className="register-form-section"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <form onSubmit={handleSubmit} className="register-form" noValidate>
              <div className="form-grid">
                <FormInput
                  id="name"
                  label={t("register.name") + " *"}
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t("register.namePlaceholder")}
                  required
                />

                <FormInput
                  id="surname"
                  label={t("register.surname") + " *"}
                  name="surname"
                  type="text"
                  value={formData.surname}
                  onChange={handleInputChange}
                  placeholder={t("register.surnamePlaceholder")}
                  required
                />

                <FormInput
                  id="email"
                  label={t("register.email") + " *"}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t("register.emailPlaceholder")}
                  required
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
                  required
                />

                <CityPicker
                  countryIso={formData.countryIso}
                  value={formData.city}
                  onChange={(city) =>
                    setFormData((prev) => ({
                      ...prev,
                      city,
                    }))
                  }
                  disabled={!formData.countryIso}
                />

                <div style={{ position: "relative" }}>
                  <FormInput
                    id="password"
                    name="password"
                    label={t("register.password") + " *"}
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t("register.passwordPlaceholder")}
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
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    onTouchStart={() => setShowPassword(true)}
                    onTouchEnd={() => setShowPassword(false)}
                  />
                </div>

                <div style={{ position: "relative" }}>
                  <FormInput
                    id="retypePassword"
                    name="retypePassword"
                    label={t("register.retypePassword")  + " *"}
                    type={showRetypePassword ? "text" : "password"}
                    value={formData.retypePassword}
                    onChange={handleInputChange}
                    placeholder={t("register.retypePasswordPlaceholder")}
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
                    onMouseDown={() => setShowRetypePassword(true)}
                    onMouseUp={() => setShowRetypePassword(false)}
                    onMouseLeave={() => setShowRetypePassword(false)}
                    onTouchStart={() => setShowRetypePassword(true)}
                    onTouchEnd={() => setShowRetypePassword(false)}
                  />
                </div>
              </div>
              <Button type="submit" variant="beige">
                {t("register.register")}
              </Button>
            </form>
            <div className="login-redirect">
              <h5 className="text-white">{t("register.already")}</h5>
              <Link to="/auth/login" className="login-link">
                <h5>{t("register.loginHere")}</h5>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Register;