import classNames from "classnames";
import "../styles/Button.css"

const Button = ({ children, onClick, type = "button", variant = "beige", className = "", ...props }) => {
  const baseClass = "btn-base";
  
  const variantMap = {
    red: "btn-red",
    beige: "btn-beige",
    "red-outline": "btn-red-outline",
    "beige-outline": "btn-beige-outline"
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