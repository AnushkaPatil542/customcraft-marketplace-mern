import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../api";
function AllOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${API}/api/orders/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(res.data);
      } catch {
        console.error("Failed to load orders");
      }
    };

    fetchOrders();
  }, [token]);

  const applyOrder = async (id) => {
    try {
      await axios.post(
        `${API}/api/orders/${id}/apply`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ mark order as applied in UI (no reload)
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id
            ? { ...order, isApplied: true }
            : order
        )
      );
    } catch {
      alert("Already Applied!");
    }
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
        .allorders-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* Wide container */
        .allorders-container {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Heading style */
        .allorders-container h2 {
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
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        /* Order card styling */
        .order-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        /* Order title */
        .order-card h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Order description */
        .order-card p {
          color: #4b5563;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1rem;
          flex-grow: 1;
        }

        /* Status styling */
        .status {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          margin: 0.75rem 0;
          width: fit-content;
        }

        .status-pending {
          background: #fef3c7;
          color: #d97706;
        }

        .status-assigned {
          background: #dbeafe;
          color: #2563eb;
        }

        .status-completed {
          background: #dcfce7;
          color: #16a34a;
        }

        /* Apply button styling */
        .apply-btn {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
        }

        .apply-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
          background: linear-gradient(125deg, #2ecc71, #1e8e3e);
        }

        .apply-btn:active {
          transform: translateY(0);
        }

        /* Applied button (disabled) */
        .applied-btn {
          background: #e5e7eb;
          color: #6b7280;
          border: none;
          padding: 0.75rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: not-allowed;
          margin-top: 0.5rem;
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

        /* Loading skeleton */
        .loading-skeleton {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .allorders-wrapper {
            padding: 1.5rem;
          }
          
          .allorders-container h2 {
            font-size: 2rem;
          }
          
          .orders-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .allorders-wrapper {
            padding: 1rem;
          }
          
          .allorders-container h2 {
            font-size: 1.8rem;
          }
          
          .order-card {
            padding: 1rem;
          }
          
          .order-card h3 {
            font-size: 1.1rem;
          }
          
          .order-card p {
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div className="allorders-wrapper">
        <div className="allorders-container">
          <h2>📋 Available Orders</h2>

          {orders.length === 0 ? (
            <div className="no-orders">
              No available orders at the moment
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div className="order-card" key={order._id}>
                  <div>
                    <h3>{order.title}</h3>
                    <p>{order.description}</p>
                    
                    <span className={`status status-${order.status?.toLowerCase() || 'pending'}`}>
                      Status: {order.status || "PENDING"}
                    </span>
                  </div>

                  {order.isApplied ? (
                    <button disabled className="applied-btn">
                      ✅ Applied
                    </button>
                  ) : (
                    <button 
                      className="apply-btn"
                      onClick={() => applyOrder(order._id)}
                    >
                      ✨ Apply for this Order
                    </button>
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

export default AllOrders;