import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/userSlice"; // Import the logout action

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get authentication state from Redux
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);
  const user = useSelector(state => state.user.user); // Get user data from Redux store

  const handleLogout = () => {
    // Dispatch logout action
    dispatch(logout());
    localStorage.removeItem("userAccessToken");
    localStorage.removeItem("userRefreshToken");
    navigate("/login");
  };

  return (
    <nav className="bg-white fixed shadow-md top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-8 h-8 mr-2"
            />
            <Link to="/" className="text-black text-2xl font-bold">
              FixNgo
            </Link>
          </div>

          <ul className="flex space-x-4 items-center">
            {/* Services Button (Visible to All Users) */}
            <li>
              <Link to="/services" className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm">
                Services
              </Link>
            </li>

            {!isAuthenticated ? (
              <>
                <li>
                  <Link to="/signup" className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/worker/signup" className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm">
                    Sign up as Expert
                  </Link>
                </li>
              </>
            ) : (
              <>

                <li>
                  <Link to="/bookings" className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm">
                    Bookings
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm">
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
    </nav>
  );
};

export default Navbar;
