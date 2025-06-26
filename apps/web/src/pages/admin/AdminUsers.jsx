import { useEffect, useState } from "react";
import Title from "../../components/Title";
import AdminUserCard from "../../components/admin/AdminUserCard";
import AdminUserPopup from "../../components/admin/AdminUserPopup";
import "../../styles/AdminUsers.css";
import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import Popup from "../../components/Popup";

const AdminUsers = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOption, setSortOption] = useState("newest");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
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
        <div className="admin-users-page">
            {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
            <Title>{t("labels.users")}</Title>

            <div className="user-header-row">
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
                    <div className="search-bar">
                        <input
                            placeholder={t("labels.searchByKeyword")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button><Icon path={mdiMagnify} size={1} color="#2f2f2f" /></button>
                    </div>
                </div>
                <div className="bottom-row">
                    <div className="sort-bar">
                        <label>{t("sort.label")}</label>
                        <div
                            className={`sort-select ${showSortDropdown ? "open" : ""}`}
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                        >
                            {t(`sort.${sortOption}`)} {showSortDropdown ? "▾" : "▸"}
                            {showSortDropdown && (
                                <ul className="sort-dropdown">
                                    <li onClick={() => setSortOption("newest")}>{t("sort.newest")}</li>
                                    <li onClick={() => setSortOption("oldest")}>{t("sort.oldest")}</li>
                                    <li onClick={() => setSortOption("reviewsAsc")}>{t("sort.reviewsAsc")}</li>
                                    <li onClick={() => setSortOption("reviewsDesc")}>{t("sort.reviewsDesc")}</li>
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className="user-count-label">
                        {t("labels.users", { count: filtered.length })}
                    </div>
                </div>
            </div>

            <div className="users-grid">
                {filtered.map(user => (
                    <AdminUserCard key={user.UserId} user={user} onManage={() => setSelectedUser(user)} />
                ))}
            </div>

            {selectedUser && (
                <AdminUserPopup
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    setPopup={setPopup}
                    setSelectedUser={setSelectedUser}
                    onAction={(userId, actionType) => {
                        const statusMap = { suspend: 2, ban: 3 };
                        handleStatusChange(userId, statusMap[actionType]);
                    }}
                />
            )}
        </div>
    );
};

export default AdminUsers;