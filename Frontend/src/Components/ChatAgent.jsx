import React, { useState, useRef, useEffect } from "react";
import "./ChatAgent.css";
import axios from "axios";

const ChatAgent = () => {
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
      // Prepare message history formatted for our backend api
      const chatHistory = messages.slice(1).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await axios.post("http://localhost:8000/api/chat", {
        message: userMessage.content,
        history: chatHistory,
      });

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
      {!isOpen && (
        <button className="chat-floating-btn" onClick={toggleChat} title="Chat with CareFlow AI">
          <span className="chat-icon">💬</span>
          <span className="chat-btn-text">CareFlow AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <span className="chat-avatar-icon">🤖</span>
              <div>
                <h4>CareFlow Assistant</h4>
                <span className="chat-status-indicator">Online</span>
              </div>
            </div>
            <button className="chat-close-btn" onClick={toggleChat}>
              &times;
            </button>
          </div>

          {/* Messages Area */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message-row ${msg.role}`}>
                {msg.role === "assistant" && <span className="msg-avatar">🤖</span>}
                <div className={`chat-message-bubble ${msg.role}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message-row assistant">
                <span className="msg-avatar">🤖</span>
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
              placeholder="Ask me about booking, doctors..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="chat-send-btn" disabled={!input.trim() || isLoading}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatAgent;
