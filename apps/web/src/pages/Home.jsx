import "../styles/Home.css"
import "../styles/General.css"
import logo from "../images/light-logo.svg"
import plate from "../images/plate.svg"
import Navbar from "../components/Navbar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"
import Icon from '@mdi/react'
import { mdiArrowRightThin } from '@mdi/js'
import Button from "../components/Button";

const Home = () => {

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="home-container">
        <motion.div
          className="home-left"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <img className="home-logo" src={logo} />
          <Button variant="red" onClick={() => navigate("/restaurants")}>
            <h2>{t("home.button")}</h2>
            <Icon path={mdiArrowRightThin} size={1} className="arrow-icon" />
          </Button>
        </motion.div>
        <motion.div
          className="home-right"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="home-plate">
            <img src={plate} alt="Plate" />
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Home;  