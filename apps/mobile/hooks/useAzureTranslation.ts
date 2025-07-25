import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getApiBaseUrl } from '@/api/config';

export const useAzureTranslation = (text: string) => {
  const { i18n } = useTranslation();
  const [state, setState] = useState({ translatedText: "", detectedLanguage: "" });

  useEffect(() => {
    if (!text) return;

    const fetchTranslation = async () => {
      try {
        const baseUrl = await getApiBaseUrl();
        const res = await fetch(`${baseUrl}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, to: i18n.language })
        });

        const data = await res.json();
        setState({
          translatedText: data.translatedText,
          detectedLanguage: data.detectedLanguage,
        });
      } catch (error) {
        console.error("Translation failed:", error);
        setState({ translatedText: "", detectedLanguage: "" });
      }
    };

    fetchTranslation();
  }, [text, i18n.language]);

  return state;
};
