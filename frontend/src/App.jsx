// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PayPalScriptProvider } from "@paypal/react-paypal-js"; 

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
import WorkerReviewsPage from "./components/userside/reviewrating/WorkerReviewsPage";
import UserBookingsPage from "./components/userside/bookings/UserBookingsPage";
import BookingDetailPage from "./components/userside/bookings/BookingDetailPage";
import CheckoutPage from "./components/userside/servicepage/CheckoutPage";
import ReviewPage from "./components/userside/reviewrating/ReviewPage";
import SuccessPage from "./components/userside/servicepage/SuccessPage";
import VisitWorker from "./components/userside/servicepage/VisitWorker";
import VideoCall from "./components/chatroom/VideoCall";
import ChatPage from "./components/chatroom/ChatPage";


// Worker-side components
import WorkerSignupPage from "./components/workerside/workerauth/WorkerSignupPage";
import WorkerLoginPage from "./components/workerside/workerauth/WorkerLoginPage";
import WorkerDashboardPage from "./components/workerside/workerauth/WorkerDashboardPage";
import WorkerProfile from "./components/workerside/workerauth/workerprofile/WorkerProfile";
import SlotManagement from "./components/workerside/slotsmanage/SlotManagement";
import ServiceSelection from "./components/workerside/servicemanage/ServiceSelection";
import WorkerBookings from "./components/workerside/bookingmanage/WorkerBookings";
import WorkerManageBookings from "./components/workerside/bookingmanage/WorkerManageBookings";
import WorkerCompletedBookings from "./components/workerside/bookingmanage/WorkerCompletedBookings";
import WorkerReviews from "./components/workerside/reviewsandrate/WorkerReviews";
import WorkerWallet from "./components/workerside/bookingmanage/WorkerWallet";
import WorkerChatPage from "./components/chatroom/WorkerChatPage";



// Admin-side components
import AdminLoginPage from "./components/adminside/adminauth/AdminLoginPage";
import AdminDashboard from "./components/adminside/adminauth/AdminDashboard";
import UsersList from "./components/adminside/adminauth/UsersList";
import WorkersList from "./components/adminside/adminauth/WorkersList";
import AdminLayout from "./components/adminside/adminauth/AdminLayout"; // Import Admin Layout
import AdminCreateService from "./components/adminside/adminauth/AdminCreateService";
import BookingsList from "./components/adminside/adminauth/BookingsList";
import AdminReviews from "./components/adminside/adminauth/AdminReviews";









// Private Route component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const clientId = "500698877294-jam712pdk43id3s0v5mg9k1ol2jjdl6a.apps.googleusercontent.com" //google sso client id
  return (
    <PayPalScriptProvider options={{ "client-id": "Abbw-mOUb25GBacq0mna6jVOAGdre9n4QdtYDgx-AXrg7VdoBVM3Jom2adaSJiFQWdnSgeFJZES8da3H" }}>
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
        <Route path="/worker/:workerId/reviews" element={<WorkerReviewsPage />} />
        <Route path="/services/:serviceId/workers" element={<WorkersPage />} /> {/* Workers page with serviceId */}
        <Route path="/bookings" element={<PrivateRoute><UserBookingsPage /></PrivateRoute>} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/booking/:bookingId" element={<BookingDetailPage />} />
        <Route path="/review/:bookingId" element={<ReviewPage />} /> 
        <Route path="/worker/:workerId/visit" element={<VisitWorker />} />
        <Route path="/user/video-call" element={<VideoCall role="user" />} /> 
        <Route path="/chat/:chatId" element={<ChatPage />} /> 
        <Route path="/worker/chat/:chatId" element={<WorkerChatPage />} />


        {/* Worker routes */}
        <Route path="/worker/signup" element={<WorkerSignupPage />} />
        <Route path="/worker/login" element={<WorkerLoginPage />} />
        <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
        <Route path="/worker/profile" element={<WorkerProfile />} />
        <Route path="/worker/services" element={<ServiceSelection />} />
        <Route path="/worker/slot-management" element={<SlotManagement />} />
        <Route path="/worker/bookings" element={<WorkerBookings />} /> 
        <Route path="/worker/manage-bookings" element={<WorkerManageBookings />} />
        <Route path="/worker/completed-bookings" element={<WorkerCompletedBookings />} />
        <Route path="/worker/reviews" element={<WorkerReviews />} />
        <Route path="/worker/video-call" element={<VideoCall role="worker" />} /> 
        <Route path="/worker/wallet" element={<WorkerWallet />} />
        <Route path="/worker/chat" element={<WorkerChatPage />} />

        


        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersList />} />
        <Route path="/admin/workers" element={<WorkersList />} />
        <Route path="/admin/services/create" element={<AdminCreateService />} />
        <Route path="/admin/bookings" element={<BookingsList />} /> 
        <Route path="/admin/reviews" element={<AdminReviews />} />
        





      </Routes>
      </GoogleOAuthProvider>
    </Router>
    </PayPalScriptProvider>
  );
};

export default App;
