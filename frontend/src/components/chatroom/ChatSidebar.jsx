import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const BASE_URL = "http://localhost:8000";

const ChatSidebar = ({ accessToken, isWorker, currentChatId, onChatSelect }) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/chat/rooms/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setRooms(response.data);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      }
    };

    if (accessToken) fetchRooms();
  }, [accessToken]);

  return (
    <div className="w-80 bg-white shadow-lg h-screen overflow-y-auto sticky top-0 border-r border-gray-200">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-wide">{isWorker ? "Worker Chats" : "User Chats"}</h3>
      </div>

      {/* Chat List */}
      <div className="space-y-1 p-2">
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            whileHover={{ backgroundColor: "#f3f4f6", scale: 1.02 }}
            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
              room.id === parseInt(currentChatId) ? "bg-blue-50 border-l-4 border-blue-500" : "bg-white"
            }`}
            onClick={() => onChatSelect(room.id)}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{room.participant}</p>
                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                  {room.messages?.length > 0 ? room.messages[room.messages.length - 1].content : "No messages yet"}
                </p>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {room.messages?.length > 0
                  ? new Date(room.messages[room.messages.length - 1].timestamp).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : ""}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;