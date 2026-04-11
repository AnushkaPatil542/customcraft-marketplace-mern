import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import API from "../api";

function CreatorDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const token = localStorage.getItem("token");

  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // 🔔 Load notification count
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await axios.get(
          `${API}/api/notifications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const unread = res.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } catch {
        // silent fail
      }
    };

    loadNotifications();

    window.addEventListener("storage", loadNotifications);
    return () => window.removeEventListener("storage", loadNotifications);
  }, [token]);

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
        .creator-dashboard {
          width: 100vw;
          min-height: 100vh;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        /* Dashboard card */
        .dashboard-card {
          background: white;
          border-radius: 2rem;
          padding: 3rem;
          width: 90%;
          max-width: 600px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 5px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
          transition: transform 0.2s ease;
        }

        .dashboard-card:hover {
          transform: translateY(-4px);
        }

        /* Heading */
        .dashboard-card h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9, #eab308);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
        }

        /* Welcome message */
        .welcome {
          font-size: 1.1rem;
          color: #4b5563;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .welcome b {
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Actions container */
        .actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Base button styles */
        .actions button {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        /* Primary button */
        .actions .primary {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
        }

        .actions .primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
          background: linear-gradient(125deg, #2ecc71, #1e8e3e);
        }

        /* Secondary button */
        .actions .secondary {
          background: linear-gradient(125deg, #0ea5e9, #0284c7);
          color: white;
        }

        .actions .secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(14, 165, 233, 0.3);
          background: linear-gradient(125deg, #38bdf8, #0284c7);
        }

        /* Tertiary button (for history/earnings) */
        .actions .tertiary {
          background: linear-gradient(125deg, #eab308, #ca8a04);
          color: white;
        }

        .actions .tertiary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(234, 179, 8, 0.3);
        }

        /* Portfolio button */
        .actions .portfolio-btn {
          background: linear-gradient(125deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .actions .portfolio-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
        }

        /* Notification button */
        .actions .notification-btn {
          position: relative;
          background: linear-gradient(125deg, #ec4899, #db2777);
          color: white;
        }

        .actions .notification-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(236, 72, 153, 0.3);
        }

        /* Badge for notifications */
        .badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          padding: 4px 8px;
          font-size: 0.7rem;
          font-weight: 700;
          min-width: 20px;
        }

        /* Logout button */
        .actions .logout {
          background: white;
          color: #ef4444;
          border: 2px solid #ef4444;
          margin-top: 0.5rem;
        }

        .actions .logout:hover {
          background: #ef4444;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.2);
        }

        /* Stats section */
        .stats-section {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 2px solid #e5e7eb;
          display: flex;
          justify-content: space-around;
          gap: 1rem;
        }

        .stat-item {
          flex: 1;
          text-align: center;
        }

        .stat-icon {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .dashboard-card {
            padding: 2.5rem;
            max-width: 550px;
          }
          
          .dashboard-card h2 {
            font-size: 2.2rem;
          }
        }

        @media (max-width: 768px) {
          .creator-dashboard {
            padding: 1rem;
          }
          
          .dashboard-card {
            padding: 1.5rem;
            width: 95%;
          }
          
          .dashboard-card h2 {
            font-size: 1.8rem;
          }
          
          .welcome {
            font-size: 1rem;
          }
          
          .actions button {
            padding: 0.875rem;
            font-size: 0.95rem;
          }
          
          .stats-section {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .stat-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .stat-icon {
            font-size: 1.2rem;
            margin-bottom: 0;
          }
        }

        /* Animation */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dashboard-card {
          animation: fadeInUp 0.5s ease;
        }
      `}</style>

      <div className="creator-dashboard">
        <div className="dashboard-card">
          <h2>🎨 Creator Dashboard</h2>

          <p className="welcome">
            Welcome back, <b>{name || "Creator"}</b>! 👋
            <br />
            <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              Showcase your talent and earn from custom orders
            </span>
          </p>

          <div className="actions">
            <button
              className="primary"
              onClick={() => navigate("/creator/orders")}
            >
              📋 View Available Orders
            </button>

            <button
              className="secondary"
              onClick={() => navigate("/creator/assigned-orders")}
            >
              🎯 Assigned Orders
            </button>

            <button
              className="secondary"
              onClick={() => navigate("/creator/applied")}
            >
              📄 Applied Orders
            </button>

            <button
              className="secondary"
              onClick={() => navigate("/creator/reviews")}
            >
              ⭐ My Reviews
            </button>

            <button
              className="notification-btn"
              onClick={() => navigate("/notifications")}
            >
              🔔 Notifications
              {unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </button>

            <button
              className="tertiary"
              onClick={() => navigate("/creator/history")}
            >
              🏁 Completed Orders
            </button>

            <button
              className="tertiary"
              onClick={() => navigate("/creator/earnings")}
            >
              View Earnings 💰
            </button>

            <button
              className="portfolio-btn"
              onClick={() => window.location.href = "/creator/portfolio"}
            >
              🎨 My Portfolio
            </button>

            <button className="logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>

          {/* Optional Stats Section */}
          <div className="stats-section">
            <div className="stat-item">
              <div className="stat-icon">📋</div>
              <div className="stat-label">Available</div>
              <div className="stat-value">-</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🎯</div>
              <div className="stat-label">Assigned</div>
              <div className="stat-value">-</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">💰</div>
              <div className="stat-label">Earnings</div>
              <div className="stat-value">-</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreatorDashboard;