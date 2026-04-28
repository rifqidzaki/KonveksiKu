"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import { io, Socket } from "socket.io-client";
import {
  ArrowLeft, Send, Paperclip, MessageSquare,
  Circle, CheckCheck
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; name: string; role: string; avatar: string | null };
}

interface Conversation {
  orderId: string;
  status: string;
  vendor: { businessName: string; user: { name: string; avatar: string | null } };
  user: { name: string; avatar: string | null };
  lastMessage: { content: string; createdAt: string; isRead: boolean; senderId: string } | null;
  unreadCount: number;
}

export default function ChatPage() {
  const { user, loadUser } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadUser();
    fetchConversations();
  }, []);

  // Connect socket
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      auth: { token },
    });

    newSocket.on("connect", () => console.log("Socket connected"));
    newSocket.on("connect_error", (err) => console.error("Socket error:", err.message));

    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, []);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    socket.on("new_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    socket.on("chat_history", (history: Message[]) => {
      setMessages(history);
      setTimeout(scrollToBottom, 100);
    });

    socket.on("user_typing", (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== user?.id) setIsTyping(data.isTyping);
    });

    socket.on("messages_read", () => {
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    });

    return () => {
      socket.off("new_message");
      socket.off("chat_history");
      socket.off("user_typing");
      socket.off("messages_read");
    };
  }, [socket, user]);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/api/messages/conversations");
      setConversations(res.data.conversations);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = (orderId: string) => {
    setActiveOrderId(orderId);
    setMessages([]);
    if (socket) {
      socket.emit("join_room", orderId);
      socket.emit("mark_read", orderId);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !activeOrderId) return;
    socket.emit("send_message", {
      orderId: activeOrderId,
      content: newMessage.trim(),
    });
    setNewMessage("");
    socket.emit("typing", { orderId: activeOrderId, isTyping: false });
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (!socket || !activeOrderId) return;

    socket.emit("typing", { orderId: activeOrderId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { orderId: activeOrderId, isTyping: false });
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  const activeConversation = conversations.find((c) => c.orderId === activeOrderId);
  const chatPartnerName = user?.role === "VENDOR"
    ? activeConversation?.user.name
    : activeConversation?.vendor.businessName;

  return (
    <div className="h-screen bg-navy-900 text-white flex flex-col">
      {/* Header */}
      <nav className="h-16 glass border-b border-white/10 flex items-center px-4 gap-4 flex-shrink-0 z-10">
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-white/5">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Link href="/" className="text-2xl font-bold bg-gradient-coral bg-clip-text text-transparent">KonveksiKu</Link>
        <span className="text-gray-500 mx-2">/</span>
        <h1 className="text-lg font-semibold">Chat</h1>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <aside className={`w-80 bg-navy-800 border-r border-white/10 flex-shrink-0 overflow-y-auto ${activeOrderId ? "hidden md:block" : ""}`}>
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Percakapan</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-coral-500/30 border-t-coral-500 rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Belum ada percakapan</p>
                <p className="text-xs mt-1">Buat pesanan untuk memulai chat</p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => {
                  const name = user?.role === "VENDOR" ? conv.user.name : conv.vendor.businessName;
                  const initial = name?.charAt(0) || "?";
                  return (
                    <button
                      key={conv.orderId}
                      onClick={() => joinRoom(conv.orderId)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left ${
                        activeOrderId === conv.orderId
                          ? "bg-coral-500/10 border border-coral-500/30"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-coral flex items-center justify-center text-white font-bold flex-shrink-0">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-white text-sm font-medium truncate">{name}</p>
                          {conv.lastMessage && (
                            <span className="text-gray-600 text-xs">{formatDate(conv.lastMessage.createdAt)}</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-gray-500 text-xs truncate">
                            {conv.lastMessage?.content || "Belum ada pesan"}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-coral-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!activeOrderId ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Pilih percakapan untuk mulai chat</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-16 glass border-b border-white/10 flex items-center px-6 flex-shrink-0">
                <button onClick={() => setActiveOrderId(null)} className="md:hidden text-gray-400 hover:text-white mr-3">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-coral flex items-center justify-center text-white font-bold text-sm mr-3">
                  {chatPartnerName?.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{chatPartnerName}</p>
                  <p className="text-gray-500 text-xs">Order #{activeOrderId.slice(0, 8)}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-600 py-8">
                    <p className="text-sm">Belum ada pesan. Mulai percakapan!</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.sender.id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] ${isMe ? "order-last" : ""}`}>
                        {!isMe && (
                          <p className="text-xs text-gray-500 mb-1 ml-1">{msg.sender.name}</p>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl ${
                          isMe
                            ? "bg-coral-500 text-white rounded-br-md"
                            : "bg-navy-700 text-gray-200 rounded-bl-md"
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
                          <span className="text-gray-600 text-xs">{formatTime(msg.createdAt)}</span>
                          {isMe && (
                            <CheckCheck className={`w-3.5 h-3.5 ${msg.isRead ? "text-blue-400" : "text-gray-600"}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-navy-700 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button className="p-2.5 text-gray-500 hover:text-gray-300 transition rounded-lg hover:bg-white/5">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Ketik pesan..."
                    className="flex-1 py-3 px-4 rounded-xl bg-navy-800 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-coral-500 transition"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 rounded-xl bg-gradient-coral text-white hover:opacity-90 transition disabled:opacity-30 shadow-lg shadow-coral-500/25"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
