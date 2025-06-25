import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { City } from "country-state-city";
import FormSelect from "./FormSelect";
import i18n from "../i18n";

const CityPicker = ({ countryIso, value, onChange, required = false, disabled = false }) => {
  const { t } = useTranslation();
  const [translatedCities, setTranslatedCities] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  const lang = i18n.language || "en";

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("/translatedCities.json");
        const data = await res.json();
        setTranslatedCities(data);
      } catch (err) {
        console.error("Failed to load city translations:", err);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (!countryIso) return;
    const fallbackCities = City.getCitiesOfCountry(countryIso);
    const localized = fallbackCities.map((city) => {
      const override = translatedCities.find(
        (c) => c.countryCode === countryIso && c.name === city.name
      );
      return {
        value: city.name,
        label: override?.translations?.[lang] || city.name,
      };
    });
    setCityOptions(localized.sort((a, b) => a.label.localeCompare(b.label)));
  }, [countryIso, translatedCities, lang]);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <FormSelect
      label={t("register.city") + " *"}
      name="city"
      value={value}
      onChange={handleChange}
      options={countryIso ? cityOptions.length > 0 ? [{ label: t("register.cityPlaceholder"), value: "" }, ...cityOptions] : [{ label: t("register.noCities"), value: "" }] : []}
      placeholder={t("register.cityPlaceholder")}
      required={required}
      disabled={!countryIso || disabled}
    />
  );
};

CityPicker.propTypes = {
  countryIso: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default CityPicker;