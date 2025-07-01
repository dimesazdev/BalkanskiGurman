import Loading from "../components/Loading";
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

const ADMIN_ROLE_ID = "644f2db4-9bbb-40a2-8b7d-963623c0c64a";

const RequireAdmin = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== ADMIN_ROLE_ID) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAdmin;
