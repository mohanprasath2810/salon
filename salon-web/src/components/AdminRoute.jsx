import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps any admin-only page.
// - Still loading auth  → render nothing (prevents flash redirect)
// - Not logged in       → send to /login
// - Logged in but not ADMIN → send to / (silently denied)
// - ADMIN               → render the page
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user)             return <Navigate to="/login"  replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;

  return children;
}
