import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";

const HomeRedirect = () => {
  const { user } = useAuth();

  if (user?.role === "644f2db4-9bbb-40a2-8b7d-963623c0c64a") {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === "34fuihi4-5vj8-3v4e-43v5-3jfismy876s5") {
    return <Navigate to="/owner" replace />;
  }

  return <Home />;
};

export default HomeRedirect;