import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 Allow access only if role matches
  if (role && userRole && role.trim() !== userRole.trim()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
