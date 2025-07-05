import Icon from "@mdi/react";
import {
    mdiClose,
    mdiCheckCircle,
    mdiAlertCircle,
    mdiMedal,
    mdiDiamondStone
} from "@mdi/js";
import Button from "../Button";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import "../../styles/AdminUserPopup.css";

import "dayjs/locale/en";
import "dayjs/locale/mk";
import "dayjs/locale/me";
import "dayjs/locale/sl";

const AdminUserPopup = ({ user: initialUser, onClose, onAction }) => {
    const { t, i18n } = useTranslation();
    const dayjsLocaleMap = { en: "en", mk: "mk", sr: "me", sl: "sl" };
    const user = initialUser;
    dayjs.locale(dayjsLocaleMap[i18n.language] || "en");

    const {
        UserId,
        Name,
        Surname,
        Email,
        EmailConfirmed,
        City,
        Country,
        CreatedAt,
        UpdatedAt,
        SuspendedUntil,
        ProfilePictureUrl,
        _count
    } = initialUser;

    const userStatus = user.status?.Name?.toLowerCase();
    const createdDate = dayjs(CreatedAt).format("D MMMM YYYY");
    const lastUpdateDate = UpdatedAt ? dayjs(UpdatedAt).format("D MMMM YYYY") : "-";
    const role = initialUser?.userRoles?.[0]?.role?.Name?.toLowerCase();

    const isSuspended = userStatus === "suspended" && SuspendedUntil;

    const getMedalIcon = (count) => {
        if (count > 50) return { icon: mdiDiamondStone, color: "#00bfff" };
        if (count >= 26) return { icon: mdiMedal, color: "#ffd700" };
        if (count >= 11) return { icon: mdiMedal, color: "#c0c0c0" };
        if (count >= 1) return { icon: mdiMedal, color: "#cd7f32" };
        return { icon: null, color: "" };
    };

    const handleAction = async (actionType) => {
        onAction?.(user.UserId, actionType);
    };

    return (
        <div className="admin-review-popup">
            <div className="popup-inner">
                <button className="close-btn" onClick={onClose}>
                    <Icon path={mdiClose} size={1} />
                </button>

                <h2>{t("adminUser.userId", { id: UserId })}</h2>

                <div className="user-section">
                    {ProfilePictureUrl ? (
                        <img src={ProfilePictureUrl} alt="User" />
                    ) : (
                        <div className="user-avatar user-avatar-placeholder">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="var(--red)">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                    )}
                    <div className="user-info">
                        <div className="username">
                            {Name} {Surname}
                            {(() => {
                                const { icon, color } = getMedalIcon(_count?.reviews || 0);
                                return icon && <Icon path={icon} size={0.8} color={color} style={{ marginLeft: 6 }} />;
                            })()}
                        </div>
                        <div className="user-meta">
                            {City ? `${City}, ${Country}` : Country} · {_count?.reviews || 0} {t("labels.reviews")}
                        </div>
                        <div className="user-status">
                            {t("adminUser.status")}: <span className={`status ${userStatus}`}>
                                {userStatus === "suspended" && SuspendedUntil
                                    ? `${t("adminUser.suspendedUntil")}: ${dayjs(SuspendedUntil).format("D MMMM YYYY")}`
                                    : t(`userStatus.${userStatus || "active"}`)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="review-section">
                    <p><strong>{t("adminUser.role")}:</strong> {t(`roles.${role}`)}</p>
                    <p><strong>{t("adminUser.email")}:</strong> {Email}</p>
                    <p><strong>{t("adminUser.emailStatus")}:</strong>
                        <Icon path={EmailConfirmed ? mdiCheckCircle : mdiAlertCircle} size={0.6} color={EmailConfirmed ? "green" : "var(--red)"} />
                        {EmailConfirmed ? t("adminUser.verified") : t("adminUser.notVerified")}
                    </p>
                    <p><strong>{t("adminUser.reviewCount")}:</strong> {_count?.reviews || 0}</p>
                    <p><strong>{t("adminUser.createdAt")}:</strong> {createdDate}</p>
                    <p><strong>{t("adminUser.lastUpdate")}:</strong> {lastUpdateDate}</p>
                </div>

                <div className="popup-actions">
                    <Button
                        variant="green"
                        onClick={() => handleAction("activate")}
                        disabled={userStatus === "active"}
                        style={userStatus === "active" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                    >
                        {t("buttons.activate")}
                    </Button>
                    <Button
                        variant="yellow"
                        onClick={() => handleAction("suspend")}
                        disabled={userStatus === "suspended"}
                        style={userStatus === "suspended" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                    >
                        {t("buttons.suspend")}
                    </Button>
                    <Button
                        variant="red"
                        onClick={() => handleAction("ban")}
                        disabled={userStatus === "banned"}
                        style={userStatus === "banned" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                    >
                        {t("buttons.ban")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminUserPopup;