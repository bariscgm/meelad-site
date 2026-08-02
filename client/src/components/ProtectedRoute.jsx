import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userStr = localStorage.getItem('user');
  let user = null;

  try {
    if (userStr) user = JSON.parse(userStr);
  } catch (e) {
    // ignore parsing errors
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // User is logged in but doesn't have the right role, redirect to their proper dashboard
      const role = user.role;
      if (role === 'Admin') return <Navigate to="/admin" replace />;
      if (role === 'Team Leader') return <Navigate to="/team" replace />;
      if (role === 'Stage Manager') return <Navigate to="/stage" replace />;
      if (role === 'Judge') return <Navigate to="/judge" replace />;
      
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
