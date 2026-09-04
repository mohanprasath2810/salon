import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps any salon-owner-only page.
// - Still loading  → render nothing
// - Not logged in  → /login
// - Not SALON_OWNER or ADMIN → / (silently denied)
// - SALON_OWNER or ADMIN → render children
export default function OwnerRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'SALON_OWNER' && user.role !== 'ADMIN')
    return <Navigate to="/" replace />;

  return children;
}
