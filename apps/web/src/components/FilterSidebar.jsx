import React from "react";
import "../styles/FilterSidebar.css";
import { useTranslation } from "react-i18next";
import Icon from "@mdi/react";
import Button from "./Button";
import {
  mdiStar,
  mdiStarHalfFull,
  mdiStarOutline
} from "@mdi/js";
import mk from "../images/mk-flag-icon.svg";
import sr from "../images/sr-flag-icon.svg";
import sl from "../images/si-flag-icon.svg";
import ba from "../images/ba-flag-icon.svg";
import hr from "../images/hr-flag-icon.svg";
import me from "../images/me-flag-icon.svg";
import intl from "../images/int-flag-icon.svg";
import { getAmenityIcon } from "../utils/getAmenityIcon";

const cuisineOptions = [
  { code: "MK", label: "filters.macedonian", icon: mk },
  { code: "SR", label: "filters.serbian", icon: sr },
  { code: "SL", label: "filters.slovenian", icon: sl },
  { code: "BA", label: "filters.bosnian", icon: ba },
  { code: "HR", label: "filters.croatian", icon: hr },
  { code: "ME", label: "filters.montenegrin", icon: me },
  { code: "INT", label: "filters.international", icon: intl }
];

const amenityOptions = [
  { code: "DELIV", label: "filters.delivery" },
  { code: "PARK", label: "filters.parking" },
  { code: "PET", label: "filters.pet" },
  { code: "CARD", label: "filters.card" },
  { code: "KIDS", label: "filters.kids" },
  { code: "SMOK", label: "filters.smoking" },
  { code: "VEGAN", label: "filters.vegan" },
  { code: "VEGE", label: "filters.vegetarian" },
  { code: "GLUT", label: "filters.glutenfree" },
  { code: "HALAL", label: "filters.halal" }
];

const FilterSidebar = ({ filters, onChange }) => {
  const { t } = useTranslation();

  const toggle = (category, value) => {
    const current = filters[category] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [category]: updated });
  };

  const renderCheckbox = (category, code, label, iconPath = null) => (
    <label key={code} className="filter-row">
      <input
        type="checkbox"
        checked={filters[category]?.includes(code) || false}
        onChange={() => toggle(category, code)}
      />
      {iconPath && (
        typeof iconPath === "string" && iconPath.startsWith("M")
          ? <Icon path={iconPath} size={1} color="#BA3B46" className="amenity-icon" />
          : <img src={iconPath} alt={label} className="filter-icon" />
      )}
      <span>{t(label)}</span>
    </label>
  );

  const renderStarsRow = (value) => {
    const stars = [];
    const full = Math.floor(value);
    const hasHalf = value % 1 !== 0;

    for (let i = 0; i < full; i++) {
      stars.push(<Icon key={`full-${i}`} path={mdiStar} size={1} color="#BA3B46" />);
    }
    if (hasHalf) {
      stars.push(<Icon key="half" path={mdiStarHalfFull} size={1} color="#BA3B46" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Icon key={`empty-${i}`} path={mdiStarOutline} size={1} color="#BA3B46" />);
    }

    return stars;
  };

  return (
    <>
      <input type="checkbox" id="filter-toggle" hidden />
      <label htmlFor="filter-toggle" className="filter-toggle-btn">
        {t("filters.title")}
      </label>

      <div className="filter-sidebar">
        <label htmlFor="filter-toggle" className="filter-close-btn">×</label>

        <div className="filter-header">
          <h2>{t("filters.title")}</h2>
          <Button variant="red" onClick={() => onChange({
            price: [], rating: [], cuisines: [], amenities: [], hours: []
          })}>{t("filters.reset")}</Button>
        </div>

        <div className="filter-section">
          <label>{t("filters.price")}</label>
          {[{ code: 1, label: "5-10€" }, { code: 2, label: "10-20€" }, { code: 3, label: "20€+" }]
            .map(p => renderCheckbox("price", p.code, p.label))}
        </div>

        <div className="filter-section">
          <label>{t("filters.rating")}</label>
          {[3.5, 4, 4.5].map(r => (
            <label key={r} className="filter-row">
              <input
                type="checkbox"
                checked={filters.rating?.includes(r)}
                onChange={() => toggle("rating", r)}
              />
              <span className="stars-inline">
                {renderStarsRow(r)}
              </span>
              <span style={{ marginLeft: "0.3rem" }}>{t("filters.up")}</span>
            </label>
          ))}
        </div>

        <div className="filter-section">
          <label>{t("filters.cuisines")}</label>
          {cuisineOptions.map(c =>
            renderCheckbox("cuisines", c.code, c.label, c.icon)
          )}
        </div>

        <div className="filter-section">
          <label>{t("filters.amenities")}</label>
          {amenityOptions.map(a =>
            renderCheckbox("amenities", a.code, a.label, getAmenityIcon(a.code))
          )}
        </div>

        <div className="filter-section">
          <label>{t("filters.hours")}</label>
          {["openNow", "afterMidnight"].map(h =>
            renderCheckbox("hours", h, `filters.${h}`)
          )}
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;