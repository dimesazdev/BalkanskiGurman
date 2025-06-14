import { motion } from "framer-motion";
import "../styles/Popup.css";

const Popup = ({ message, onClose, variant = "error" }) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case "success":
        return "#008000";
      case "warning":
        return "#F0A404";
      case "error":
      default:
        return "#BA3B46";
    }
  };

  return (
    <motion.div
      className="popup"
      style={{ backgroundColor: getBackgroundColor() }}
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
    >
      <span>{message}</span>
      <button className="popup-close" onClick={onClose}>×</button>
    </motion.div>
  );
};

export default Popup;