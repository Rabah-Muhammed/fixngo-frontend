import React, { useEffect, useState } from "react";
import MessageInput from "./MessageInput";

const ChatWindow = ({ chatId, participant }) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!chatId) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/?token=${localStorage.getItem("userAccessToken")}`);
    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prev) => [...prev, newMessage]);
    };
    ws.onclose = () => console.log("WebSocket disconnected");

    setSocket(ws);

    return () => ws.close();
  }, [chatId]);

  return (
    <div className="flex flex-col flex-1 bg-gray-100">
      <div className="p-4 bg-white shadow-md">
        <h2 className="text-lg font-semibold">Chat with {participant}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sent ? "justify-end" : "justify-start"} my-2`}>
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                msg.sent ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <MessageInput chatId={chatId} socket={socket} />
    </div>
  );
};

export default ChatWindow;
