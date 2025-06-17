const cache = new Map();

export const getCachedTranslation = (text, lang) => {
  return cache.get(`${text}_${lang}`) || localStorage.getItem(`${text}_${lang}`);
};

export const setCachedTranslation = (text, lang, translated) => {
  cache.set(`${text}_${lang}`, translated);
  localStorage.setItem(`${text}_${lang}`, translated);
};