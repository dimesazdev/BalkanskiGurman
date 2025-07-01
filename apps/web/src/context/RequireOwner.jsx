import Loading from "../components/Loading";
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

const OWNER_ROLE_ID = "34fuihi4-5vj8-3v4e-43v5-3jfismy876s5";

const RequireOwner = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== OWNER_ROLE_ID) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireOwner;