import { useEffect, useState } from "react";
import Title from "../../components/Title";
import AdminUserCard from "../../components/admin/AdminUserCard";
import AdminUserPopup from "../../components/admin/AdminUserPopup";
import "../../styles/AdminUsers.css";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import Popup from "../../components/Popup";
import { motion } from "framer-motion";
import SortBar from "../../components/SortBar";
import SearchBar from "../../components/SearchBar";

const AdminUsers = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOption, setSortOption] = useState("newest");
    const [selectedUser, setSelectedUser] = useState(null);
    const [popup, setPopup] = useState(null);

    useEffect(() => {
        if (!user?.token) return;
        fetch("http://localhost:3001/users", {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch(console.error);
    }, [user]);

    const filtered = users
        .filter(u =>
            statusFilter === "all" ? true : u.status?.Name?.toLowerCase() === statusFilter
        )
        .filter(u => {
            const name = `${u.Name} ${u.Surname}`.toLowerCase();
            return name.includes(searchTerm.toLowerCase()) || u.Email.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .sort((a, b) => {
            if (sortOption === "newest") return new Date(b.CreatedAt) - new Date(a.CreatedAt);
            if (sortOption === "oldest") return new Date(a.CreatedAt) - new Date(b.CreatedAt);
            if (sortOption === "reviewsAsc") return (a._count?.reviews || 0) - (b._count?.reviews || 0);
            if (sortOption === "reviewsDesc") return (b._count?.reviews || 0) - (a._count?.reviews || 0);
            return 0;
        });

    const handleStatusChange = async (userId, statusId) => {
        try {
            const res = await fetch(`http://localhost:3001/users/${userId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ StatusId: statusId }),
            });

            if (!res.ok) throw new Error();
            const updated = await res.json();

            const statusMap = {
                1: { Name: "Active" },
                2: { Name: "Suspended" },
                3: { Name: "Banned" },
            };

            const mergedUser = { ...updated, status: statusMap[updated.StatusId] };

            setUsers((prev) =>
                prev.map((u) =>
                    u.UserId === userId ? { ...u, ...mergedUser } : u
                )
            );

            setSelectedUser((prev) =>
                prev?.UserId === userId ? { ...prev, ...mergedUser } : prev
            );

            setPopup({ message: t("adminUser.statusUpdated"), variant: "success" });
        } catch {
            setPopup({ message: t("adminUser.statusUpdateFailed"), variant: "error" });
        }
    };

    return (
        <motion.div
            className="admin-users-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
            <Title>{t("labels.users")}</Title>

            <motion.div
                className="user-header-row"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
                <div className="top-row">
                    <div className="user-filters">
                        {["all", "active", "suspended", "banned"].map(status => (
                            <button
                                key={status}
                                className={`status-filter ${status !== "all" ? status : ""} ${statusFilter === status ? "selected" : ""}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {t(`userStatus.${status}`)}
                            </button>
                        ))}
                    </div>

                    <SearchBar
                        placeholder={t("labels.searchByKeyword")}
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                </div>
                <div className="bottom-row">
                    <SortBar
                        label={t("sort.label")}
                        sortOptions={["newest", "oldest", "reviewsAsc", "reviewsDesc"]}
                        selected={sortOption}
                        onSelect={setSortOption}
                        t={t}
                    />

                    <div className="user-count-label">
                        {t("labels.users", { count: filtered.length })}
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="users-grid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            >
                {filtered.map(user => (
                    <AdminUserCard key={user.UserId} user={user} onManage={() => setSelectedUser(user)} />
                ))}
            </motion.div>

            {selectedUser && (
                <AdminUserPopup
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    setPopup={setPopup}
                    setSelectedUser={setSelectedUser}
                    onAction={(userId, actionType) => {
                        const statusMap = { activate: 1, suspend: 2, ban: 3 };
                        handleStatusChange(userId, statusMap[actionType]);
                    }}
                />
            )}
        </motion.div>
    );
};

export default AdminUsers;