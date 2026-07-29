import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

// Wrap a route element with this to require login, and optionally a specific role.
// Usage: <ProtectedRoute allowedRoles={['organizer']}><CreateEventPage /></ProtectedRoute>
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader label="Checking your session..." />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
