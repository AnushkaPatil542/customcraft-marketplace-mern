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

  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* ================= SOCKET CONNECTION ================= */
  useEffect(() => {
    socket.current = io(`${API}`);

    socket.current.emit("joinRoom", orderId);

    socket.current.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
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

  /* ================= IMAGE HANDLER ================= */
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

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

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

      if (image) {
        formData.append("image", image);
      }

      const res = await axios.post(`${API}/api/messages`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          
        },
      });

      const newMessage = res.data;

      socket.current.emit("sendMessage", {
        orderId,
        message: newMessage,
      });

      setMessages((prev) => [...prev, newMessage]);
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

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ================= UI ================= */
  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h2>💬 Chat</h2>

      {/* Messages */}
      <div
        style={{
          height: "70vh",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        {messages.map((msg) => {
          const isOwn = msg.sender?.name === currentUserName;

          return (
            <div
              key={msg._id}
              style={{
                textAlign: isOwn ? "right" : "left",
                margin: "10px 0",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "10px",
                  borderRadius: "10px",
                  background: isOwn ? "#22c55e" : "#f1f1f1",
                  color: isOwn ? "#fff" : "#000",
                  maxWidth: "70%",
                }}
              >
                <div>{msg.text}</div>

                {msg.image?.url && (
                  <img
                    src={msg.image.url}
                    alt="chat"
                    style={{
                      width: "200px",
                      marginTop: "5px",
                      borderRadius: "8px",
                    }}
                  />
                )}

                <div style={{ fontSize: "10px", marginTop: "5px" }}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        {otherUserTyping && <p>✍️ typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* Preview */}
      {preview && (
        <div style={{ marginTop: "10px" }}>
          <img
            src={preview}
            alt="preview"
            style={{ width: "120px", borderRadius: "10px" }}
          />
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", marginTop: "10px", gap: "10px" }}>
        <label style={{ cursor: "pointer", fontSize: "20px" }}>
          📎
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </label>

        <textarea
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyPress}
          placeholder="Type message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "10px",
          }}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;