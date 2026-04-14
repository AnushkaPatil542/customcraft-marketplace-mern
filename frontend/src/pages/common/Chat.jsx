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
      if (userId !== currentUserId) {
        setOtherUserTyping(isTyping);
      }
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

  /* ================= SEND MESSAGE ================= */
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

      // instant UI update
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
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* CENTER FIX - SQUARE SHAPE */
        .chat-wrapper {
          width: 100vw;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .chat-container {
          width: 100%;
          max-width: 700px;
          height: 700px;
          max-height: 85vh;
          background: white;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid rgba(34, 197, 94, 0.1);
          animation: fadeInUp 0.4s ease;
          aspect-ratio: 1 / 1;
        }

        @media (max-width: 768px) {
          .chat-container {
            height: auto;
            aspect-ratio: auto;
            max-height: 90vh;
          }
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
          padding: 1rem 1.25rem;
          color: white;
        }

        .chat-header h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .chat-header small {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .online-status {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.65rem;
          margin-top: 0.4rem;
          background: rgba(255,255,255,0.2);
          padding: 0.2rem 0.6rem;
          border-radius: 2rem;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .messages-area {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .messages-area::-webkit-scrollbar {
          width: 5px;
        }

        .messages-area::-webkit-scrollbar-track {
          background: #e5e7eb;
          border-radius: 3px;
        }

        .messages-area::-webkit-scrollbar-thumb {
          background: #22c55e;
          border-radius: 3px;
        }

        .message-row {
          display: flex;
          width: 100%;
          animation: fadeIn 0.3s ease;
        }

        .message-own {
          justify-content: flex-end;
        }

        .message-other {
          justify-content: flex-start;
        }

        .bubble {
          max-width: 70%;
          padding: 0.6rem 0.9rem;
          border-radius: 1rem;
          position: relative;
        }

        .message-own .bubble {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border-bottom-right-radius: 0.2rem;
        }

        .message-other .bubble {
          background: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 0.2rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .message-text {
          font-size: 0.9rem;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .chat-image {
          max-width: 180px;
          margin-top: 0.4rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .chat-image:hover {
          transform: scale(1.02);
        }

        .message-time {
          font-size: 0.6rem;
          margin-top: 0.2rem;
          opacity: 0.7;
        }

        .message-own .message-time {
          text-align: right;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          background: white;
          border-radius: 1rem;
          width: fit-content;
          border: 1px solid #e5e7eb;
          animation: fadeIn 0.3s ease;
        }

        .typing-dots {
          display: flex;
          gap: 0.2rem;
        }

        .typing-dots span {
          width: 5px;
          height: 5px;
          background: #22c55e;
          border-radius: 50%;
          animation: typingBounce 1.4s infinite;
        }

        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }

        .preview-container {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 1rem;
          background: #f1f5f9;
          border-top: 1px solid #e5e7eb;
        }

        .preview-image {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 0.5rem;
          border: 2px solid #22c55e;
        }

        .clear-preview {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .clear-preview:hover {
          transform: scale(1.1);
        }

        .input-area {
          display: flex;
          padding: 0.8rem 1rem;
          gap: 0.6rem;
          border-top: 1px solid #e5e7eb;
          background: white;
          align-items: flex-end;
        }

        .file-label {
          cursor: pointer;
          font-size: 1.3rem;
          padding: 0.4rem;
          transition: all 0.2s;
          background: #f1f5f9;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-label:hover {
          background: #e2e8f0;
          transform: scale(1.05);
        }

        textarea {
          flex: 1;
          padding: 0.7rem 0.9rem;
          border: 2px solid #e5e7eb;
          border-radius: 1rem;
          font-size: 0.9rem;
          font-family: inherit;
          resize: none;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #1f2937;
        }

        textarea:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        textarea::placeholder {
          color: #9ca3af;
        }

        button {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border: none;
          padding: 0.7rem 1.2rem;
          border-radius: 1rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        .no-messages {
          text-align: center;
          padding: 2rem;
          color: #94a3b8;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="chat-wrapper">
        <div className="chat-container">
          <div className="chat-header">
            <h3>💬 Chat Discussion</h3>
            <small>Order ID: {orderId}</small>
            <div className="online-status">
              <div className="status-dot"></div>
              <span>Connected • Real-time</span>
            </div>
          </div>

          <div className="messages-area">
            {messages.length === 0 ? (
              <div className="no-messages">
                <span style={{ fontSize: "1.8rem", display: "block", marginBottom: "0.5rem" }}>💬</span>
                <p>No messages yet</p>
                <p style={{ fontSize: "0.75rem" }}>Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender?.name === currentUserName;

                return (
                  <div
                    key={msg._id}
                    className={`message-row ${isOwn ? "message-own" : "message-other"}`}
                  >
                    <div className="bubble">
                      {msg.text && <div className="message-text">{msg.text}</div>}

                      {msg.image?.url && (
                        <img
                          src={msg.image.url}
                          className="chat-image"
                          alt="chat"
                          onClick={() => window.open(msg.image.url, "_blank")}
                        />
                      )}

                      <div className="message-time">{formatTime(msg.createdAt)}</div>
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

          {preview && (
            <div className="preview-container">
              <img src={preview} alt="preview" className="preview-image" />
              <button className="clear-preview" onClick={clearMedia}>×</button>
            </div>
          )}

          <div className="input-area">
            <label className="file-label" title="Attach image">
              📎
              <input type="file" hidden onChange={handleImageChange} accept="image/*" />
            </label>
            <textarea
              value={text}
              onChange={handleTyping}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
            />
            <button onClick={sendMessage}>Send →</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;