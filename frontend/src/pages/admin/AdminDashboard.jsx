import { useNavigate } from "react-router-dom";

function AdminDashboard() {
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

        /* Full screen wrapper */
        .admin-wrapper {
          width: 100vw;
          min-height: 100vh;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* Wide container */
        .admin-container {
          width: 90%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Header section */
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 1.5rem 2rem;
          border-radius: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .admin-header h2 {
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(125deg, #22c55e, #0ea5e9, #eab308);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
        }

        .admin-header p {
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .admin-header p b {
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Logout button */
        .logout-btn {
          background: white;
          color: #ef4444;
          border: 2px solid #ef4444;
          padding: 0.6rem 1.2rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: #ef4444;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        /* Admin grid */
        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        /* Admin card */
        .admin-card {
          background: white;
          border-radius: 1.5rem;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .admin-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        /* Card emoji/icon */
        .admin-card > div:first-child {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .admin-card h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .admin-card p {
          color: #6b7280;
          font-size: 0.9rem;
        }

        /* Stats section */
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(125deg, #22c55e, #eab308);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .admin-container {
            width: 95%;
            padding: 1.5rem;
          }
          
          .admin-header h2 {
            font-size: 1.5rem;
          }
          
          .admin-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .admin-container {
            padding: 1rem;
          }
          
          .admin-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
            padding: 1rem;
          }
          
          .admin-header h2 {
            font-size: 1.3rem;
          }
          
          .admin-grid {
            grid-template-columns: 1fr;
          }
          
          .admin-card {
            padding: 1.5rem;
          }
          
          .admin-card h3 {
            font-size: 1.1rem;
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

        .admin-card {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>

      <div className="admin-wrapper">
        <div className="admin-container">
          <div className="admin-header">
            <div>
              <h2>⚡ Admin Dashboard</h2>
              <p>
                Welcome back, <b>{name || "Administrator"}</b>! 👋
              </p>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>

          <div className="admin-grid">
            <div
              className="admin-card"
              onClick={() => navigate("/admin/orders")}
            >
              <div>📦</div>
              <h3>Manage Orders</h3>
              <p>Assign creators & track orders</p>
            </div>

            <div
              className="admin-card"
              onClick={() => navigate("/admin/creators")}
            >
              <div>👩‍🎨</div>
              <h3>Creators</h3>
              <p>View all registered creators</p>
            </div>

            <div
              className="admin-card"
              onClick={() => navigate("/admin/earnings")}
            >
              <div>💰</div>
              <h3>Earnings</h3>
              <p>View platform earnings & analytics</p>
            </div>
          </div>

          {/* Optional Stats Section */}
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-number">-</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">-</div>
              <div className="stat-label">Active Creators</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">-</div>
              <div className="stat-label">Platform Revenue</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;