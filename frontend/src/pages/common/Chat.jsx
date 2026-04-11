import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../../api";

const Chat = () => {
  const { orderId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const token = localStorage.getItem("token");
  const currentUserName = localStorage.getItem("name");
  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* 🔹 SOCKET CONNECTION */
  useEffect(() => {
    socket.current = io(`${API}`);

    socket.current.emit("joinRoom", orderId);

    socket.current.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    // Typing indicator
    socket.current.on("userTyping", ({ userId, isTyping }) => {
      if (userId !== currentUserId) {
        setOtherUserTyping(isTyping);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [orderId, currentUserId]);

  /* 🔹 FETCH MESSAGES */
  useEffect(() => {
    if (!orderId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${API}/api/messages/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMessages(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchMessages();
  }, [orderId, token]);

  /* 🔹 AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* 🔹 TYPING INDICATOR */
  const handleTyping = (e) => {
    setText(e.target.value);
    
    // Emit typing event to socket
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.current.emit("typing", { 
      orderId, 
      userId: currentUserId, 
      isTyping: true 
    });

    typingTimeoutRef.current = setTimeout(() => {
      socket.current.emit("typing", { 
        orderId, 
        userId: currentUserId, 
        isTyping: false 
      });
    }, 1000);
  };

  /* 🔹 SEND MESSAGE */
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `${API}/api/messages`,
        {
          orderId,
          text,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newMessage = res.data;

      // 🔥 emit to socket
      socket.current.emit("sendMessage", {
        orderId,
        message: newMessage,
      });

      setMessages((prev) => [...prev, newMessage]);
      setText("");
      
      // Reset typing indicator
      socket.current.emit("typing", { 
        orderId, 
        userId: currentUserId, 
        isTyping: false 
      });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* 🔹 ENTER KEY */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* 🔹 FORMAT TIME */
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Full screen wrapper */
        .chat-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Chat container */
        .chat-container {
          width: 95%;
          max-width: 1000px;
          height: 85vh;
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 5px 12px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        /* Chat header */
        .chat-header {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          padding: 1.25rem 1.5rem;
          color: white;
        }

        .chat-header h2 {
          font-size: 1.3rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .chat-header p {
          font-size: 0.8rem;
          opacity: 0.9;
          margin-top: 0.25rem;
        }

        /* Online status indicator */
        .online-status {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          margin-top: 0.5rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* Messages area */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Custom scrollbar */
        .messages-area::-webkit-scrollbar {
          width: 6px;
        }

        .messages-area::-webkit-scrollbar-track {
          background: #e5e7eb;
          border-radius: 3px;
        }

        .messages-area::-webkit-scrollbar-thumb {
          background: #22c55e;
          border-radius: 3px;
        }

        /* Message bubble */
        .message {
          display: flex;
          flex-direction: column;
          max-width: 70%;
          animation: fadeIn 0.3s ease;
        }

        .message-own {
          align-self: flex-end;
        }

        .message-other {
          align-self: flex-start;
        }

        /* Message bubble content */
        .message-bubble {
          padding: 0.75rem 1rem;
          border-radius: 1.25rem;
          word-wrap: break-word;
          position: relative;
        }

        .message-own .message-bubble {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border-bottom-right-radius: 0.25rem;
        }

        .message-other .message-bubble {
          background: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 0.25rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Sender name */
        .message-sender {
          font-size: 0.7rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          margin-left: 0.25rem;
        }

        .message-own .message-sender {
          color: #16a34a;
          text-align: right;
        }

        .message-other .message-sender {
          color: #0ea5e9;
        }

        /* Message text */
        .message-text {
          font-size: 0.95rem;
          line-height: 1.4;
        }

        /* Message time */
        .message-time {
          font-size: 0.65rem;
          margin-top: 0.25rem;
          margin-left: 0.25rem;
          color: #9ca3af;
        }

        .message-own .message-time {
          text-align: right;
        }

        /* Typing indicator */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 1rem;
          width: fit-content;
          border: 1px solid #e5e7eb;
          animation: fadeIn 0.3s ease;
        }

        .typing-dots {
          display: flex;
          gap: 0.25rem;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: typingBounce 1.4s infinite;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-6px);
          }
        }

        /* No messages */
        .no-messages {
          text-align: center;
          padding: 2rem;
          color: #9ca3af;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        /* Input area */
        .input-area {
          padding: 1rem 1.5rem;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
        }

        .message-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 1rem;
          font-size: 0.95rem;
          font-family: inherit;
          resize: none;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #1f2937;
        }

        .message-input::placeholder {
          color: #9ca3af;
        }

        .message-input:focus {
          outline: none;
          border-color: #22c55e;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
          color: #1f2937;
        }

        .send-btn {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 1rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .send-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        .send-btn:active {
          transform: translateY(0);
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .chat-wrapper {
            padding: 1rem;
          }
          
          .chat-container {
            width: 100%;
            height: 90vh;
          }
          
          .message {
            max-width: 85%;
          }
          
          .chat-header h2 {
            font-size: 1.1rem;
          }
          
          .message-bubble {
            padding: 0.6rem 0.9rem;
          }
          
          .message-text {
            font-size: 0.9rem;
          }
          
          .input-area {
            padding: 0.75rem 1rem;
          }
          
          .send-btn {
            padding: 0.75rem 1rem;
          }
        }
      `}</style>

      <div className="chat-wrapper">
        <div className="chat-container">
          <div className="chat-header">
            <h2>💬 Chat Discussion</h2>
            <p>Order ID: {orderId}</p>
            <div className="online-status">
              <div className="status-dot"></div>
              <span>Connected</span>
            </div>
          </div>

          <div className="messages-area">
            {messages.length === 0 ? (
              <div className="no-messages">
                <span style={{ fontSize: "2rem" }}>💭</span>
                <p>No messages yet</p>
                <span style={{ fontSize: "0.85rem" }}>
                  Start the conversation about this order
                </span>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isOwn = msg.sender?.name === currentUserName;

                  return (
                    <div
                      key={msg._id}
                      className={`message ${
                        isOwn ? "message-own" : "message-other"
                      }`}
                    >
                      <div className="message-sender">
                        {msg.sender?.name || "User"}
                        {isOwn && " (You)"}
                      </div>

                      <div className="message-bubble">
                        <div className="message-text">{msg.text}</div>
                      </div>

                      <div className="message-time">
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Typing indicator */}
            {otherUserTyping && (
              <div className="typing-indicator">
                <span>Someone is typing</span>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <textarea
              className="message-input"
              placeholder="Type your message..."
              value={text}
              onChange={handleTyping}
              onKeyDown={handleKeyPress}
              rows={1}
            />

            <button className="send-btn" onClick={sendMessage}>
              Send →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;