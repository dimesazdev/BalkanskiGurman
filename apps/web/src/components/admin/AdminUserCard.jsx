import Icon from "@mdi/react";
import { mdiMedal, mdiDiamondStone } from "@mdi/js";
import Button from "../Button";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "../../styles/AdminUserCard.css";

const AdminUserCard = ({ user, onManage }) => {
    const { t, i18n } = useTranslation();
    const dayjsLocaleMap = { en: "en", mk: "mk", sr: "me", sl: "sl" };
    dayjs.locale(dayjsLocaleMap[i18n.language] || "en");

    const {
        UserId,
        Name,
        Surname,
        Email,
        City,
        Country,
        CreatedAt,
        _count,
        role,
        ProfilePictureUrl
    } = user;

    const formattedDate = dayjs(CreatedAt).format("D MMMM YYYY");
    const statusLabel = user.status?.Name?.toLowerCase();

    const getMedalIcon = (count) => {
        if (count > 50) return { icon: mdiDiamondStone, color: "#00bfff" };
        if (count >= 26) return { icon: mdiMedal, color: "#ffd700" };
        if (count >= 11) return { icon: mdiMedal, color: "#c0c0c0" };
        if (count >= 1) return { icon: mdiMedal, color: "#cd7f32" };
        return { icon: null, color: "" };
    };

    const { icon, color } = getMedalIcon(_count?.reviews || 0);

    return (
        <div className="admin-user-card">
            <h5>{t("adminUser.userId", { id: UserId })}</h5>
            <div className="user-row">
                {ProfilePictureUrl ? (
                    <img src={ProfilePictureUrl} alt="User" />
                ) : (
                    <div className="user-avatar user-avatar-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--red)">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                )}
                <div>
                    <div className="user-info-row">
                        <span className="user-name">{user.Name} {user.Surname.charAt(0)}.</span>
                        {(() => {
                            const { icon, color } = getMedalIcon(user._count?.reviews || 0);
                            return icon && <Icon path={icon} size={0.8} color={color} />;
                        })()}
                    </div>
                    <div className="user-location">
                        {user.City}, {user.Country}
                    </div>
                </div>
            </div>
            <div className="user-info">
                <p><strong>{t("adminUser.status")}:</strong>{" "}
                    <span className={`status ${statusLabel}`}>
                        {statusLabel === "suspended" && user.SuspendedUntil
                            ? `${t("adminUser.suspendedUntil")}: ${dayjs(user.SuspendedUntil).format("D MMMM YYYY")}`
                            : t(`userStatus.${statusLabel}`)}
                    </span>
                </p>
                <p><strong>{t("adminUser.role")}:</strong> {t(`roles.${user.userRoles?.[0]?.role?.Name?.toLowerCase()}`)}</p>
                <p><strong>{t("adminUser.email")}:</strong> {Email}</p>
                <p><strong>{t("adminUser.reviews")}:</strong> {_count?.reviews || 0}</p>
                <p><strong>{t("adminUser.createdAt")}:</strong> {formattedDate}</p>
            </div>
            <Button onClick={onManage} variant="red-outline">
                {t("buttons.manageUser")}
            </Button>
        </div>
    );
};

export default AdminUserCard;
