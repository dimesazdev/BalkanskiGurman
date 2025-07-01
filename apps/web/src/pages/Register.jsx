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

const Register = () => {
  const { t } = useTranslation();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
        city: formData.city,
        country: formData.country,
        password: formData.password,
      };

      const res = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setActivePopup({
          message: t("alerts.registerError") || "Registration failed.",
          variant: "error",
        });
        setLoading(false);
        return;
      }

      setActivePopup({
        message: t("register.success") || "Registration successful!",
        variant: "success",
      });

      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
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

  if (loading) return <Loading />;

  return (
    <>
      <Navbar />
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
                <div className="form-column">
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
                    id="email"
                    label={t("register.email") + " *"}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t("register.emailPlaceholder")}
                    required
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
                  <FormInput
                    id="password"
                    label={t("register.password") + " *"}
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t("register.passwordPlaceholder")}
                    required
                  />
                </div>

                <div className="form-column">
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
                  <CityPicker
                    countryIso={formData.countryIso}
                    value={formData.city}
                    onChange={(city) =>
                      setFormData((prev) => ({
                        ...prev,
                        city,
                      }))
                    }
                    required
                    disabled={!formData.countryIso}
                  />
                  <FormInput
                    id="retypePassword"
                    label={t("register.retypePassword") + " *"}
                    name="retypePassword"
                    type="password"
                    value={formData.retypePassword}
                    onChange={handleInputChange}
                    placeholder={t("register.retypePasswordPlaceholder")}
                    required
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