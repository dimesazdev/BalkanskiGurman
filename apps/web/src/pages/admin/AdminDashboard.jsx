import { useNavigate } from "react-router-dom";
import "../../styles/AdminDashboard.css";
import Title from "../../components/Title";
import Icon from '@mdi/react';
import { useTranslation } from "react-i18next";
import {
    mdiSilverwareForkKnife,
    mdiMessageDraw,
    mdiAccountGroup,
    mdiAlertCircleOutline
} from '@mdi/js';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const sections = [
        { title: t("admin.restaurants"), path: "/admin/restaurants", icon: mdiSilverwareForkKnife },
        { title: t("admin.reviews"), path: "/admin/reviews", icon: mdiMessageDraw },
        { title: t("admin.users"), path: "/admin/users", icon: mdiAccountGroup },
        { title: t("admin.issues"), path: "/admin/issues", icon: mdiAlertCircleOutline },
    ];

    return (
        <div className="admin-dashboard">
            <Title>{t("admin.dashboardTitle")}</Title>
            <div className="admin-grid">
                {sections.map(({ title, path, icon }) => (
                    <div key={title} className="admin-box" onClick={() => navigate(path)}>
                        <Icon size={3} path={icon} color="var(--red)" />
                        <h3 className="title">{title}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;