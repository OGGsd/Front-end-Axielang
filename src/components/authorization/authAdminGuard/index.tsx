import { useContext } from "react";
import { AuthContext } from "@/contexts/authContext";
import { CustomNavigate } from "@/customization/components/custom-navigate";
import { LoadingPage } from "@/pages/LoadingPage";
import useAuthStore from "@/stores/authStore";

export const ProtectedAdminRoute = ({ children }) => {
  const { userData } = useContext(AuthContext);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const autoLogin = useAuthStore((state) => state.autoLogin);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  if (!isAuthenticated) {
    return <LoadingPage />;
  } else if (userData && !isAdmin && !autoLogin) {
    // Only redirect non-admin users who are manually logged in
    return <CustomNavigate to="/" replace />;
  } else if (!userData && !autoLogin) {
    // If no user data and not auto-login, redirect to login
    return <CustomNavigate to="/login/admin" replace />;
  } else {
    return children;
  }
};
