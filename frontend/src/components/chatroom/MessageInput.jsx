import React, { useState } from "react";

const MessageInput = ({ chatId, socket }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim() || !socket) return;

    const messageData = { chatId, text: inputValue, sent: true };
    socket.send(JSON.stringify(messageData));
    setInputValue("");
  };

  return (
    <div className="p-4 bg-white shadow-md flex items-center">
      <textarea
        className="flex-1 p-2 border rounded-lg outline-none resize-none h-12 focus:ring-2 focus:ring-blue-500"
        placeholder="Type your message..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={handleSendMessage}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
