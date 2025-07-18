import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './assets/locales/en/translation.json';
import mk from './assets/locales/mk/translation.json';
import sr from './assets/locales/sr/translation.json';
import sl from './assets/locales/sl/translation.json';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en', 
    resources: {
      en: { translation: en },
      mk: { translation: mk },
      sr: { translation: sr },
      sl: { translation: sl },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;