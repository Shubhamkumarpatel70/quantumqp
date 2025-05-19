import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import OtpVerification from './components/OtpVerification';
import PrivateRoute from './components/PrivateRoute';  // Import the PrivateRoute component

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OtpVerification />} />

        {/* Protected Routes */}
        <Route 
          path="/admin-dashboard" 
          element={<PrivateRoute element={<AdminDashboard />} requiredRole="admin" />} 
        />
        
        <Route 
          path="/user-dashboard" 
          element={<PrivateRoute element={<UserDashboard />} />} 
        />
        
        {/* Catch-All Route (Optional) */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
