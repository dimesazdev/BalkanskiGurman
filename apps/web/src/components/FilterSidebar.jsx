import React, { useState } from 'react';
import '../styles/FilterSidebar.css';
import { useTranslation } from 'react-i18next';
import mkFlag from '../images/mk-flag-icon.svg';
import srFlag from '../images/sr-flag-icon.svg';
import siFlag from '../images/si-flag-icon.svg';
import baFlag from '../images/ba-flag-icon.svg';
import hrFlag from '../images/hr-flag-icon.svg';
import meFlag from '../images/me-flag-icon.svg';
import intlFlag from '../images/int-flag-icon.svg';
import Icon from "@mdi/react";
import Button from '../components/Button';
import {
  mdiTruckDelivery,
  mdiParking,
  mdiPaw,
  mdiCreditCardCheck,
  mdiTeddyBear,
  mdiSmoking,
  mdiSproutOutline,
  mdiFoodApple,
  mdiBarley,
  mdiFoodHalal,
  mdiStar,
  mdiStarHalfFull,
  mdiStarOutline
} from "@mdi/js";

const FilterSidebar = () => {
  const { t } = useTranslation();

  const [openSections, setOpenSections] = useState({
    price: true,
    rating: false,
    cuisines: false,
    amenities: false,
    hours: false,
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderCheckbox = (label, icon = null, keyOverride = null) => (
    <label className="filter-row" key={keyOverride || label}>
      <input type="checkbox" />
      {icon && (
        typeof icon === 'string' && icon.endsWith('.svg')
          ? <img src={icon} alt={label} className="filter-icon" />
          : <Icon path={icon} size={1} color="#BA3B46" className="amenity-icon" />
      )}
      <span>{label}</span>
    </label>
  );

  const renderStars = (full, half) => {
    const stars = [];
    for (let i = 0; i < full; i++) {
      stars.push(<Icon key={`full-${i}`} path={mdiStar} size={1} color="#BA3B46" />);
    }
    if (half) {
      stars.push(<Icon key="half" path={mdiStarHalfFull} size={1} color="#BA3B46" />);
    }
    const empty = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < empty; i++) {
      stars.push(<Icon key={`empty-${i}`} path={mdiStarOutline} size={1} color="#BA3B46" />);
    }
    return stars;
  };

  return (
    <>
      <input type="checkbox" id="filter-toggle" hidden />
      <label htmlFor="filter-toggle" className="filter-toggle-btn">
        {t('filters.title')}
      </label>

      <div className="filter-sidebar">
        <label htmlFor="filter-toggle" className="filter-close-btn">×</label>

        <div className="filter-header">
          <h2>{t('filters.title')}</h2>
          <Button variant='red'>{t('filters.reset')}</Button>
        </div>

        {[
          {
            key: 'price',
            label: `${t('filters.price')} (${t('labels.perPerson')})`,
            content: [t('labels.priceLow'), t('labels.priceMid'), t('labels.priceHigh')].map(p =>
              renderCheckbox(p)
            )
          },
          {
            key: 'rating',
            label: t('filters.rating'),
            content: [
              { full: 3, half: true },
              { full: 4, half: false },
              { full: 4, half: true }
            ].map(r =>
              renderCheckbox(
                <span className="stars-inline">
                  {renderStars(r.full, r.half)}
                  <span style={{ marginLeft: '5px' }}>{t('filters.up')}</span>
                </span>,
                null,
                `rating-${r.full}-${r.half}`
              )
            )
          },
          {
            key: 'cuisines',
            label: t('filters.cuisines'),
            content: [
              [mkFlag, t('filters.macedonian')],
              [srFlag, t('filters.serbian')],
              [siFlag, t('filters.slovenian')],
              [baFlag, t('filters.bosnian')],
              [hrFlag, t('filters.croatian')],
              [meFlag, t('filters.montenegrin')],
              [intlFlag, t('filters.international')],
            ].map(([icon, label]) => renderCheckbox(label, icon))
          },
          {
            key: 'amenities',
            label: t('filters.amenities'),
            content: [
              [mdiTruckDelivery, t('filters.delivery')],
              [mdiParking, t('filters.parking')],
              [mdiPaw, t('filters.pet')],
              [mdiCreditCardCheck, t('filters.card')],
              [mdiTeddyBear, t('filters.kids')],
              [mdiSmoking, t('filters.smoking')],
              [mdiSproutOutline, t('filters.vegan')],
              [mdiFoodApple, t('filters.vegetarian')],
              [mdiBarley, t('filters.glutenfree')],
              [mdiFoodHalal, t('filters.halal')]
            ].map(([icon, label]) => renderCheckbox(label, icon))
          },
          {
            key: 'hours',
            label: t('filters.hours'),
            content: ['openNow', 'afterMidnight'].map(key =>
              renderCheckbox(t(`filters.${key}`))
            )
          }
        ].map(section => (
          <div key={section.key} className="filter-section">
            <label onClick={() => toggleSection(section.key)}>
              {section.label} {openSections[section.key] ? '▾' : '▸'}
            </label>
            {openSections[section.key] && (
              <div className="filter-options">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default FilterSidebar;
