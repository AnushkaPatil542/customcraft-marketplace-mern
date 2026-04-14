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

  // EDIT
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

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

    socket.current.on("messageUpdated", (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    });

    socket.current.on("userTyping", ({ userId, isTyping }) => {
      if (userId !== currentUserId) {
        setOtherUserTyping(isTyping);
      }
    });

    return () => socket.current.disconnect();
  }, [orderId, currentUserId]);

  /* ================= FETCH MESSAGES ================= */
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      socket.current.emit("sendMessage", {
        orderId,
        message: res.data,
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

  /* ================= EDIT MESSAGE ================= */
  const startEdit = (msg) => {
    setEditingId(msg._id);
    setEditText(msg.text);
  };

  const saveEdit = async (id) => {
    try {
      const res = await axios.put(
        `${API}/api/messages/${id}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.current.emit("messageUpdated", res.data);

      setEditingId(null);
      setEditText("");
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

        .chat-container {
          max-width: 1000px;
          margin: 2rem auto;
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid rgba(34, 197, 94, 0.1);
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
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .messages-area {
          height: 60vh;
          overflow-y: auto;
          padding: 1.5rem;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

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

        .message-bubble {
          padding: 0.75rem 1rem;
          border-radius: 1.25rem;
          word-wrap: break-word;
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

        .message-text {
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .message-time {
          font-size: 0.65rem;
          margin-top: 0.25rem;
          margin-left: 0.25rem;
          color: #9ca3af;
        }

        .message-own .message-time {
          text-align: right;
        }

        .chat-image {
          max-width: 200px;
          margin-top: 0.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .chat-image:hover {
          transform: scale(1.02);
        }

        .edit-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.7rem;
          margin-top: 0.5rem;
          opacity: 0.7;
          color: inherit;
        }

        .edit-btn:hover {
          opacity: 1;
        }

        .edit-textarea {
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          font-family: inherit;
          margin-bottom: 0.5rem;
        }

        .save-btn {
          padding: 0.25rem 0.75rem;
          background: #22c55e;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
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

        .preview-container {
          position: relative;
          display: inline-block;
          margin: 0.5rem 1.5rem;
        }

        .preview-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 0.5rem;
        }

        .clear-preview {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
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
          transition: transform 0.2s ease;
        }

        .file-label:hover {
          transform: scale(1.1);
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

        .message-input:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
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

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .chat-container { margin: 1rem; }
          .message { max-width: 85%; }
          .input-area { padding: 0.75rem 1rem; }
          .send-btn { padding: 0.75rem 1rem; }
        }
      `}</style>

      <div className="chat-container">
        <div className="chat-header">
          <h2>💬 Chat Discussion</h2>
          <p>Order ID: {orderId}</p>
          <div className="online-status">
            <div className="status-dot"></div>
            <span>Connected • Real-time</span>
          </div>
        </div>

        <div className="messages-area">
          {messages.map((msg) => {
            const isOwn = msg.sender?.name === currentUserName;

            return (
              <div
                key={msg._id}
                className={`message ${isOwn ? "message-own" : "message-other"}`}
              >
                <div className="message-bubble">
                  {editingId === msg._id ? (
                    <>
                      <textarea
                        className="edit-textarea"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <button className="save-btn" onClick={() => saveEdit(msg._id)}>
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      {msg.text && <div className="message-text">{msg.text}</div>}
                      {msg.image?.url && (
                        <img
                          src={msg.image.url}
                          alt="chat"
                          className="chat-image"
                          onClick={() => window.open(msg.image.url, "_blank")}
                        />
                      )}
                      {isOwn && (
                        <button className="edit-btn" onClick={() => startEdit(msg)}>
                          ✏️ Edit
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="message-time">{formatTime(msg.createdAt)}</div>
              </div>
            );
          })}

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
            <input type="file" onChange={handleImageChange} style={{ display: "none" }} />
          </label>
          <textarea
            className="message-input"
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
          />
          <button className="send-btn" onClick={sendMessage}>Send →</button>
        </div>
      </div>
    </>
  );
};

export default Chat;