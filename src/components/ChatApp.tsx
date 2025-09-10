"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Chat from "./Chat";
import {
  getLocalStorageValue,
  setLocalStorageItem,
  removeLocalStorageItem,
} from "../app/utils/utils";
import { Menu, PanelRight, SquarePen, Trash2, X } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatType {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

export default function ChatApp() {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
const [deleteId, setDeleteId] = useState<string | null>(null);

  
  useEffect(() => {
    const stored = getLocalStorageValue<ChatType[]>("chats");
    if (stored) {
      setChats(stored);
      setActiveChatId(stored[0]?.id || null);
    }
  }, []);

  
  useEffect(() => {
    setLocalStorageItem("chats", chats);
  }, [chats]);

  const createNewChat = () => {
    const newChat: ChatType = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };



  const updateChatMessages = (id: string, messages: Message[]) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, messages, title: messages[0]?.content || "New Chat" }
          : c
      )
    );
  };

    const requestDeleteChat = (id: string) => {
  setDeleteId(id);
  setConfirmOpen(true);
};

const handleConfirmDelete = () => {
  if (!deleteId) return;
  const updated = chats.filter((c) => c.id !== deleteId);
  setChats(updated);
  removeLocalStorageItem("chats");
  setLocalStorageItem("chats", updated);
  if (deleteId === activeChatId) {
    setActiveChatId(updated[0]?.id || null);
  }
  setDeleteId(null);
};
  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
<motion.div
  initial={{ x: "-100%" }}
  animate={{ x: sidebarOpen ? 0 : "-100%" }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
  className="fixed top-0 left-0 h-full lg:w-72 w-52 bg-gray-50 border-r shadow-lg flex flex-col z-50"
>
  <div className="flex justify-between items-center p-3 border-b">
    <span className="font-semibold">Chats</span>
    <button onClick={() => setSidebarOpen(false)}>
      <PanelRight />
    </button>
  </div>

  <div
    onClick={createNewChat}
    className="m-3 p-2 rounded-lg bg-black text-white flex items-center px-4 cursor-pointer"
  >
    <SquarePen />
    <p className="font-bold text-white font-mono ml-auto">New chat</p>
  </div>

  <div className="flex-1 overflow-y-auto">
    {chats.map((chat) => (
      <div
        key={chat.id}
        className={`flex justify-between items-center px-3 py-2 cursor-pointer ${
          chat.id === activeChatId ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        onClick={() => setActiveChatId(chat.id)}
      >
        <span className="truncate font-sans font-semibold lg:text-lg text-sm">
          {chat.title}
        </span>
        <button
          className="text-red-500 text-xs ml-2"
          onClick={(e) => {
            e.stopPropagation();
            requestDeleteChat(chat.id);
          }}
        >
          <Trash2 />
        </button>
      </div>
    ))}
  </div>
</motion.div>


     <div className="flex-1 relative">
  {!sidebarOpen && (
    <button
      onClick={() => setSidebarOpen(true)}
      className="absolute top-3 left-3 p-2 bg-gray-100 rounded-md shadow-md z-10"
    >
      <Menu size={18} />
    </button>
  )}

  {activeChat ? (
    <Chat
      key={activeChat.id}
      chatId={activeChat.id}
      messages={activeChat.messages}
      onUpdateMessages={(msgs) => updateChatMessages(activeChat.id, msgs)}
    />
  ) : (
    <div className="flex items-center justify-center h-full text-gray-500 font-sans">
      Start a new chat to begin
    </div>
  )}
</div>

      <ConfirmModal
  isOpen={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  onConfirm={handleConfirmDelete}
/>
    </div>
  );
}
