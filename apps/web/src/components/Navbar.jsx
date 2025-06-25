import { Link, useNavigate } from 'react-router-dom';
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

const flagMap = {
  EN: ukFlag,
  MK: mkFlag,
  SR: srFlag,
  SL: siFlag,
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language.toUpperCase());
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
      className="navbar"
    >
      <div className="navbar-brand">
        {!user?.role || user?.role !== "644f2db4-9bbb-40a2-8b7d-963623c0c64a" ? (
          <>
            <Link to="/" className="navbar-link">
              <Icon path={mdiHomeOutline} size={1} className="navbar-icon" />
              {t('navbar.home')}
            </Link>
            <Link to="/restaurants" className="navbar-link">
              <Icon path={mdiSilverwareForkKnife} size={1} className="navbar-icon" />
              {t('navbar.restaurants')}
            </Link>
            {user && (
              <Link to="/favorites" className="navbar-link">
                <Icon path={mdiHeartOutline} size={1} className="navbar-icon" />
                {t('navbar.favourites')}
              </Link>
            )}
          </>
        ) : (
          <>
            <Link to="/admin" className="navbar-link">
              <Icon path={mdiHomeOutline} size={1} className="navbar-icon" />
              {t('navbar.dashboard')}
            </Link>
            <Link to="/admin/restaurants" className="navbar-link">
              <Icon path={mdiSilverwareForkKnife} size={1} className="navbar-icon" />
              {t('navbar.restaurants')}
            </Link>
            <Link to="/admin/reviews" className="navbar-link">
              <Icon path={mdiMessageDraw} size={1} className="navbar-icon" />
              {t('navbar.reviews')}
            </Link>
            <Link to="/admin/users" className="navbar-link">
              <Icon path={mdiAccountGroup} size={1} className="navbar-icon" />
              {t('navbar.users')}
            </Link>
            <Link to="/admin/issues" className="navbar-link">
              <Icon path={mdiAlertCircleOutline} size={1} className="navbar-icon" />
              {t('navbar.issues')}
            </Link>
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
            <Link to="/auth/login" className="navbar-link">
              <Icon path={mdiAccountCircleOutline} size={1} className='navbar-icon' />
              {t('navbar.login')}
            </Link>
          ) : (
            <>
              <Link to="/me" className="navbar-user-info">
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
                    {user.name} {user.surname}
                  </div>
                )}
              </Link>
              <div className="navbar-link logout-btn" onClick={handleLogout}>
                <Icon path={mdiLogout} size={1} className="navbar-icon" title={t('navbar.logout')} />
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;