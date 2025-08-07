import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ChangePassword.css"
import getApiBaseUrl from "../api/config";

const VerifyEmail = () => {
  const [status, setStatus] = useState("Verifying...");
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");

    if (!token) {
      setStatus("Invalid link.");
      return;
    }

    const baseUrl = getApiBaseUrl();
    fetch(`${baseUrl}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("Email verified! Redirecting to login...");
          setTimeout(() => {
            navigate("/auth/login");
          }, 3000);
        } else {
          setStatus(data.error || "Invalid or expired token.");
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus("An error occurred.");
      });
  }, [search, navigate]);

  return (
    <div className="verify-email">
      <h2>{status}</h2>
    </div>
  );
};

export default VerifyEmail;