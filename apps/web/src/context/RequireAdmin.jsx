import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

const ADMIN_ROLE_ID = "644f2db4-9bbb-40a2-8b7d-963623c0c64a";

const RequireAdmin = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user?.role === ADMIN_ROLE_ID ? children : <Navigate to="/unauthorized" />;
};

export default RequireAdmin;
