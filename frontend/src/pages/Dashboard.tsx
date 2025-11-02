import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import SellerDashboard from "./SellerDashboard";
import BuyerDashboard from "./BuyerDashboard";

const Dashboard = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Normalize role to uppercase for consistent comparison
  const userRole = user?.role?.toUpperCase();

  useEffect(() => {
    // Wait for authentication state
    if (!isAuthenticated || !user) {
      return;
    }

    // Redirect admin users to admin dashboard
    if (userRole === "ADMIN") {
      navigate("/admin", { replace: true });
    }
  }, [user, isAuthenticated, userRole, navigate]);

  // Show loading state while checking auth
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-light-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-dark-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything for admin (they'll be redirected)
  if (userRole === "ADMIN") {
    return null;
  }

  // Show seller dashboard for sellers
  if (userRole === "SELLER") {
    return <SellerDashboard />;
  }

  // Show buyer dashboard for buyers (or default role)
  return <BuyerDashboard />;
};

export default Dashboard;
