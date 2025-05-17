import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while auth is being checked
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <p>Loading authentication...</p>
    </div>;
  }

  // If no user is logged in, redirect to login with return URL
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle role-based access
  if (requiredRole && user.role !== requiredRole) {
    // Option 1: Redirect to default route for user's role
    // return <Navigate to={`/${user.role}`} replace />;
    
    // Option 2: Show unauthorized page
    return <div className="flex justify-center items-center h-screen">
      <p>You don't have permission to access this page</p>
    </div>;
  }

  // Alternative: Check against multiple allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;