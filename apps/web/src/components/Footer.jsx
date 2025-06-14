import React from "react";
import "../styles/Footer.css";
import logo from "../images/light-logo.svg";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <hr className="footer-divider" />

      <div className="footer-content">
        <div className="footer-left">
          <img src={logo} alt="Balkanski Gurman logo" className="footer-logo" />
        </div>

        <div className="footer-right">
          <Link to="/community-guidelines" className="footer-link">
            Community Guidelines
          </Link>
          <p className="footer-text">© 2025 Balkanski Gurman<br />All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;