import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Popup.css";

const Popup = ({ message, onClose, variant = "error", duration = 5000 }) => {
  const [visible, setVisible] = useState(true);
  const [hovering, setHovering] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!hovering && visible) {
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose?.(), 300); // wait for exit animation
      }, duration);
    }

    return () => clearTimeout(timerRef.current);
  }, [hovering, visible, duration, onClose]);

  const handleMouseEnter = () => {
    setHovering(true);
    clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    setHovering(false);
  };

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
    <AnimatePresence>
      {visible && (
        <motion.div
          className="popup"
          style={{ backgroundColor: getBackgroundColor() }}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span>{message}</span>
          <button className="popup-close" onClick={() => setVisible(false)}>×</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Popup;