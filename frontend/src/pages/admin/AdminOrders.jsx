import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          console.log("❌ No token");
          navigate("/login");
          return;
        }

        const [ordersRes, creatorsRes] = await Promise.all([
          axios.get(`${API}/api/admin/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/api/admin/creators`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setOrders(
          Array.isArray(ordersRes.data.orders)
            ? ordersRes.data.orders
            : Array.isArray(ordersRes.data)
            ? ordersRes.data
            : []
        );

        setCreators(
          Array.isArray(creatorsRes.data.creators)
            ? creatorsRes.data.creators
            : Array.isArray(creatorsRes.data)
            ? creatorsRes.data
            : []
        );

      } catch (err) {
        console.error("🔥 ERROR:", err.response?.data || err.message);

        if (err.response?.status === 401) {
          alert("Session expired. Login again.");
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  // 🔥 Assign creator
  const assignCreator = async (orderId, creatorId) => {
    if (!creatorId) return;

    try {
      await axios.put(
        `${API}/api/admin/orders/${orderId}/assign`,
        { creatorId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 🔥 reload manually
      window.location.reload();

    } catch (err) {
      console.error("❌ Assign error:", err.response?.data || err.message);
      alert("Failed to assign creator");
    }
  };

  // 🔥 Mark as paid
  const markAsPaid = async (orderId) => {
    try {
      await axios.put(
        `${API}/api/admin/orders/${orderId}/pay`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      window.location.reload();

    } catch (err) {
      console.error("❌ Payment error:", err.response?.data || err.message);
      alert("Failed to mark as paid");
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'assigned': return '#3b82f6';
      case 'in_progress': return '#8b5cf6';
      case 'completed': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusBgColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#fef3c7';
      case 'assigned': return '#dbeafe';
      case 'in_progress': return '#ede9fe';
      case 'completed': return '#dcfce7';
      default: return '#f3f4f6';
    }
  };

  // Calculate total amount
  const getTotalAmount = (order) => {
    return (order.platformFee || 0) + (order.creatorEarning || 0);
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
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* Wide container */
        .admin-container {
          width: 95%;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header */
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .admin-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(125deg, #22c55e, #0ea5e9, #eab308);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
        }

        .order-count {
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          color: #1f2937;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        /* Loading spinner */
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 50vh;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid #e5e7eb;
          border-top-color: #22c55e;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Orders grid */
        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 1.5rem;
        }

        /* Order card */
        .order-card {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        /* Order header */
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .order-header h4 {
          font-size: 1.2rem;
          font-weight: 700;
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Status badge */
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Order info */
        .order-info {
          margin-bottom: 0.75rem;
          color: #374151;
          line-height: 1.5;
        }

        .order-info b {
          color: #1f2937;
        }

        /* Payment section */
        .payment-section {
          background: #f9fafb;
          padding: 0.75rem;
          border-radius: 0.75rem;
          margin: 1rem 0;
        }

        .payment-status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .payment-paid {
          background: #dcfce7;
          color: #16a34a;
        }

        .payment-pending {
          background: #fee2e2;
          color: #ef4444;
        }

        /* Assign creator dropdown */
        .assign-select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
        }

        .assign-select:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        /* Pay button */
        .pay-btn {
          width: 100%;
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .pay-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        /* No orders */
        .no-orders {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 1rem;
          color: #6b7280;
          font-size: 1.1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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

        .order-card {
          animation: fadeInUp 0.4s ease-out;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .admin-wrapper {
            padding: 1.5rem;
          }
          
          .admin-header h2 {
            font-size: 2rem;
          }
          
          .orders-grid {
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .admin-wrapper {
            padding: 1rem;
          }
          
          .admin-header h2 {
            font-size: 1.8rem;
          }
          
          .orders-grid {
            grid-template-columns: 1fr;
          }
          
          .order-card {
            padding: 1rem;
          }
          
          .order-header h4 {
            font-size: 1rem;
          }
        }
      `}</style>

      <div className="admin-wrapper">
        <div className="admin-container">
          <div className="admin-header">
            <h2>📋 Manage Orders</h2>
            <div className="order-count">
              Total Orders: {orders.length}
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              📦 No orders found
              <br />
              <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                Orders will appear here when customers create them
              </span>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div className="order-card" key={order._id}>
                  <div className="order-header">
                    <h4>{order.title}</h4>
                    <span 
                      className="status-badge"
                      style={{
                        background: getStatusBgColor(order.status),
                        color: getStatusColor(order.status)
                      }}
                    >
                      {order.status || "PENDING"}
                    </span>
                  </div>

                  <div className="order-info">
                    <b>👤 Customer:</b> {order.customer?.name || "N/A"}
                  </div>

                  <div className="order-info">
                    <b>🎨 Assigned Creator:</b>{" "}
                    {order.assignedCreator
                      ? order.assignedCreator.name
                      : "Not Assigned"}
                  </div>

                  <div className="payment-section">
                    <div className="order-info" style={{ marginBottom: "0.5rem" }}>
                      <b>💰 Total Amount:</b> ₹ {getTotalAmount(order)}
                    </div>
                    <div className="order-info" style={{ marginBottom: "0.5rem" }}>
                      <b>💳 Payment Method:</b> {order.paymentMethod || "COD"}
                    </div>
                    <div className="order-info">
                      <b>📊 Payment Status:</b>{" "}
                      <span className={order.isPaid ? "payment-paid" : "payment-pending"}>
                        {order.isPaid ? "Paid ✅" : "Pending ❌"}
                      </span>
                    </div>
                  </div>

                  {order.status === "PENDING" && (
                    <select
                      className="assign-select"
                      onChange={(e) =>
                        assignCreator(order._id, e.target.value)
                      }
                      defaultValue=""
                    >
                      <option value="" disabled>📌 Assign Creator</option>
                      {creators.map((c) => (
                        <option key={c._id} value={c._id}>
                          👨‍🎨 {c.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {order.status === "COMPLETED" && !order.isPaid && (
                    <button className="pay-btn" onClick={() => markAsPaid(order._id)}>
                      ✅ Mark as Paid
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

export default AdminOrders;