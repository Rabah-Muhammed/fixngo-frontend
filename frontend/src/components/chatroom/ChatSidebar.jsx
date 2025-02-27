import React, { useEffect, useState } from "react";
import axios from "axios";

const ChatSidebar = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("userAccessToken");
        if (!token) {
          setError("Authentication token missing!");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8000/api/chat-rooms/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setChats(response.data);
      } catch (err) {
        setError("Failed to load chats.");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4">
      <h2 className="text-xl font-semibold mb-4">Chats</h2>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : chats.length > 0 ? (
        <div className="space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id, chat.participant)}
              className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700"
            >
              {chat.participant.username}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No chats found</p>
      )}
    </div>
  );
};

export default ChatSidebar;
