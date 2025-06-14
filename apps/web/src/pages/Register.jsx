import { useState, useEffect } from "react";
import "../styles/General.css"
import "../styles/Auth.css";
import "../styles/Register.css";
import "../styles/Login.css"
import logo from "../../public/dark-logo.svg";
import { Link } from "react-router-dom";
import { Country, City } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import Button from "../components/Button";
import { useTranslation } from "react-i18next";

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

  useEffect(() => {
    setCountryList(Country.getAllCountries());
  }, []);

  const countryOptions = countryList.map((c) => ({
    label: c.name,
    value: c.isoCode,
  }));

  const cityOptions = cityList.map((c) => ({
    label: c.name,
    value: c.name,
  }));

  const handleCountryChange = (e) => {
    const isoCode = e.target.value;
    const selectedCountry = countryList.find((c) => c.isoCode === isoCode);

    setFormData((prev) => ({
      ...prev,
      countryIso: isoCode,
      country: selectedCountry?.name || "",
      city: "",
    }));

    setCityList(City.getCitiesOfCountry(isoCode));
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
      const fullPhone = `${formData.countryCode}${formData.phoneNumber}`.replace(/\D/g, '');
      const cleanedCode = formData.countryCode.replace(/\D/g, '');

      const phoneNumberToSend =
        formData.phoneNumber.trim() === '' || fullPhone === cleanedCode
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

      const data = await res.json();

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
                <FormInput id="name" label={t("register.name") + ' *'} name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder={t("register.namePlaceholder")} required />
                <FormInput id="email" label={t("register.email") + ' *'} name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder={t("register.emailPlaceholder")} required />
                <FormSelect label={t("register.country") + ' *'} name="countryIso" value={formData.countryIso} onChange={handleCountryChange} options={[{ value: "" }, ...countryOptions]} placeholder={t("register.countryPlaceholder")} required />
                <FormInput id="password" label={t("register.password") + ' *'} name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder={t("register.passwordPlaceholder")} required />
              </div>

              <div className="form-column">
                <FormInput id="surname" label={t("register.surname") + ' *'} name="surname" type="text" value={formData.surname} onChange={handleInputChange} placeholder={t("register.surnamePlaceholder")} required />
                <div className="form-group">
                  <label htmlFor="phoneNumber" className="text-white">{t("register.phone")}</label>
                  <PhoneInput
                    country={"mk"}
                    value={formData.phoneNumber}
                    onChange={(phone, countryData) => {
                      setFormData((prev) => ({ ...prev, phoneNumber: phone, countryCode: `+${countryData.dialCode}` }));
                    }}
                    inputProps={{ name: "phone" }}
                    containerClass="custom-phone-container"
                    inputClass="custom-phone-input"
                    buttonClass="custom-phone-button"
                    dropdownClass="custom-phone-dropdown"
                  />
                </div>
                <FormSelect label={t("register.city") + ' *'} name="city" value={formData.city} onChange={handleCityChange} options={formData.country ? cityOptions.length > 0 ? [{ label: t("register.selectCity"), value: "" }, ...cityOptions] : [{ label: t("register.noCities"), value: "" }] : []} placeholder={t("register.cityPlaceholder")} required disabled={!formData.country} />
                <FormInput id="retypePassword" label={t("register.retypePassword") + ' *'} name="retypePassword" type="password" value={formData.retypePassword} onChange={handleInputChange} placeholder={t("register.retypePasswordPlaceholder")} required />
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