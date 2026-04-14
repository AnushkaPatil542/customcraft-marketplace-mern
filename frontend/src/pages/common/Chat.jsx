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

  // ✏️ EDIT STATE
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const token = localStorage.getItem("token");
  const currentUserName = localStorage.getItem("name");
  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  const typingTimeoutRef = useRef(null);

  const reactions = ["👍", "❤️", "😂", "😮"];

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

  /* ================= SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= IMAGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
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

  /* ================= EDIT ================= */
  const startEdit = (msg) => {
    setEditingId(msg._id);
    setEditText(msg.text);
  };

  const saveEdit = async (id) => {
    const res = await axios.put(
      `${API}/api/messages/${id}`,
      { text: editText },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    socket.current.emit("sendMessage", {
      orderId,
      message: res.data,
    });

    setEditingId(null);
    setEditText("");
  };

  /* ================= REACTION ================= */
  const addReaction = async (msgId, emoji) => {
    const res = await axios.put(
      `${API}/api/messages/react/${msgId}`,
      { emoji },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    socket.current.emit("sendMessage", {
      orderId,
      message: res.data,
    });
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
        }

        .chat-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-container {
          width: 95%;
          max-width: 1000px;
          height: 85vh;
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
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
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .chat-header p {
          font-size: 0.8rem;
          opacity: 0.9;
          margin-top: 0.25rem;
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
          flex: 1;
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

        .reactions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .reaction-btn {
          cursor: pointer;
          font-size: 1rem;
          transition: transform 0.2s ease;
          background: none;
          border: none;
        }

        .reaction-btn:hover {
          transform: scale(1.2);
        }

        .edit-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          opacity: 0.7;
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
        }

        .save-btn {
          margin-top: 0.25rem;
          padding: 0.25rem 0.5rem;
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
          margin-top: 0.5rem;
          position: relative;
          display: inline-block;
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
          box-shadow: 0 4px 12px rgba(34, 197, Quintal, 0.3);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .chat-wrapper { padding: 1rem; }
          .chat-container { width: 100%; height: 90vh; }
          .message { max-width: 85%; }
        }
      `}</style>

      <div className="chat-wrapper">
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
                <div key={msg._id} className={`message ${isOwn ? "message-own" : "message-other"}`}>
                  <div className="message-sender">
                    {msg.sender?.name || "User"} {isOwn && "(You)"}
                  </div>
                  <div className="message-bubble">
                    {editingId === msg._id ? (
                      <>
                        <textarea
                          className="edit-textarea"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <button className="save-btn" onClick={() => saveEdit(msg._id)}>Save</button>
                      </>
                    ) : (
                      <>
                        <div className="message-text">{msg.text}</div>
                        {msg.image?.url && (
                          <img
                            src={msg.image.url}
                            alt="chat"
                            className="chat-image"
                            onClick={() => window.open(msg.image.url, "_blank")}
                          />
                        )}
                        <div className="reactions">
                          {reactions.map((r) => (
                            <button
                              key={r}
                              className="reaction-btn"
                              onClick={() => addReaction(msg._id, r)}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                        {msg.sender?.name === currentUserName && (
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
            <div className="preview-container" style={{ margin: "0 1.5rem" }}>
              <img src={preview} alt="preview" className="preview-image" />
              <button className="clear-preview" onClick={clearMedia}>×</button>
            </div>
          )}

          <div className="input-area">
            <input type="file" onChange={handleImageChange} style={{ display: "none" }} id="file-input" />
            <label htmlFor="file-input" style={{ cursor: "pointer", fontSize: "1.5rem" }}>📎</label>
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
      </div>
    </>
  );
};

export default Chat;