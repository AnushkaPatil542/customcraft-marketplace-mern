import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  useEffect(() => {
    // ✅ CREATE SOCKET INSIDE useEffect
    const socket = io("http://localhost:5000");

    const loadNotifications = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    loadNotifications();

    // ✅ JOIN ROOM
    if (userId) {
      console.log("Joining room:", userId);
      socket.emit("join", String(userId));
    }

    // ✅ LISTEN FOR REAL-TIME NOTIFICATIONS
    socket.on("notification", (newNotification) => {
      console.log("🔔 New notification:", newNotification);
      setNotifications((prev) => [newNotification, ...prev]);
    });

    // ✅ CLEANUP (VERY IMPORTANT)
    return () => {
      socket.disconnect();
    };
  }, [token, userId]);

  // mark as read
  const markAsRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
    for (const id of unreadIds) {
      await markAsRead(id);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Get notification icon based on message content
  const getNotificationIcon = (message) => {
    if (message?.toLowerCase().includes("order")) return "📦";
    if (message?.toLowerCase().includes("message") || message?.toLowerCase().includes("chat")) return "💬";
    if (message?.toLowerCase().includes("payment") || message?.toLowerCase().includes("paid")) return "💰";
    if (message?.toLowerCase().includes("review") || message?.toLowerCase().includes("rating")) return "⭐";
    if (message?.toLowerCase().includes("assigned")) return "🎯";
    if (message?.toLowerCase().includes("completed")) return "✅";
    if (message?.toLowerCase().includes("register") || message?.toLowerCase().includes("welcome")) return "🎉";
    return "🔔";
  };

  // Format timestamp
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
        .notifications-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* Wide container */
        .notifications-container {
          width: 90%;
          max-width: 900px;
          margin: 0 auto;
        }

        /* Header */
        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .notifications-header h2 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(125deg, #22c55e, #0ea5e9, #eab308);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .unread-badge {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 2rem;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .mark-all-btn {
          background: white;
          color: #6b7280;
          border: 1px solid #e5e7eb;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .mark-all-btn:hover {
          background: #f9fafb;
          border-color: #22c55e;
          color: #22c55e;
          transform: translateY(-1px);
        }

        /* Real-time indicator */
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 2rem;
          width: fit-content;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .live-text {
          font-size: 0.75rem;
          color: #22c55e;
          font-weight: 600;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* Notifications list */
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        /* Notification item */
        .notification-item {
          background: white;
          border-radius: 1rem;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          position: relative;
          animation: slideIn 0.3s ease;
        }

        .notification-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .notification-item.unread {
          background: linear-gradient(135deg, #ffffff, #fef3c7);
          border-left: 4px solid #eab308;
        }

        .notification-item.read {
          background: #f9fafb;
          opacity: 0.85;
        }

        /* Notification icon */
        .notification-icon {
          width: 48px;
          height: 48px;
          background: #f0fdf4;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        /* Notification content */
        .notification-content {
          flex: 1;
        }

        .notification-message {
          font-size: 0.95rem;
          color: #1f2937;
          line-height: 1.4;
          margin-bottom: 0.25rem;
        }

        .notification-time {
          font-size: 0.7rem;
          color: #9ca3af;
        }

        /* Unread dot */
        .unread-dot {
          width: 10px;
          height: 10px;
          background: #eab308;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
          flex-shrink: 0;
        }

        .read-check {
          color: #22c55e;
          font-size: 1rem;
          flex-shrink: 0;
        }

        /* No notifications */
        .no-notifications {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 1rem;
          color: #6b7280;
          font-size: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .notifications-wrapper {
            padding: 1.5rem;
          }
          
          .notifications-header h2 {
            font-size: 1.8rem;
          }
        }

        @media (max-width: 768px) {
          .notifications-wrapper {
            padding: 1rem;
          }
          
          .notifications-container {
            width: 95%;
          }
          
          .notifications-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .notification-item {
            padding: 0.75rem 1rem;
          }
          
          .notification-icon {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }
          
          .notification-message {
            font-size: 0.85rem;
          }
        }
      `}</style>

      <div className="notifications-wrapper">
        <div className="notifications-container">
          <div className="notifications-header">
            <h2>
              🔔 Notifications
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount} new</span>
              )}
            </h2>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>
                ✓ Mark all as read
              </button>
            )}
          </div>

          {/* Real-time indicator */}
          <div className="live-indicator">
            <div className="live-dot"></div>
            <span className="live-text">Live notifications • Connected</span>
          </div>

          {notifications.length === 0 ? (
            <div className="no-notifications">
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔕</div>
              No notifications yet
              <br />
              <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                When you receive updates about your orders, they'll appear here
              </span>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notification-item ${n.isRead ? "read" : "unread"}`}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(n.message)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-message">{n.message}</div>
                    <div className="notification-time">
                      {formatTime(n.createdAt)}
                    </div>
                  </div>
                  {!n.isRead ? (
                    <div className="unread-dot" title="Unread"></div>
                  ) : (
                    <div className="read-check" title="Read">✓</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Notifications;