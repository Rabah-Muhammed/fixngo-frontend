// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

// User-side components
import SignupPage from "./components/userside/userauth/SignupPage";
import OTPVerification from "./components/userside/userauth/OTPVerification";
import LoginPage from "./components/userside/userauth/LoginPage";
import ForgotPassword from "./components/userside/userauth/ForgotPassword";
import ResetPassword from "./components/userside/userauth/ResetPassword";
import HomePage from "./components/userside/HomePage";
import UserProfile from "./components/userside/userprofile/UserProfile";



// Worker-side components
import WorkerSignupPage from "./components/workerside/workerauth/WorkerSignupPage";
import WorkerLoginPage from "./components/workerside/workerauth/WorkerLoginPage";
import WorkerDashboardPage from "./components/workerside/workerauth/WorkerDashboardPage";
import WorkerProfile from "./components/workerside/workerauth/workerprofile/WorkerProfile";
import WorkerServiceCreate from "./components/workerside/workerauth/servicemanager/WorkerServiceCreate";



// Admin-side components
import AdminLoginPage from "./components/adminside/adminauth/AdminLoginPage";
import AdminDashboard from "./components/adminside/adminauth/AdminDashboard";
import UsersList from "./components/adminside/adminauth/UsersList";
import WorkersList from "./components/adminside/adminauth/WorkersList";
import AdminLayout from "./components/adminside/adminauth/AdminLayout"; // Import Admin Layout




// Private Route component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const clientId = "500698877294-jam712pdk43id3s0v5mg9k1ol2jjdl6a.apps.googleusercontent.com"
  return (
    <Router>
      <GoogleOAuthProvider clientId={clientId}>
      <Routes>
        {/* User routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<UserProfile />} />

        {/* Worker routes */}
        <Route path="/worker/signup" element={<WorkerSignupPage />} />
        <Route path="/worker/login" element={<WorkerLoginPage />} />
        <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
        <Route path="/worker/profile" element={<WorkerProfile />} />
        <Route path="/worker/service/create" element={<WorkerServiceCreate />} /> 

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersList />} />
        <Route path="/admin/workers" element={<WorkersList />} />
        
      </Routes>
      </GoogleOAuthProvider>
    </Router>
  );
};

export default App;
