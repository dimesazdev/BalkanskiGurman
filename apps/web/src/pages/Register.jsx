import { useState, useEffect } from "react";
import "../styles/General.css";
import "../styles/Auth.css";
import "../styles/Register.css";
import "../styles/Login.css";
import logo from "../../public/dark-logo.svg";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import Button from "../components/Button";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import PhoneNumberPicker from "../components/PhoneNumberPicker";

const Register = () => {
  const { t } = useTranslation();
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

  const [countryList, setCountryList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [allTranslatedCities, setAllTranslatedCities] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("/translatedCountries.json");
        const data = await res.json();
        const lang = i18n.language || "en";
        const translated = data.map((c) => ({
          label: c.translations[lang] || c.name,
          value: c.isoCode,
          originalName: c.name,
        }));
        setCountryList(translated.sort((a, b) => a.label.localeCompare(b.label)));
      } catch (err) {
        console.error("Failed to load country list:", err);
      }
    };

    const loadCityData = async () => {
      try {
        const res = await fetch("/translatedCities.json");
        const data = await res.json();
        setAllTranslatedCities(data);
      } catch (err) {
        console.error("Failed to load city translations:", err);
      }
    };

    fetchCountries();
    loadCityData();
  }, [i18n.language]);

  useEffect(() => {
    if (formData.countryIso) {
      handleCountryChange({ target: { value: formData.countryIso } });
    }
  }, [i18n.language]);

  const countryOptions = countryList.map((c) => ({
    label: c.label,
    value: c.value,
  }));

  const cityOptions = cityList;

  const handleCountryChange = (e) => {
    const isoCode = e.target.value;
    const selectedCountry = countryList.find((c) => c.value === isoCode);
    const lang = i18n.language || "en";

    setFormData((prev) => ({
      ...prev,
      countryIso: isoCode,
      country: selectedCountry?.originalName || "",
      city: "",
    }));

    const translated = allTranslatedCities
      .filter((c) => c.countryCode === isoCode)
      .map((c) => ({
        label: c.translations[lang] || c.name,
        value: c.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    setCityList(translated);
  };

  const handleCityChange = (e) => {
    setFormData((prev) => ({ ...prev, city: e.target.value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        console.log("❌ Registration failed response");
        return;
      }

      alert(t("register.success"));
      window.location.href = "/auth/login";
    } catch (err) {
      console.error("🔥 Error during registration:", err);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="logo-section">
            <img src={logo} style={{ maxWidth: 150 }} />
          </div>
        </div>

        <div className="register-form-section">
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-grid">
              <div className="form-column">
                <FormInput id="name" label={t("register.name") + " *"} name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder={t("register.namePlaceholder")} />
                <FormInput id="email" label={t("register.email") + " *"} name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder={t("register.emailPlaceholder")} />
                <FormSelect label={t("register.country") + " *"} name="countryIso" value={formData.countryIso} onChange={handleCountryChange} options={[{ value: "", label: t("register.countryPlaceholder") }, ...countryOptions]} placeholder={t("register.countryPlaceholder")} />
                <FormInput id="password" label={t("register.password") + " *"} name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder={t("register.passwordPlaceholder")} />
              </div>

              <div className="form-column">
                <FormInput id="surname" label={t("register.surname") + " *"} name="surname" type="text" value={formData.surname} onChange={handleInputChange} placeholder={t("register.surnamePlaceholder")} />
                <PhoneNumberPicker
                  value={{ phoneNumber: formData.phoneNumber }}
                  onChange={({ phoneNumber, countryCode }) =>
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber,
                      countryCode
                    }))
                  }
                />
                <FormSelect label={t("register.city") + " *"} name="city" value={formData.city} onChange={handleCityChange} options={formData.country ? cityOptions.length > 0 ? [{ label: t("register.cityPlaceholder"), value: "" }, ...cityOptions] : [{ label: t("register.noCities"), value: "" }] : []} placeholder={t("register.cityPlaceholder")} required disabled={!formData.country} />
                <FormInput id="retypePassword" label={t("register.retypePassword") + " *"} name="retypePassword" type="password" value={formData.retypePassword} onChange={handleInputChange} placeholder={t("register.retypePasswordPlaceholder")} />
              </div>
            </div>
            <Button type="submit" variant="beige"><p>{t("register.register")}</p></Button>
          </form>
          <div className="login-redirect">
            <h5 className="text-white">{t("register.already")}</h5>
            <Link to="/auth/login" className="login-link">
              <h5>{t("register.loginHere")}</h5>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
