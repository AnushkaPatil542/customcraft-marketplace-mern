import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../../api";

const AssignedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [price, setPrice] = useState({});
  const [files, setFiles] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    const fetchAssignedOrders = async () => {
      try {
        const res = await axios.get(`${API}/api/orders/assigned`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (error) {
        console.error(error);
        alert("Failed to load assigned orders");
      }
    };

    if (token) fetchAssignedOrders();
  }, [token]);

  
  /* ================= REMOVE FILE ================= */
  const removeFile = (orderId, index) => {
    const currentFiles = files[orderId] || [];
    const currentPreviews = filePreviews[orderId] || [];

    const newFiles = currentFiles.filter((_, i) => i !== index);
    const newPreviews = currentPreviews.filter((_, i) => i !== index);

    URL.revokeObjectURL(currentPreviews[index]);

    setFiles((prev) => ({ ...prev, [orderId]: newFiles }));
    setFilePreviews((prev) => ({ ...prev, [orderId]: newPreviews }));
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (orderId, status) => {
    try {
      if (status === "COMPLETED") {
        const enteredPrice = price[orderId];

        if (!enteredPrice || enteredPrice <= 0) {
          alert("Enter valid price");
          return;
        }

        await axios.put(
          `${API}/api/orders/complete/${orderId}`,
          { price: Number(enteredPrice) },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.put(
          `${API}/api/orders/${orderId}/status`,
          { status },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                status,
                ...(status === "COMPLETED" && {
                  price: price[orderId],
                }),
              }
            : o
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  /* ================= STATUS COLORS ================= */
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "assigned":
        return { background: "#dbeafe", color: "#2563eb", label: "📋 Assigned" };
      case "in_progress":
        return { background: "#ede9fe", color: "#7c3aed", label: "⚡ In Progress" };
      case "completed":
        return { background: "#dcfce7", color: "#16a34a", label: "✅ Completed" };
      default:
        return { background: "#f3f4f6", color: "#6b7280", label: status || "Unknown" };
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
        }

        .assigned-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        .assigned-container {
          width: 95%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .assigned-container h2 {
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

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .order-card {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid rgba(34, 197, 94, 0.1);
          animation: fadeInUp 0.4s ease-out;
        }

        .order-card:hover {
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

        .order-card h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .order-description {
          color: #4b5563;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }

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

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .chat-btn {
          background: linear-gradient(125deg, #8b5cf6, #7c3aed);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          width: 100%;
          margin-bottom: 1rem;
        }

        .chat-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .price-input {
          flex: 1;
          padding: 0.6rem 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .price-input:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .file-previews {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .preview-item {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 2px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .preview-item:hover {
          border-color: #ef4444;
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-file {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 18px;
          height: 18px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .remove-file:hover {
          transform: scale(1.1);
          background: #dc2626;
        }

        .start-btn, .complete-btn {
          flex: 1;
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .start-btn {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
        }

        .start-btn:hover, .complete-btn:hover {
          transform: translateY(-2px);
        }

        .complete-btn {
          background: linear-gradient(125deg, #eab308, #ca8a04);
          color: white;
        }

        .no-orders {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 1rem;
          color: #6b7280;
          font-size: 1.1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        @media (max-width: 1024px) {
          .assigned-wrapper { padding: 1.5rem; }
          .assigned-container h2 { font-size: 2rem; }
          .orders-grid { grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); }
        }

        @media (max-width: 768px) {
          .assigned-wrapper { padding: 1rem; }
          .assigned-container h2 { font-size: 1.8rem; }
          .orders-grid { grid-template-columns: 1fr; }
          .order-card { padding: 1rem; }
          .order-card h3 { font-size: 1.1rem; }
          .action-buttons { flex-direction: column; }
          .price-input { width: 100%; }
        }
      `}</style>

      <div className="assigned-wrapper">
        <div className="assigned-container">
          <h2>🎯 Assigned Orders</h2>

          {orders.length === 0 ? (
            <div className="no-orders">
              No assigned orders yet
              <br />
              <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                When customers select you for their orders, they'll appear here
              </span>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => {
                const statusStyle = getStatusStyle(order.status);

                return (
                  <div key={order._id} className="order-card">
                    <h3>{order.title}</h3>
                    <p className="order-description">{order.description}</p>

                    <div className="customer-info">
                      <p><strong>👤 Customer:</strong> {order.customer?.name}</p>
                      <p><strong>📧 Email:</strong> {order.customer?.email}</p>
                    </div>

                    <span className="status-badge" style={statusStyle}>
                      {statusStyle.label}
                    </span>

                    {order.status !== "PENDING" && (
                      <button
                        className="chat-btn"
                        onClick={() => navigate(`/chat/${order._id}`)}
                      >
                        💬 Chat with Customer
                      </button>
                    )}

                    <div className="action-buttons">
                      {order.status === "ASSIGNED" && (
                        <button
                          className="start-btn"
                          onClick={() =>
                            updateStatus(order._id, "IN_PROGRESS")
                          }
                        >
                          🚀 Start Order
                        </button>
                      )}

                      {order.status === "IN_PROGRESS" && (
                        <>
                          <input
                            type="number"
                            placeholder="💰 Enter price ₹"
                            value={price[order._id] || ""}
                            onChange={(e) =>
                              setPrice({
                                ...price,
                                [order._id]: e.target.value,
                              })
                            }
                            className="price-input"
                          />

                          {/* FILE INPUT BUTTON REMOVED */}

                          {filePreviews[order._id]?.length > 0 && (
                            <div className="file-previews">
                              {filePreviews[order._id].map(
                                (preview, idx) => (
                                  <div key={idx} className="preview-item">
                                    <img
                                      src={preview}
                                      alt="preview"
                                      className="preview-image"
                                    />
                                    <button
                                      className="remove-file"
                                      onClick={() =>
                                        removeFile(order._id, idx)
                                      }
                                    >
                                      ×
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          <button
                            className="complete-btn"
                            onClick={() =>
                              updateStatus(order._id, "COMPLETED")
                            }
                          >
                            ✅ Complete Order
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AssignedOrders;