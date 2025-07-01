import { useEffect, useState } from "react";
import Title from "../../components/Title";
import AdminIssueCard from "../../components/admin/AdminIssueCard";
import AdminIssuePopup from "../../components/admin/AdminIssuePopup";
import Popup from "../../components/Popup";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import "../../styles/AdminIssues.css";
import { motion } from "framer-motion";
import SortBar from "../../components/SortBar";
import SearchBar from "../../components/SearchBar";

const AdminIssues = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [issues, setIssues] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [popup, setPopup] = useState(null);
    const [sortOption, setSortOption] = useState("newest");

    useEffect(() => {
        if (!user?.token) return;
        fetch("http://localhost:3001/issues", {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => res.json())
            .then(setIssues)
            .catch(console.error);
    }, [user]);

    const filtered = issues
        .filter(issue =>
            statusFilter === "all"
                ? true
                : issue.status?.Name?.toLowerCase() === statusFilter
        )
        .filter(issue =>
            issue.Explanation?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOption === "type") {
                return a.IssueType.localeCompare(b.IssueType);
            }
            if (sortOption === "newest") {
                return new Date(b.CreatedAt) - new Date(a.CreatedAt);
            }
            if (sortOption === "oldest") {
                return new Date(a.CreatedAt) - new Date(b.CreatedAt);
            }
            return 0;
        });

    const handleResolve = async (issueId) => {
        try {
            const res = await fetch(`http://localhost:3001/issues/${issueId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ StatusId: 8 }) // resolved
            });

            if (!res.ok) throw new Error();

            const updated = await res.json();

            setIssues(prev =>
                prev.map(i => (i.IssueId === issueId ? { ...i, StatusId: 8, status: { Name: "Resolved" } } : i))
            );

            setSelectedIssue(prev =>
                prev?.IssueId === issueId ? { ...prev, StatusId: 8, status: { Name: "Resolved" } } : prev
            );

            setPopup({ message: t("adminIssue.resolved"), variant: "success" });
        } catch {
            setPopup({ message: t("adminIssue.resolveFailed"), variant: "error" });
        }
    };

    return (
        <motion.div
            className="admin-issues-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
            <Title>{t("labels.issues")}</Title>

            <motion.div
                className="issue-header-row"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >                <div className="top-row">
                    <div className="issue-filters">
                        {["all", "pending", "resolved"].map(status => (
                            <button
                                key={status}
                                className={`status-filter ${status} ${statusFilter === status ? "selected" : ""}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {t(`issueStatus.${status}`)}
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
                        sortOptions={["issueType", "newest", "oldest"]}
                        selected={sortOption}
                        onSelect={setSortOption}
                        t={t}
                    />

                    <div className="issue-count-label">
                        {t("labels.issueCount", { count: filtered.length })}
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="issues-grid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            >
                {filtered.map(issue => (
                    <AdminIssueCard
                        key={issue.IssueId}
                        issue={issue}
                        onManage={() => setSelectedIssue(issue)}
                    />
                ))}
            </motion.div>

            {selectedIssue && (
                <AdminIssuePopup
                    issue={selectedIssue}
                    onClose={() => setSelectedIssue(null)}
                    onResolve={() => handleResolve(selectedIssue.IssueId)}
                />
            )}
        </motion.div>
    );
};

export default AdminIssues;
