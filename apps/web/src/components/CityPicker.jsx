import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { City } from "country-state-city";
import FormSelect from "./FormSelect";
import i18n from "../i18n";

const countriesWithStates = ["US", "CA", "AU"];
const exYuCountries = ["MK", "RS", "HR", "BA", "ME", "SI"];

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

    const rawLang = i18n.language || "en";
    const lang = rawLang.split("-")[0];

    if (exYuCountries.includes(countryIso)) {
      const exYu = translatedCities
        .filter((c) => c.countryCode === countryIso)
        .map((c) => {
          const cityLabel = c.translations?.[lang] || c.translations.en || c.name;
          const metroLabel = c.metroTranslations?.[lang] || c.metro || null;

          return {
            value: c.name,
            label: metroLabel ? `${metroLabel} (${cityLabel})` : cityLabel
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));

      setCityOptions(exYu);
    } else {
      const fallbackCities = City.getCitiesOfCountry(countryIso);

      const localized = fallbackCities.map((city) => {
        const baseLabel =
          translatedCities.find(
            (c) => c.countryCode === countryIso && c.name === city.name
          )?.translations?.[lang] || city.name;

        const label = countriesWithStates.includes(countryIso)
          ? `${baseLabel}, ${city.stateCode}`
          : baseLabel;

        const value = countriesWithStates.includes(countryIso)
          ? `${city.name}, ${city.stateCode}`
          : city.name;

        return { value, label };
      });

      setCityOptions(localized.sort((a, b) => a.label.localeCompare(b.label)));
    }
  }, [countryIso, translatedCities, i18n.language]);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <FormSelect
      label={t("register.city")}
      name="city"
      value={value}
      onChange={handleChange}
      options={
        countryIso
          ? cityOptions.length > 0
            ? [{ label: t("register.cityPlaceholder"), value: "" }, ...cityOptions]
            : [{ label: t("register.noCities"), value: "" }]
          : []
      }
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