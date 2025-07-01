import { Navigate } from "react-router-dom";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

const ADMIN_ROLE_ID = "644f2db4-9bbb-40a2-8b7d-963623c0c64a";
const OWNER_ROLE_ID = "34fuihi4-5vj8-3v4e-43v5-3jfismy876s5";

const RequireAdminOrOwner = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== ADMIN_ROLE_ID && user.role !== OWNER_ROLE_ID) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAdminOrOwner;