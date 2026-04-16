import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../../api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          navigate("/login");
          return;
        }

        const ordersRes = await axios.get(`${API}/api/admin/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(
          Array.isArray(ordersRes.data.orders)
            ? ordersRes.data.orders
            : Array.isArray(ordersRes.data)
            ? ordersRes.data
            : []
        );
      } catch (err) {
        console.error("ERROR:", err.response?.data || err.message);

        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  // Assign Creator
  const assignCreator = async (orderId, creatorId) => {
    if (!creatorId) return;

    try {
      await axios.put(
        `${API}/api/admin/orders/${orderId}/assign`,
        { creatorId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.location.reload();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to assign creator");
    }
  };

  // Mark Paid
  const markAsPaid = async (orderId) => {
    try {
      await axios.put(
        `${API}/api/admin/orders/${orderId}/pay`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.location.reload();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to mark paid");
    }
  };

  const getTotalAmount = (order) => {
    return (order.platformFee || 0) + (order.creatorEarning || 0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#f59e0b";
      case "assigned":
        return "#3b82f6";
      case "in_progress":
        return "#8b5cf6";
      case "completed":
        return "#22c55e";
      default:
        return "#6b7280";
    }
  };

  const getStatusBg = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#fef3c7";
      case "assigned":
        return "#dbeafe";
      case "in_progress":
        return "#ede9fe";
      case "completed":
        return "#dcfce7";
      default:
        return "#f3f4f6";
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        .wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        .container {
          width: 100%;
          margin: 0 auto;
        }

        .title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9, #eab308);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
        }

        .card {
          background: white;
          padding: 1.5rem;
          border-radius: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid rgba(34, 197, 94, 0.1);
          animation: fadeInUp 0.4s ease-out;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

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

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .header h3 {
          font-size: 1.2rem;
          font-weight: 700;
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .line {
          margin: 0.75rem 0;
          color: #374151;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .line b {
          color: #1f2937;
        }

        select {
          width: 100%;
          padding: 0.75rem;
          margin-top: 1rem;
          border-radius: 0.75rem;
          border: 2px solid #e5e7eb;
          background: #f9fafb;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        select:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        button {
          width: 100%;
          margin-top: 1rem;
          padding: 0.75rem;
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        .loading {
          text-align: center;
          font-size: 1.2rem;
          padding: 3rem;
          background: white;
          border-radius: 1rem;
          color: #6b7280;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        @media (max-width: 768px) {
          .wrapper { padding: 1rem; }
          .title { font-size: 1.8rem; }
          .grid { grid-template-columns: 1fr; }
          .card { padding: 1rem; }
          .header h3 { font-size: 1rem; }
        }
      `}</style>

      <div className="wrapper">
        <div className="container">
          <div className="title">📋 Manage Orders</div>

          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : (
            <div className="grid">
              {orders.map((order) => (
                <div className="card" key={order._id}>
                  <div className="header">
                    <h3>{order.title}</h3>

                    <span
                      className="badge"
                      style={{
                        background: getStatusBg(order.status),
                        color: getStatusColor(order.status),
                      }}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="line">
                    <b>👤 Customer:</b>{" "}
                    {order.customer?.name || "N/A"}
                  </div>

                  <div className="line">
                    <b>🎨 Assigned Creator:</b>{" "}
                    {order.assignedCreator?.name || "Not Assigned"}
                  </div>

                  <div className="line">
                    <b>💰 Amount:</b> ₹ {getTotalAmount(order)}
                  </div>

                  <div className="line">
                    <b>💳 Payment:</b>{" "}
                    {order.isPaid ? "Paid ✅" : "Pending ❌"}
                  </div>

                  {/* SHOW ONLY APPLIED CREATORS */}
                  {order.status === "PENDING" && (
                    <select
                      defaultValue=""
                      onChange={(e) =>
                        assignCreator(order._id, e.target.value)
                      }
                    >
                      <option value="" disabled>
                        📌 Select Applied Creator
                      </option>

                      {order.appliedCreators &&
                      order.appliedCreators.length > 0 ? (
                        order.appliedCreators.map((creator) => (
                          <option
                            key={creator._id}
                            value={creator._id}
                          >
                            👨‍🎨 {creator.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>
                          No creators applied yet
                        </option>
                      )}
                    </select>
                  )}

                  {order.status === "COMPLETED" &&
                    !order.isPaid && (
                      <button
                        onClick={() =>
                          markAsPaid(order._id)
                        }
                      >
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