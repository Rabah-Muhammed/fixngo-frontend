import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Toast from "../../utils/Toast";
import apiInstance from "../../utils/apiInstance";



const ChatSidebar = ({ accessToken, isWorker, currentChatId, onChatSelect, userEmail }) => {
  const [rooms, setRooms] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await apiInstance.get(`/api/chat/rooms/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setRooms(response.data);
        const initialUnread = {};
        response.data.forEach(room => {
          initialUnread[room.id] = 0;
        });
        setUnreadMessages(initialUnread);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        Toast("error", "Failed to load chat rooms");
      }
    };

    if (accessToken) fetchRooms();

    const ws = new WebSocket(`wss://${apiInstance.defaults.baseURL.split("//")[1]}/ws/notifications/?token=${accessToken}`);
    ws.onopen = () => console.log("Notification WebSocket connected");
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("Notification received:", data);
      if (data.chat_id && data.sender !== userEmail) {
        setRooms(prevRooms => {
          return prevRooms.map(room => {
            if (room.id === parseInt(data.chat_id)) {
              return {
                ...room,
                last_message: {
                  content: data.message,
                  timestamp: data.timestamp,
                  sender: data.sender,
                },
              };
            }
            return room;
          });
        });

        if (data.chat_id !== currentChatId) {
          setUnreadMessages(prev => ({
            ...prev,
            [data.chat_id]: (prev[data.chat_id] || 0) + 1,
          }));
        }
      }
    };
    ws.onclose = (e) => console.log("Notification WebSocket closed:", e.code, e.reason);
    ws.onerror = (error) => {
      console.error("Notification WebSocket error:", error);
      console.log("error", "Notification connection failed");
    };

    return () => {
      console.log("Closing Notification WebSocket");
      ws.close();
    };
  }, [accessToken, currentChatId, userEmail]);

  const handleChatSelect = (chatId) => {
    onChatSelect(chatId);
    setUnreadMessages(prev => ({
      ...prev,
      [chatId]: 0,
    }));
  };

  return (
    <div className="w-80 bg-white shadow-lg h-screen overflow-y-auto sticky top-0 border-r border-gray-200">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-wide">{isWorker ? "Worker Chats" : "User Chats"}</h3>
      </div>
      <div className="space-y-1 p-2">
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            whileHover={{ backgroundColor: "#f3f4f6", scale: 1.02 }}
            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
              room.id === parseInt(currentChatId) ? "bg-blue-50 border-l-4 border-blue-500" : "bg-white"
            }`}
            onClick={() => handleChatSelect(room.id)}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{room.participant}</p>
                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                  {room.last_message ? room.last_message.content : "No messages yet"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 font-medium">
                  {room.last_message
                    ? new Date(room.last_message.timestamp).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : ""}
                </span>
                {unreadMessages[room.id] > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadMessages[room.id]}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;