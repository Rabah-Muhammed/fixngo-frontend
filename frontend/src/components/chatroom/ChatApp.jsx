import React, { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

const ChatApp = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [participant, setParticipant] = useState(null);

  const handleSelectChat = (chatId, participant) => {
    setSelectedChat(chatId);
    setParticipant(participant);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatSidebar onSelectChat={handleSelectChat} />
      {selectedChat ? (
        <ChatWindow chatId={selectedChat} participant={participant} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
};

export default ChatApp;
