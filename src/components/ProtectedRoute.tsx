
import { useAuth } from '@/contexts/AuthContext';
import { useCanteen } from '@/contexts/CanteenContext';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { selectedCanteen } = useCanteen();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in but hasn't selected a canteen, redirect to canteen selection
  if (!selectedCanteen && location.pathname !== '/canteen-selection') {
    return <Navigate to="/canteen-selection" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
