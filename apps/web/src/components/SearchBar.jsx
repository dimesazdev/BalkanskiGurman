import "../styles/SearchBar.css";
import Icon from "@mdi/react";
import { mdiMagnify } from "@mdi/js";

const SearchBar = ({
  value,
  onChange,
  placeholder = "",
  onSubmit = null,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };

  return (
    <form
      className="search-bar"
      onSubmit={handleSubmit}
      role="search"
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="submit">
        <Icon path={mdiMagnify} size={1} color="#2f2f2f" />
      </button>
    </form>
  );
};

export default SearchBar;