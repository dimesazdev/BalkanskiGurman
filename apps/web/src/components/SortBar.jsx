import { useState } from "react";
import "../styles/SortBar.css";

const SortBar = ({
    label = "",
    sortOptions = [],
    selected,
    onSelect,
    t,
}) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="sort-bar">
            {label && <label className="sort-label">{label}</label>}
            <div
                className={`sort-select ${open ? "open" : ""}`}
                onClick={() => setOpen(!open)}
            >
                <span>{t(`sort.${selected}`)}</span>
                <span>{open ? "▾" : "▸"}</span>
                {open && (
                    <ul className="sort-dropdown">
                        {sortOptions.map(option => (
                            <li
                                key={option}
                                onClick={() => {
                                    onSelect(option);
                                    setOpen(false);
                                }}
                            >
                                {t(`sort.${option}`)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SortBar;