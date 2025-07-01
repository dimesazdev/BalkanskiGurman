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
import { motion } from "framer-motion";

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
        <motion.div
            className="admin-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <Title>{t("admin.dashboardTitle")}</Title>
            <div className="admin-grid">
                {sections.map(({ title, path, icon }, index) => {
                    const directions = ["left", "bottom", "right", "top"];
                    const from = directions[index % directions.length];

                    const variants = {
                        hidden: {
                            opacity: 0,
                            x: from === "left" ? -50 : from === "right" ? 50 : 0,
                            y: from === "top" ? -50 : from === "bottom" ? 50 : 0,
                        },
                        visible: {
                            opacity: 1,
                            x: 0,
                            y: 0,
                            transition: { duration: 0.8, ease: "easeOut", delay: index * 0.2 }
                        },
                    };

                    return (
                        <motion.div
                            key={title}
                            className="admin-box"
                            initial="hidden"
                            animate="visible"
                            variants={variants}
                            onClick={() => navigate(path)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Icon size={3} path={icon} color="var(--red)" />
                            <h3 className="title">{title}</h3>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default AdminDashboard;