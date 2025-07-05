import Icon from "@mdi/react";
import { mdiMedal, mdiDiamondStone } from "@mdi/js";
import Button from "../Button";
import { useTranslation } from "react-i18next";
import "../../styles/AdminIssueCard.css";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/mk";
import "dayjs/locale/me";
import "dayjs/locale/sl";

const AdminIssueCard = ({ issue, onManage }) => {
    const { t, i18n } = useTranslation();
    dayjs.locale(i18n.language === "sr" ? "me" : i18n.language);

    const {
        IssueId,
        IssueType,
        Explanation,
        CreatedAt,
        user
    } = issue;

    if (!issue || !issue.user) return null;

    const statusLabel = issue.status?.Name?.trim().toLowerCase() || "unknown";

    const getMedalIcon = (count) => {
        if (count > 50) return { icon: mdiDiamondStone, color: "#00bfff" };
        if (count >= 26) return { icon: mdiMedal, color: "#ffd700" };
        if (count >= 11) return { icon: mdiMedal, color: "#c0c0c0" };
        if (count >= 1) return { icon: mdiMedal, color: "#cd7f32" };
        return { icon: null, color: "" };
    };

    const { icon, color } = getMedalIcon(issue.user?._count?.reviews || 0);

    return (
        <div className="admin-issue-card">
            <h4>{t("adminIssue.issueId", { id: IssueId })}</h4>
            <div className="user-row">
                {user.ProfilePictureUrl ? (
                    <img src={user.ProfilePictureUrl} alt="User" />
                ) : (
                    <div className="user-avatar user-avatar-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--red)">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                )}
                <div>
                    <div className="user-info-row">
                        <span className="user-name">{user.Name} {user.Surname?.charAt(0)}.</span>
                        {icon && <Icon path={icon} size={0.8} color={color} />}
                    </div>
                    <div className="user-location">
                        {user.City ? `${user.City}, ${user.Country}` : user.Country}
                    </div>
                </div>
            </div>
            <div className="user-info">
                <p><strong>{t("adminUser.role")}:</strong> {t(`roles.${user.userRoles?.[0]?.role?.Name?.toLowerCase()}`)}</p>
                <p><strong>{t("adminUser.email")}:</strong> {user.Email}</p>
                <p><strong>{t("adminIssue.status")}:</strong>{" "}
                    <span className={`status ${statusLabel}`}>{t(`issueStatus.${statusLabel}`)}</span>
                </p>
                <p><strong>{t("adminIssue.createdAt")}:</strong> {dayjs(CreatedAt).format("D MMMM YYYY")}</p>
                <p><strong>{t("adminIssue.type")}:</strong>{" "}
                    {t(`report.issueTypes.${issue.IssueType === "Wrong Info"
                        ? "wrongInfo"
                        : issue.IssueType === "Bug Report"
                            ? "bugReport"
                            : "other"
                        }`)}
                </p>
            </div>
            <Button onClick={onManage} variant="red-outline">
                {t("buttons.manageIssue")}
            </Button>
        </div>
    );
};

export default AdminIssueCard;
