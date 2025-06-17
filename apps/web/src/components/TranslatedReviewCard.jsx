import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useAzureTranslation } from "../hooks/useAzureTranslation";
import ReviewCard from "./ReviewCard";

const TranslatedReviewCard = ({ review }) => {
    const { i18n } = useTranslation();
    const [translatedText, setTranslatedText] = useState("");
    const [detectedLanguage, setDetectedLanguage] = useState("");

    const translationResult = useAzureTranslation(review.Comment);

    useEffect(() => {
        setTranslatedText(translationResult.translatedText);
        setDetectedLanguage(translationResult.detectedLanguage);
    }, [translationResult]);

    const shouldTranslate =
        detectedLanguage && detectedLanguage !== i18n.language && translatedText;

    return (
        <ReviewCard review={review}>
            {shouldTranslate && (
                <div style={{ marginTop: "8px", opacity: 0.9 }}>
                    <hr style={{
                        border: "none",
                        borderTop: "1px solid var(--red)",
                        opacity: 0.5
                    }} />
                    <p style={{ fontStyle: "italic", textAlign:"justify" }}>{translatedText}</p>
                    <span style={{ fontSize: "0.85em", color: "var(--red)" }}>
                        {i18n.t("labels.aiTranslated")}
                    </span>
                </div>
            )}
        </ReviewCard>
    );
};

export default TranslatedReviewCard;
