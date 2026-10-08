import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCompleteProfile?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireCompleteProfile = true,
}) => {
  const { user, isProfileComplete, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen label="Verifying student session..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    requireCompleteProfile &&
    !isProfileComplete &&
    location.pathname !== '/profile'
  ) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};
