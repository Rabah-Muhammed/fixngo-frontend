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
import ServicesPage from "./components/userside/servicepage/ServicesPage";
import ServiceDetailPage from "./components/userside/servicepage/ServiceDetailPage";
import WorkersPage from "./components/userside/servicepage/WorkersPage";
import WorkerSlotPage from "./components/userside/servicepage/WorkerSlotPage";
import UserBookingsPage from "./components/userside/bookings/UserBookingsPage";


// Worker-side components
import WorkerSignupPage from "./components/workerside/workerauth/WorkerSignupPage";
import WorkerLoginPage from "./components/workerside/workerauth/WorkerLoginPage";
import WorkerDashboardPage from "./components/workerside/workerauth/WorkerDashboardPage";
import WorkerProfile from "./components/workerside/workerauth/workerprofile/WorkerProfile";
import SlotManagement from "./components/workerside/slotsmanage/SlotManagement";
import ServiceSelection from "./components/workerside/servicemanage/ServiceSelection";



// Admin-side components
import AdminLoginPage from "./components/adminside/adminauth/AdminLoginPage";
import AdminDashboard from "./components/adminside/adminauth/AdminDashboard";
import UsersList from "./components/adminside/adminauth/UsersList";
import WorkersList from "./components/adminside/adminauth/WorkersList";
import AdminLayout from "./components/adminside/adminauth/AdminLayout"; // Import Admin Layout
import AdminCreateService from "./components/adminside/adminauth/AdminCreateService";
import BookingsList from "./components/adminside/adminauth/BookingsList";


import { PayPalScriptProvider } from "@paypal/react-paypal-js"; 
import CheckoutPage from "./components/userside/servicepage/CheckoutPage";




// Private Route component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const clientId = "500698877294-jam712pdk43id3s0v5mg9k1ol2jjdl6a.apps.googleusercontent.com"
  return (
    <PayPalScriptProvider options={{ "client-id": "AcnzJJQ20E7sfAW3ZALrNApOHrz2tRyqNjZkmOzpbjErKto7iq3Vy3DJHp4qO7pWU7ntJcMIuMKI-uzC" }}>
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
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/service/:serviceId" element={<ServiceDetailPage />} />
        <Route path="/worker/:workerId/slots" element={<WorkerSlotPage />} /> {/* Correctly map this route */}
        <Route path="/services/:serviceId/workers" element={<WorkersPage />} /> {/* Workers page with serviceId */}
        <Route path="/bookings" element={<PrivateRoute><UserBookingsPage /></PrivateRoute>} />
        <Route path="/checkout" element={<CheckoutPage />} />


        {/* Worker routes */}
        <Route path="/worker/signup" element={<WorkerSignupPage />} />
        <Route path="/worker/login" element={<WorkerLoginPage />} />
        <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
        <Route path="/worker/profile" element={<WorkerProfile />} />
        <Route path="/worker/services" element={<ServiceSelection />} />
        <Route path="/worker/slot-management" element={<SlotManagement />} />


        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersList />} />
        <Route path="/admin/workers" element={<WorkersList />} />
        <Route path="/admin/services/create" element={<AdminCreateService />} />
        <Route path="/admin/bookings" element={<BookingsList />} /> 
        
      </Routes>
      </GoogleOAuthProvider>
    </Router>
    </PayPalScriptProvider>
  );
};

export default App;
