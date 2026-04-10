import { useEffect, useState } from "react";
import axios from "axios";

const CreatorOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/orders/creator/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch creator order history", err);
      }
    };

    if (token) fetchHistory();
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

        /* Full screen wrapper with CustomCraft theme gradient */
        .history-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* Wide container */
        .history-container {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Heading style */
        .history-container h2 {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 2rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9, #eab308);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
        }

        /* Orders grid */
        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
        }

        /* Order card styling */
        .order-card {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid rgba(34, 197, 94, 0.1);
          position: relative;
          overflow: hidden;
        }

        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        /* Completed badge */
        .completed-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.7rem;
          font-weight: 600;
        }

        /* Order title */
        .order-card h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          padding-right: 100px;
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Order description */
        .order-description {
          color: #4b5563;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }

        /* Customer info */
        .customer-info {
          background: #f9fafb;
          padding: 0.75rem;
          border-radius: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .customer-info p {
          margin: 0.25rem 0;
          color: #374151;
          font-size: 0.9rem;
        }

        .customer-info strong {
          color: #1f2937;
        }

        /* Status badge */
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
          background: #dcfce7;
          color: #16a34a;
        }

        /* No orders message */
        .no-orders {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 1rem;
          color: #6b7280;
          font-size: 1.1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .history-wrapper {
            padding: 1.5rem;
          }
          
          .history-container h2 {
            font-size: 2rem;
          }
          
          .orders-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .history-wrapper {
            padding: 1rem;
          }
          
          .history-container h2 {
            font-size: 1.8rem;
          }
          
          .order-card {
            padding: 1rem;
          }
          
          .order-card h3 {
            font-size: 1.1rem;
            padding-right: 80px;
          }
          
          .customer-info p {
            font-size: 0.85rem;
          }
          
          .orders-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Animation */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .order-card {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      <div className="history-wrapper">
        <div className="history-container">
          <h2>✨ Completed Orders - Creator</h2>

          {orders.length === 0 ? (
            <div className="no-orders">
              No completed orders yet
              <br />
              <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                When you complete orders, they'll appear here
              </span>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div className="order-card" key={order._id}>
                  <div className="completed-badge">✓ Completed</div>
                  
                  <h3>{order.title}</h3>
                  
                  <p className="order-description">
                    {order.description}
                  </p>
                  
                  <div className="customer-info">
                    <p>
                      <strong>👤 Customer:</strong> {order.customer?.name || "N/A"}
                    </p>
                    <p>
                      <strong>📧 Email:</strong> {order.customer?.email || "N/A"}
                    </p>
                  </div>
                  
                  <span className="status-badge">
                    Status: {order.status || "COMPLETED"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreatorOrderHistory;