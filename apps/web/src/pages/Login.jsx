import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../public/dark-logo.svg";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import FormInput from "../components/FormInput";
import "../styles/Auth.css";
import "../styles/General.css"
import { useTranslation } from "react-i18next";
import Button from "../components/Button";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("login.loginFailed"));
        return;
      }

      login({ ...data.user, token: data.token });
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(t("login.somethingWentWrong"));
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Left side - Logo and Register */}
        <div className="login-left">
          <div className="logo-section">
            <img src={logo} alt="Logo" />
          </div>
          <div className="register-section">
            <p>{t("login.noAccount")}</p>
            <Link to="/auth/register" className="register-link">
              {t("login.registerNow")}
            </Link>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-right">
          <div className="welcome-section">
            <h2>{t("login.welcomeBack")}</h2>
            <h4>{t("login.pleaseLogin")}</h4>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <FormInput
              id="email"
              label={t("login.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@gmail.com"
              autocomplete={"on"}
              required
            />
            <FormInput
              id="password"
              label={t("login.password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••"
              required
            />
            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">{t("login.rememberMe")}</label>
              </div>
              <a href="/forgot-password" className="forgot-password">
                {t("login.forgotPassword")}
              </a>
            </div>

            <div className="button-group">
              <Button type="submit" variant="beige">
                <p>{t("login.login")}</p>
              </Button>

              <button type="button" className="google-btn">
                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t("login.continueWithGoogle")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;