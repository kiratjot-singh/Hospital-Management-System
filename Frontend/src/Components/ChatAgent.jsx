import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { MessageSquare, X, Send, Bot, Heart } from "lucide-react";
import "./ChatAgent.css";

const ChatAgent = ({ patientId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm CareFlow AI, your virtual assistant. How can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = messages.slice(1).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const agentBaseUrl = import.meta.env.VITE_AGENT_BASE_URL || "http://localhost:8000";
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${agentBaseUrl}/api/chat`,
        {
          message: userMessage.content,
          history: chatHistory,
          patientId: patientId,
          token: token,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (response.data && response.data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I received an invalid response format." },
        ]);
      }
    } catch (error) {
      console.error("Chat agent error:", error);
      let errMsg = "Unable to connect to CareFlow AI. Please make sure the AI assistant service is running.";
      if (error.response?.data?.detail) {
        errMsg = error.response.data.detail;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errMsg },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-agent-container">
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button 
            className="chat-floating-btn" 
            onClick={toggleChat} 
            title="Chat with CareFlow AI"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare size={20} className="pulse-icon" />
            <span className="chat-btn-text">CareFlow AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chat-window glass-panel"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ cubicBezier: [0.16, 1, 0.3, 1], duration: 0.4 }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar-circle">
                  <Bot size={20} />
                </div>
                <div>
                  <h4>CareFlow Assistant</h4>
                  <span className="chat-status-indicator">Online</span>
                </div>
              </div>
              <button className="chat-close-btn" onClick={toggleChat}>
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`chat-message-row ${msg.role}`}>
                  {msg.role === "assistant" && (
                    <div className="msg-avatar-icon">
                      <Bot size={14} />
                    </div>
                  )}
                  <div className={`chat-message-bubble ${msg.role}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-message-row assistant">
                  <div className="msg-avatar-icon">
                    <Bot size={14} />
                  </div>
                  <div className="chat-message-bubble assistant loading-bubble">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Form Input */}
            <form className="chat-input-area" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Ask CareBot about scheduling..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" className="chat-send-btn" disabled={!input.trim() || isLoading}>
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatAgent;
