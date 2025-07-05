import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/Navbar.css';
import ukFlag from "../images/uk-flag-icon.svg";
import mkFlag from "../images/mk-flag-icon.svg";
import srFlag from "../images/sr-flag-icon.svg";
import siFlag from "../images/si-flag-icon.svg";
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import {
  mdiHomeOutline,
  mdiSilverwareForkKnife,
  mdiHeartOutline,
  mdiAccountCircleOutline,
  mdiLogout,
  mdiMessageDraw,
  mdiAccountGroup,
  mdiAlertCircleOutline
} from '@mdi/js';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import Alert from './Alert';

const flagMap = {
  EN: ukFlag,
  MK: mkFlag,
  SR: srFlag,
  SL: siFlag,
};

// 🔑 Role IDs (centralized)
const ADMIN_ROLE_ID = "644f2db4-9bbb-40a2-8b7d-963623c0c64a";
const OWNER_ROLE_ID = "34fuihi4-5vj8-3v4e-43v5-3jfismy876s5";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language.toUpperCase());
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleLangDropdown = () => setShowLangDropdown(!showLangDropdown);
  const changeLanguage = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang.toLowerCase());
    setShowLangDropdown(false);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutAlert(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutAlert(false);
    navigate("/");
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
      className={`navbar ${user?.role === ADMIN_ROLE_ID ? "admin" : "user"}`}
    >
      <div className="navbar-brand">
        {/* PUBLIC USER */}
        {!user?.role || (user.role !== ADMIN_ROLE_ID && user.role !== OWNER_ROLE_ID) ? (
          <>
            <NavLink to="/" end className="navbar-link">
              <Icon path={mdiHomeOutline} size={1} className="navbar-icon" />
              {t('navbar.home')}
            </NavLink>
            <NavLink to="/restaurants" className="navbar-link">
              <Icon path={mdiSilverwareForkKnife} size={1} className="navbar-icon" />
              {t('navbar.restaurants')}
            </NavLink>
            {user && (
              <>
                <NavLink to="/favorites" className="navbar-link">
                  <Icon path={mdiHeartOutline} size={1} className="navbar-icon" />
                  {t('navbar.favourites')}
                </NavLink>
                <NavLink to="/issues" className="navbar-link">
                  <Icon path={mdiAlertCircleOutline} size={1} className="navbar-icon" />
                  {t('navbar.issues')}
                </NavLink>
              </>
            )}
          </>
        ) : user.role === ADMIN_ROLE_ID ? (
          <>
            {/* ADMIN */}
            <NavLink to="/admin" end className="navbar-link">
              <Icon path={mdiHomeOutline} size={1} className="navbar-icon" />
              {t('navbar.dashboard')}
            </NavLink>
            <NavLink to="/admin/restaurants" className="navbar-link">
              <Icon path={mdiSilverwareForkKnife} size={1} className="navbar-icon" />
              {t('navbar.restaurants')}
            </NavLink>
            <NavLink to="/admin/reviews" className="navbar-link">
              <Icon path={mdiMessageDraw} size={1} className="navbar-icon" />
              {t('navbar.reviews')}
            </NavLink>
            <NavLink to="/admin/users" className="navbar-link">
              <Icon path={mdiAccountGroup} size={1} className="navbar-icon" />
              {t('navbar.users')}
            </NavLink>
            <NavLink to="/admin/issues" className="navbar-link">
              <Icon path={mdiAlertCircleOutline} size={1} className="navbar-icon" />
              {t('navbar.issues')}
            </NavLink>
          </>
        ) : (
          <>
            {/* OWNER */}
            <NavLink to="/owner" end className="navbar-link">
              <Icon path={mdiHomeOutline} size={1} className="navbar-icon" />
              {t('navbar.dashboard')}
            </NavLink>
            <NavLink to="/owner/restaurants" className="navbar-link">
              <Icon path={mdiSilverwareForkKnife} size={1} className="navbar-icon" />
              {t('owner.myRestaurants')}
            </NavLink>
            <NavLink to="/owner/reviews" className="navbar-link">
              <Icon path={mdiMessageDraw} size={1} className="navbar-icon" />
              {t('owner.reviews')}
            </NavLink>
          </>
        )}
      </div>

      <div className="hamburger" onClick={toggleMenu}>☰</div>

      <div className="nav-links" style={{ display: isMobile ? (isOpen ? 'flex' : 'none') : 'flex' }}>
        <div className="navbar-right">
          <div className={`language-select ${showLangDropdown ? 'open' : ''}`} onClick={toggleLangDropdown}>
            <img src={flagMap[language]} alt="Language" /> {language} {showLangDropdown ? '▾' : '▸'}
            {showLangDropdown && (
              <ul className="language-dropdown">
                {Object.keys(flagMap).map((lang) => (
                  <li key={lang} onClick={() => changeLanguage(lang)}>
                    <img src={flagMap[lang]} alt={lang} /> {lang}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!user ? (
            <NavLink to="/auth/login" className="navbar-link">
              <Icon path={mdiAccountCircleOutline} size={1} className='navbar-icon' />
              {t('navbar.login')}
            </NavLink>
          ) : (
            <>
              <NavLink to="/me" className="navbar-user-info">
                {user.profilePicture ? (
                  <div className="navbar-link user-info">
                    <img
                      src={user.profilePicture}
                      alt={`${user.name} ${user.surname}`}
                      className="navbar-avatar"
                    />
                    {user.name} {user.surname?.charAt(0)}.
                  </div>
                ) : (
                  <div className="navbar-link user-info" title={`${user.name} ${user.surname}`}>
                    <Icon
                      path={mdiAccountCircleOutline}
                      size={1}
                      className="navbar-icon"
                    />
                    {user.name} {user.surname?.charAt(0)}.
                  </div>
                )}
              </NavLink>
              <div className="navbar-link logout-btn" onClick={handleLogoutClick}>
                <Icon path={mdiLogout} size={1} className="navbar-icon" title={t('navbar.logout')} />
              </div>
            </>
          )}
        </div>
      </div>

      {showLogoutAlert && (
        <Alert
          message={t("navbar.logoutConfirm") || "Are you sure you want to logout?"}
          buttonText={t("navbar.logout") || "Logout"}
          onButtonClick={handleConfirmLogout}
          onClose={() => setShowLogoutAlert(false)}
        />
      )}
    </motion.div>
  );
};

export default Navbar;