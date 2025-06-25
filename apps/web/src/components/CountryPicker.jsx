import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import FormSelect from "./FormSelect";
import i18n from "../i18n";

const CountryPicker = ({ value, onChange, required = false, disabled = false }) => {
  const { t } = useTranslation();
  const [countryList, setCountryList] = useState([]);

  const lang = i18n.language || "en";

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("/translatedCountries.json");
        const data = await res.json();
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
    fetchCountries();
  }, [lang]);

  const handleChange = (e) => {
    const countryIso = e.target.value;
    const selected = countryList.find((c) => c.value === countryIso);
    onChange({
      countryIso,
      countryName: selected?.originalName || "",
    });
  };

  return (
    <FormSelect
      label={t("register.country") + " *"}
      name="countryIso"
      value={value}
      onChange={handleChange}
      options={[{ value: "", label: t("register.countryPlaceholder") }, ...countryList]}
      placeholder={t("register.countryPlaceholder")}
      required={required}
      disabled={disabled}
    />
  );
};

CountryPicker.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default CountryPicker;