import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
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

        /* Full screen wrapper with CustomCraft theme gradient */
        .dashboard-wrapper {
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
          max-width: 550px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 5px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
          transition: transform 0.2s ease;
        }

        .dashboard-card:hover {
          transform: translateY(-4px);
        }

        /* Title styling */
        .dashboard-title {
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
        .welcome-message {
          font-size: 1.1rem;
          color: #4b5563;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .welcome-message strong {
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Button container */
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Base button styles */
        .dashboard-btn {
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

        /* Primary button - Create Order */
        .btn-primary {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
          background: linear-gradient(125deg, #2ecc71, #1e8e3e);
        }

        /* Secondary button - My Orders */
        .btn-secondary {
          background: linear-gradient(125deg, #0ea5e9, #0284c7);
          color: white;
        }

        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(14, 165, 233, 0.3);
          background: linear-gradient(125deg, #38bdf8, #0284c7);
        }

        /* Tertiary button - Completed Orders */
        .btn-tertiary {
          background: linear-gradient(125deg, #eab308, #ca8a04);
          color: white;
        }

        .btn-tertiary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(234, 179, 8, 0.3);
          background: linear-gradient(125deg, #facc15, #ca8a04);
        }

        /* Logout button */
        .btn-logout {
          background: white;
          color: #ef4444;
          border: 2px solid #ef4444;
          margin-top: 0.5rem;
        }

        .btn-logout:hover {
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
            max-width: 500px;
          }
          
          .dashboard-title {
            font-size: 2.2rem;
          }
        }

        @media (max-width: 768px) {
          .dashboard-wrapper {
            padding: 1rem;
          }
          
          .dashboard-card {
            padding: 1.5rem;
            width: 95%;
          }
          
          .dashboard-title {
            font-size: 1.8rem;
          }
          
          .welcome-message {
            font-size: 1rem;
          }
          
          .dashboard-btn {
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

        /* Animation for buttons */
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

      <div className="dashboard-wrapper">
        <div className="dashboard-card">
          <h2 className="dashboard-title">Customer Dashboard</h2>
          <p className="welcome-message">
            Welcome back, <strong>{name || "Customer"}</strong>! 👋
            <br />
            <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              Ready to bring your ideas to life?
            </span>
          </p>

          <div className="button-group">
            <button
              className="dashboard-btn btn-primary"
              onClick={() => navigate("/customer/create-order")}
            >
              ➕ Create Custom Order
            </button>

            <button
              className="dashboard-btn btn-secondary"
              onClick={() => navigate("/customer/my-orders")}
            >
              📦 My Orders
            </button>


            <button
              className="dashboard-btn btn-tertiary"
              onClick={() => navigate("/customer/history")}
            >
              🏁 Completed Orders
            </button>

             <button
              className="dashboard-btn btn-tertiary"
              onClick={() => navigate("/notifications")}
            >
              🏁 Notifications
            </button>

            <button
              className="dashboard-btn btn-logout"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>

          {/* Optional Stats Section - Shows quick info */}
          <div className="stats-section">
            <div className="stat-item">
              <div className="stat-icon">🎨</div>
              <div className="stat-label">Active Orders</div>
              <div className="stat-value">-</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">✅</div>
              <div className="stat-label">Completed</div>
              <div className="stat-value">-</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <div className="stat-label">Reviews</div>
              <div className="stat-value">-</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CustomerDashboard;