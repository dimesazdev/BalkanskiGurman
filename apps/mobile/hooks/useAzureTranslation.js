import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export const useAzureTranslation = (text) => {
  const { i18n } = useTranslation();
  const [state, setState] = useState({ translatedText: "", detectedLanguage: "" });

  useEffect(() => {
    if (!text) return;

    const fetchTranslation = async () => {
      try {
        const res = await fetch("http://localhost:3001/translate", {
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
