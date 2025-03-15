import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/userSlice";
import { FaBell } from "react-icons/fa";
import Toast from "../../utils/Toast";
import api from "../../utils/axiosInterceptor"; // Use the `api` instance
import { motion, AnimatePresence } from "framer-motion"; // Added for animation

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.user);
  const accessToken = useSelector((state) => state.user.accessToken);
  const userEmail = user?.email;

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get("/api/chat/rooms/"); // Use `api` instead of `axios`
        const initialNotifications = {};
        response.data.forEach((room) => {
          initialNotifications[room.id] = {
            participant: room.participant,
            count: 0,
          };
        });
        setNotifications(initialNotifications);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        Toast("error", "Failed to load chat rooms");
      }
    };

    if (isAuthenticated && accessToken) fetchRooms();
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !userEmail) return;

    const ws = new WebSocket(
      `ws://${api.defaults.baseURL.split("//")[1]}/ws/notifications/?token=${accessToken}`
    );

    ws.onopen = () => console.log("Navbar Notification WebSocket connected");
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("Navbar Notification received:", data);
      if (data.chat_id && data.sender !== userEmail) {
        setNotifications((prev) => {
          const chatId = data.chat_id;
          const updated = { ...prev };
          if (updated[chatId]) {
            updated[chatId].count += 1;
          } else {
            updated[chatId] = { participant: data.sender.split("@")[0], count: 1 };
          }
          return updated;
        });
        setUnreadCount((prev) => prev + 1);
      }
    };
    ws.onclose = (e) =>
      console.log("Navbar Notification WebSocket closed:", e.code, e.reason);
    ws.onerror = (error) => {
      console.error("Navbar Notification WebSocket error:", error);
    };

    return () => ws.close();
  }, [isAuthenticated, accessToken, userEmail]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("userAccessToken");
    localStorage.removeItem("userRefreshToken");
    navigate("/login");
  };

  const handleNotificationClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleChatSelect = (chatId) => {
    setNotifications((prev) => ({
      ...prev,
      [chatId]: { ...prev[chatId], count: 0 },
    }));
    setUnreadCount((prev) => prev - (notifications[chatId]?.count || 0));
    setShowDropdown(false);
    navigate(`/chat/${chatId}`);
  };

  return (
    <nav className="bg-white fixed shadow-md top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <img src="/images/logo.png" alt="Logo" className="w-8 h-8 mr-2" />
            <Link to="/" className="text-black text-2xl font-bold">
              FixNgo
            </Link>
          </div>

          <ul className="flex space-x-4 items-center">
            <li>
              <Link
                to="/services"
                className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm"
              >
                Services
              </Link>
            </li>

            {!isAuthenticated ? (
              <>
                <li>
                  <Link
                    to="/signup"
                    className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/worker/signup"
                    className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm"
                  >
                    Sign up as Expert
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/bookings"
                    className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm"
                  >
                    Bookings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm"
                  >
                    Profile
                  </Link>
                </li>
                <li className="relative" ref={dropdownRef}>
                  <button
                    onClick={handleNotificationClick}
                    className="p-2 text-black hover:text-gray-800 transition duration-300"
                  >
                    <FaBell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-72 bg-gradient-to-br from-white to-gray-100 shadow-xl rounded-xl border border-gray-200 z-50 max-h-72 overflow-y-auto"
                      >
                        {Object.keys(notifications).length === 0 || unreadCount === 0 ? (
                          <div className="p-4 text-gray-500 text-sm text-center">No new messages</div>
                        ) : (
                          Object.entries(notifications)
                            .filter(([_, { count }]) => count > 0)
                            .map(([chatId, { participant, count }]) => (
                              <motion.button
                                key={chatId}
                                onClick={() => handleChatSelect(chatId)}
                                whileHover={{ scale: 1.02, backgroundColor: "#f1f5f9" }}
                                className="w-full text-left px-4 py-3 flex justify-between items-center transition duration-200 border-b border-gray-100 last:border-b-0"
                              >
                                <span className="text-sm font-semibold text-gray-800 truncate">{participant}</span>
                                <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                                  {count}
                                </span>
                              </motion.button>
                            ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
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