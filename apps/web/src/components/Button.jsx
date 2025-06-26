import classNames from "classnames";
import "../styles/Button.css"

const Button = ({ children, onClick, type = "button", variant = "beige", className = "", ...props }) => {
  const baseClass = "btn-base";

  const variantMap = {
    red: "btn-red",
    beige: "btn-beige",
    yellow: "btn-yellow",
    green: "btn-green",
    "red-outline": "btn-red-outline",
    "beige-outline": "btn-beige-outline",
    "red-small": "btn-red-small",
    "yellow-small": "btn-yellow-small",
  };

  const variantClass = variantMap[variant] || "";

  return (
    <button
      type={type}
      onClick={onClick}
      className={classNames(baseClass, variantClass, className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;