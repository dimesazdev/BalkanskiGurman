import "../styles/Title.css";
import { motion } from "framer-motion";

const Title = ({ children, className = "" }) => {
  return (
    <motion.h2
      className={`section-title ${className}`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.h2>
  );
};

export default Title;