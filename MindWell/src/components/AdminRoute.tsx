import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Debug logging
  console.log('AdminRoute - isAuthenticated:', isAuthenticated);
  console.log('AdminRoute - user:', user);
  console.log('AdminRoute - user role:', user?.role);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('AdminRoute - Redirecting to login (not authenticated)');
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    console.log('AdminRoute - Redirecting to dashboard (not admin role)');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('AdminRoute - Access granted, rendering admin panel');
  return <>{children}</>;
};

export default AdminRoute;
