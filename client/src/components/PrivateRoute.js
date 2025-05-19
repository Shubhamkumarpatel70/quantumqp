import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ element, requiredRole, redirectTo, ...rest }) => {
  const isAuthenticated = useSelector(state => !!state.auth.token);  // Check if token exists
  const userRole = useSelector(state => state.auth.role);  // Get the user role
  const isVerified = useSelector(state => state.auth.isVerified); // Check if user is verified

  if (!isAuthenticated) {
    // If not authenticated, redirect to login page
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // If user role doesn't match the required role, redirect to login page
    return <Navigate to="/login" />;
  }

  if (redirectTo) {
    // If the user is not verified and trying to access UserDashboard, redirect to OTP Verification page
    if (!isVerified && redirectTo === 'user-dashboard') {
      return <Navigate to="/verify-otp" />;
    }

    // Allow OTP Verification page if the user is not verified
    if (!isVerified && redirectTo === 'verify-otp') {
      return element;
    }
    
    // If none of the conditions match, redirect the user as needed
    return <Navigate to={redirectTo} />;
  }

  return element;
};

export default PrivateRoute;
