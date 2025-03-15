import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { useSelector } from "react-redux";
import axios from "axios";
import Toast from "../../utils/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaImage, FaArrowLeft } from "react-icons/fa";
import ChatSidebar from "./ChatSidebar";
import apiInstance from "../../utils/apiInstance";


const ChatPage = () => {
  const { chatId: initialChatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Get navigation state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [participantUsername, setParticipantUsername] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const { user, accessToken } = useSelector((state) => state.user);
  const userEmail = user?.email;
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [activeChatId, setActiveChatId] = useState(initialChatId);
  const workerId = location.state?.workerId; // Get workerId from state

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!accessToken || !userEmail) {
      Toast("error", "Please log in to chat.");
      navigate("/login");
      return;
    }

    const fetchParticipantUsername = async (chatId) => {
      try {
        const response = await apiInstance.get(`/api/chat/rooms/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const room = response.data.find((r) => r.id === parseInt(chatId));
        if (room) {
          setParticipantUsername(room.participant); // Worker’s username
        } else {
          setParticipantUsername("Unknown");
        }
      } catch (error) {
        console.error("Failed to fetch participant username:", error);
        setParticipantUsername("Unknown");
      }
    };

    if (activeChatId) {
      fetchParticipantUsername(activeChatId);

      const wsUrl = `ws://${apiInstance.defaults.baseURL.split("//")[1]}/ws/chat/${activeChatId}/?token=${accessToken}`;
      console.log("Connecting to WebSocket:", wsUrl);
      console.log("WebSocket Token:", accessToken);
      console.log("User Email from Redux:", userEmail);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected successfully");
        console.log("success", "Connected to chat");
      };
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log("WebSocket message received:", data);
        if (data.messages) {
          setMessages(data.messages);
          setTimeout(scrollToBottom, 100);
        } else if (data.message || data.image) {
          setMessages((prev) => {
            const updatedMessages = [...prev, { id: data.id, sender: data.sender, content: data.message, image: data.image, timestamp: data.timestamp }];
            setTimeout(scrollToBottom, 100);
            return updatedMessages;
          });
        } else if (data.error) {
          Toast("error", data.error);
          navigate("/services");
        }
      };
      ws.onclose = (e) => {
        console.log("WebSocket closed:", e.code, e.reason);
        console.error("error", `Chat closed: ${e.code}`);
      };
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        console.log("error", "WebSocket connection failed");
      };
      setSocket(ws);

      return () => {
        console.log("Closing WebSocket");
        ws.close();
      };
    } else {
      setMessages([]);
      setParticipantUsername("");
    }
  }, [activeChatId, navigate, accessToken, userEmail]);

  const sendMessage = () => {
    if (!newMessage.trim() && !selectedImage) return;
    if (socket && socket.readyState === WebSocket.OPEN) {
      if (selectedImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          socket.send(JSON.stringify({
            message: newMessage,
            image: reader.result,
          }));
          setSelectedImage(null);
          setNewMessage("");
          setTimeout(scrollToBottom, 100);
        };
        reader.readAsDataURL(selectedImage);
      } else {
        console.log("Sending message:", newMessage);
        socket.send(JSON.stringify({ message: newMessage }));
        setNewMessage("");
        setTimeout(scrollToBottom, 100);
      }
    } else {
      Toast("error", "Chat not connected.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
    } else {
      Toast("error", "Please select a valid image file.");
    }
  };

  const handleChatSelect = (chatId) => {
    setActiveChatId(chatId);
    navigate(`/chat/${chatId}`, { state: { workerId } }); // Preserve workerId in navigation
  };

  const handleBack = () => {
    if (workerId) {
      navigate(`/worker/${workerId}/visit`); // Navigate back to VisitWorker page
    } else {
      Toast("error", "Worker ID not available.");
      navigate("/services"); // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <ChatSidebar
        accessToken={accessToken}
        isWorker={false}
        currentChatId={activeChatId}
        onChatSelect={handleChatSelect}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Back Button */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3.5 flex items-center justify-between sticky top-0 z-10 shadow-lg">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-white rounded-full hover:bg-blue-700 transition-all duration-200 mr-2"
              onClick={handleBack}
            >
              <FaArrowLeft />
            </motion.button>
            <h2 className="text-xl font-bold tracking-tight">{participantUsername || "Select a Chat"}</h2>
          </div>
          <span className="text-sm opacity-80">User Chat</span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-white space-y-4">
          {activeChatId ? (
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.sender === userEmail ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-3xl shadow-xl ${
                      msg.sender === userEmail
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-black mb-1">
                        {msg.sender === userEmail ? "You" : participantUsername || "Unknown"}
                      </span>
                      {msg.content && <span className="text-sm font-light">{msg.content}</span>}
                      {msg.image && (
                        <img
                          src={`${apiInstance.defaults.baseURL}${msg.image}`}
                          alt="Shared image"
                          className="mt-2 max-w-xs h-auto rounded-lg shadow-md cursor-pointer object-contain"
                          onClick={() => window.open(`${apiInstance.defaults.baseURL}${msg.image}`, "_blank")}
                        />
                      )}
                      <span className="text-xs opacity-70 mt-2">
                        {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Please select a chat from the sidebar to start messaging.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {activeChatId && (
          <div className="bg-white p-4 border-t border-gray-200 flex items-center sticky bottom-0 shadow-lg">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-gray-200 text-gray-600 rounded-full mr-2 hover:bg-gray-300 transition-all duration-200"
              onClick={() => fileInputRef.current.click()}
            >
              <FaImage />
            </motion.button>
            {selectedImage && (
              <span className="text-sm text-gray-600 mr-2 truncate max-w-[100px]">{selectedImage.name}</span>
            )}
            <input
              className="flex-1 p-3 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all duration-200"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              className="ml-3 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md"
              onClick={sendMessage}
            >
              <FaPaperPlane />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;