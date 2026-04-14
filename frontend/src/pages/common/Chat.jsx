import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../../api";

const Chat = () => {
  const { orderId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const token = localStorage.getItem("token");
  const currentUserName = localStorage.getItem("name");
  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* ================= SOCKET ================= */
  useEffect(() => {
    socket.current = io(`${API}`);

    socket.current.emit("joinRoom", orderId);

    socket.current.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.current.on("userTyping", ({ userId, isTyping }) => {
      if (userId !== currentUserId) setOtherUserTyping(isTyping);
    });

    return () => socket.current.disconnect();
  }, [orderId, currentUserId]);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API}/api/messages/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchMessages();
  }, [orderId, token]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= IMAGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setImage(null);
    setPreview(null);
  };

  /* ================= TYPING ================= */
  const handleTyping = (e) => {
    setText(e.target.value);

    socket.current.emit("typing", {
      orderId,
      userId: currentUserId,
      isTyping: true,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.current.emit("typing", {
        orderId,
        userId: currentUserId,
        isTyping: false,
      });
    }, 1000);
  };

  /* ================= SEND ================= */
  const sendMessage = async () => {
    if (!text.trim() && !image) return;

    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("text", text);
      if (image) formData.append("image", image);

      const res = await axios.post(`${API}/api/messages`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newMessage = res.data;

      // ✅ instant UI update
      setMessages((prev) => [...prev, newMessage]);

      socket.current.emit("sendMessage", {
        orderId,
        message: newMessage,
      });

      setText("");
      clearMedia();

      socket.current.emit("typing", {
        orderId,
        userId: currentUserId,
        isTyping: false,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (t) =>
    t
      ? new Date(t).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  /* ================= UI ================= */
  return (
    <div className="chat-page">
      <div className="chat-container">

        {/* HEADER */}
        <div className="chat-header">
          <h2>💬 Chat Discussion</h2>
          <p>Order ID: {orderId}</p>
          <div className="online-status">
            <div className="status-dot"></div>
            <span>Live • Real-time</span>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <span>💬</span>
              <p>No messages yet</p>
              <p>Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender?.name === currentUserName;

              return (
                <div
                  key={msg._id}
                  className={`msg-row ${isOwn ? "right" : "left"}`}
                >
                  <div className={`bubble ${isOwn ? "own" : "other"}`}>
                    {msg.text && <div className="msg-text">{msg.text}</div>}

                    {msg.image?.url && (
                      <img 
                        src={msg.image.url} 
                        className="msg-img" 
                        alt="chat"
                        onClick={() => window.open(msg.image.url, "_blank")}
                      />
                    )}

                    <div className="msg-time">{formatTime(msg.createdAt)}</div>
                  </div>
                </div>
              );
            })
          )}

          {otherUserTyping && (
            <div className="typing-indicator">
              <span>Someone is typing</span>
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* PREVIEW */}
        {preview && (
          <div className="preview">
            <img src={preview} alt="preview" />
            <button onClick={clearMedia}>×</button>
          </div>
        )}

        {/* INPUT */}
        <div className="input-area">
          <label className="file-label" title="Attach image">
            📎
            <input type="file" hidden onChange={handleImageChange} accept="image/*" />
          </label>

          <textarea
            className="message-input"
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
          />

          <button className="send-btn" onClick={sendMessage}>
            Send →
          </button>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .chat-page {
          width: 100vw;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
          padding: 1rem;
        }

        .chat-container {
          width: 100%;
          max-width: 1000px;
          height: 85vh;
          background: white;
          border-radius: 1.5rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.1);
          animation: fadeInUp 0.4s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-header {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          padding: 1.25rem 1.5rem;
          color: white;
        }

        .chat-header h2 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .chat-header p {
          font-size: 0.8rem;
          opacity: 0.9;
        }

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
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .messages::-webkit-scrollbar {
          width: 6px;
        }

        .messages::-webkit-scrollbar-track {
          background: #e5e7eb;
          border-radius: 3px;
        }

        .messages::-webkit-scrollbar-thumb {
          background: #22c55e;
          border-radius: 3px;
        }

        .msg-row {
          display: flex;
          width: 100%;
          animation: fadeIn 0.3s ease;
        }

        .msg-row.right {
          justify-content: flex-end;
        }

        .msg-row.left {
          justify-content: flex-start;
        }

        .bubble {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 1.25rem;
          position: relative;
        }

        .bubble.own {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border-bottom-right-radius: 0.25rem;
        }

        .bubble.other {
          background: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 0.25rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .msg-text {
          font-size: 0.95rem;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .msg-img {
          max-width: 200px;
          margin-top: 0.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .msg-img:hover {
          transform: scale(1.02);
        }

        .msg-time {
          font-size: 0.65rem;
          margin-top: 0.25rem;
          opacity: 0.7;
        }

        .bubble.own .msg-time {
          text-align: right;
        }

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

        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }

        .no-messages {
          text-align: center;
          padding: 3rem;
          color: #94a3b8;
        }

        .no-messages span {
          font-size: 3rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .no-messages p {
          margin: 0.25rem 0;
        }

        .preview {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: #f1f5f9;
          border-top: 1px solid #e5e7eb;
        }

        .preview img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 0.5rem;
          border: 2px solid #22c55e;
        }

        .preview button {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .preview button:hover {
          transform: scale(1.1);
        }

        .input-area {
          padding: 1rem 1.5rem;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
        }

        .file-label {
          cursor: pointer;
          font-size: 1.5rem;
          padding: 0.5rem;
          transition: all 0.2s;
          background: #f1f5f9;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-label:hover {
          background: #e2e8f0;
          transform: scale(1.05);
        }

        .message-input {
          flex: 1;
          padding: 0.85rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 1rem;
          font-size: 0.95rem;
          font-family: inherit;
          resize: none;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #1f2937;
        }

        .message-input:focus {
          outline: none;
          border-color: #22c55e;
          background: white;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .message-input::placeholder {
          color: #9ca3af;
        }

        .send-btn {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border: none;
          padding: 0.85rem 1.5rem;
          border-radius: 1rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .send-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .chat-page { padding: 0.5rem; }
          .chat-container { height: 95vh; border-radius: 1rem; }
          .bubble { max-width: 85%; }
          .chat-header { padding: 1rem; }
          .messages { padding: 1rem; }
          .input-area { padding: 0.75rem 1rem; gap: 0.5rem; }
          .send-btn { padding: 0.75rem 1rem; }
          .file-label { width: 36px; height: 36px; font-size: 1.2rem; }
        }
      `}</style>
    </div>
  );
};

export default Chat;