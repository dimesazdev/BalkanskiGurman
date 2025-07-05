import { useState, useEffect } from "react";
import Icon from "@mdi/react";
import { mdiClose, mdiMedal, mdiDiamondStone } from "@mdi/js";
import Button from "../Button";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "../../styles/AdminIssuePopup.css";
import ImageGallery from "../ImageGallery";
import { useAzureTranslation } from "../../hooks/useAzureTranslation";

const AdminIssuePopup = ({ issue, onClose, onResolve }) => {
  const { t, i18n } = useTranslation();
  const user = issue.user;

  const dayjsLocaleMap = { en: "en", mk: "mk", sr: "me", sl: "sl" };
  dayjs.locale(dayjsLocaleMap[i18n.language] || "en");

  const getMedalIcon = (count) => {
    if (count > 50) return { icon: mdiDiamondStone, color: "#00bfff" };
    if (count >= 26) return { icon: mdiMedal, color: "#ffd700" };
    if (count >= 11) return { icon: mdiMedal, color: "#c0c0c0" };
    if (count >= 1) return { icon: mdiMedal, color: "#cd7f32" };
    return { icon: null, color: "" };
  };

  const { icon, color } = getMedalIcon(user._count?.reviews || 0);
  const userStatus = user.status?.Name?.toLowerCase();
  const images = [issue.PhotoUrl1, issue.PhotoUrl2, issue.PhotoUrl3]
    .filter(Boolean)
    .map((url) => ({ Url: url }));

  // Azure Translation for Explanation
  const translationResult = useAzureTranslation(issue.Explanation || "");
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");

  useEffect(() => {
    setTranslatedText(translationResult.translatedText);
    setDetectedLanguage(translationResult.detectedLanguage);
  }, [translationResult]);

  const shouldTranslate =
    detectedLanguage &&
    detectedLanguage !== i18n.language &&
    translatedText;

  return (
    <div className="admin-issue-popup">
      <div className="popup-inner">
        <button className="close-btn" onClick={onClose}>
          <Icon path={mdiClose} size={1} />
        </button>

        <h2>{t("adminIssue.issueId", { id: issue.IssueId })}</h2>

        <div className="user-section">
          {user.ProfilePictureUrl ? (
            <img src={user.ProfilePictureUrl} alt="User" />
          ) : (
            <div className="user-avatar user-avatar-placeholder">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="var(--red)">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
          <div className="user-info">
            <div className="username">
              {user.Name} {user.Surname?.charAt(0)}.
              {icon && (
                <Icon
                  path={icon}
                  size={0.8}
                  color={color}
                  style={{ marginLeft: 6 }}
                />
              )}
            </div>
            <div className="user-meta">
              {user.City ? `${user.City}, ${user.Country}` : user.Country}
            </div>
            <div className="user-status">
              {t("adminUser.status")}:{" "}
              <span className={`status ${userStatus}`}>
                {t(`userStatus.${userStatus}`)}
              </span>
            </div>
          </div>
        </div>

        <div className="review-section">
          <p>
            <strong>{t("adminUser.role")}:</strong>{" "}
            {t(`roles.${user.userRoles?.[0]?.role?.Name?.toLowerCase()}`)}
          </p>
          <p>
            <strong>{t("adminUser.email")}:</strong> {user.Email}
          </p>
          <p>
            <strong>{t("adminIssue.status")}:</strong>{" "}
            <span className={`status ${issue.status?.Name?.toLowerCase()}`}>
              {t(`issueStatus.${issue.status?.Name?.toLowerCase()}`)}
            </span>
          </p>
          <p>
            <strong>{t("adminIssue.type")}:</strong>{" "}
            {t(`report.issueTypes.${issue.IssueType === "Wrong Info"
              ? "wrongInfo"
              : issue.IssueType === "Bug Report"
                ? "bugReport"
                : "other"
              }`)}
          </p>

          {issue.IssueType === "Wrong Info" && issue.restaurant && (
            <>
              <p><strong>{t("adminIssue.forRestaurant")}:</strong></p>
              <div className="related-restaurant-card">
                <img
                  src={issue.restaurant.images?.[0]?.Url || "/default-restaurant.jpg"}
                  alt={issue.restaurant.Name}
                />
                <div className="restaurant-info">
                  <p className="restaurant-name">{issue.restaurant.Name}</p>
                  <p className="restaurant-address">
                    {issue.restaurant.address?.Street}, {issue.restaurant.address?.City}, {issue.restaurant.address?.Country}
                  </p>
                </div>
                <Button
                  variant="red-outline"
                  onClick={() => window.open(`/restaurants/${issue.restaurant.RestaurantId}`, "_blank")}
                >
                  {t("buttons.view")}
                </Button>
              </div>
            </>
          )}

          <div className="comment-line">
            <p><strong>{t("adminIssue.explanation")}:</strong></p>
            <p>{issue.Explanation}</p>
            {shouldTranslate && (
              <div style={{ marginTop: "8px", opacity: 0.9 }}>
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid var(--red)",
                    opacity: 0.5,
                  }}
                />
                <p style={{ fontStyle: "italic", textAlign: "justify" }}>
                  {translatedText}
                </p>
                <span style={{ fontSize: "0.85em", color: "var(--red)" }}>
                  {t("labels.aiTranslated")}
                </span>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <>
              <p><strong>{t("adminIssue.images")}:</strong></p>
              <div style={{ maxWidth: "500px" }}>
                <ImageGallery images={images} arrowColor="var(--red)" />
              </div>
            </>
          )}
        </div>

        <div className="popup-actions">
          <Button
            variant="green"
            onClick={onResolve}
            disabled={issue.status?.Name?.toLowerCase() === "resolved"}
            style={
              issue.status?.Name?.toLowerCase() === "resolved"
                ? { opacity: 0.5, cursor: "not-allowed" }
                : {}
            }
          >
            {t("buttons.resolve")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminIssuePopup;