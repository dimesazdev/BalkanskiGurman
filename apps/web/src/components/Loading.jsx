import { useEffect, useState } from "react";
import "../styles/Loading.css";
import logo from "../../public/logo.svg";

const Loading = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fadeInTimeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(fadeInTimeout);
  }, []);

  return (
    <div className={`loading-overlay ${visible ? "visible" : ""}`}>
      <img src={logo} alt="Loading..." className="loading-logo" />
    </div>
  );
};

export default Loading;