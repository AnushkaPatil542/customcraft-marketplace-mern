import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../api";


const AssignedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [price, setPrice] = useState({});
  const [files, setFiles] = useState({});
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedOrders = async () => {
      try {
        const response = await axios.get(
          `${API}/api/orders/assigned`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(response.data);
      } catch (error) {
        console.error(error);
        alert("Failed to load assigned orders");
      }
    };

    if (token) fetchAssignedOrders();
  }, [token]);

  /* 🔹 UPLOAD FILES */
  const uploadFiles = async (orderId) => {
    try {
      const selectedFiles = files[orderId];

      if (!selectedFiles || selectedFiles.length === 0) {
        alert("Please select files first");
        return;
      }

      const formData = new FormData();

      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
      }

      await axios.post(
        `${API}/api/orders/upload/creator/${orderId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Files uploaded successfully");
    } catch (error) {
      console.error(error);
      alert("❌ File upload failed");
    }
  };

  /* 🔹 UPDATE STATUS */
  const updateStatus = async (orderId, status) => {
    try {
      if (status === "COMPLETED") {
        const enteredPrice = price[orderId];

        if (!enteredPrice || enteredPrice <= 0) {
          alert("Enter valid price before completing");
          return;
        }

        await axios.put(
          `${API}/api/orders/complete/${orderId}`,
          {
            price: Number(enteredPrice),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.put(
          `${API}/api/orders/${orderId}/status`,
          { status },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // ✅ FIXED UI UPDATE (no forced COMPLETED)
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
      console.log("ERROR:", error.response?.data || error.message);
      alert("Failed to update order status");
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

        /* Full screen wrapper */
        .assigned-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* Wide container */
        .assigned-container {
          width: 90%;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Heading */
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

        /* Orders grid */
        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
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

        /* Title */
        .order-card h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Description */
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
          margin-bottom: 1rem;
        }

        .status-assigned {
          background: #dbeafe;
          color: #2563eb;
        }

        .status-in_progress {
          background: #fef3c7;
          color: #d97706;
        }

        .status-completed {
          background: #dcfce7;
          color: #16a34a;
        }

        /* Chat button */
        .chat-btn {
          background: linear-gradient(125deg, #8b5cf6, #7c3aed);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          margin-bottom: 1rem;
        }

        .chat-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        /* Action buttons container */
        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1rem;
          align-items: center;
        }

        /* Input fields */
        .price-input {
          padding: 0.6rem 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          width: 120px;
          transition: all 0.2s ease;
        }

        .price-input:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .file-input {
          padding: 0.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .file-input:hover {
          border-color: #22c55e;
        }

        /* Buttons */
        .start-btn {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .start-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        .upload-btn {
          background: linear-gradient(125deg, #0ea5e9, #0284c7);
          color: white;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .upload-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .complete-btn {
          background: linear-gradient(125deg, #eab308, #ca8a04);
          color: white;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .complete-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3);
        }

        .complete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        /* Responsive */
        @media (max-width: 1024px) {
          .assigned-wrapper {
            padding: 1.5rem;
          }
          
          .assigned-container {
            width: 95%;
          }
          
          .assigned-container h2 {
            font-size: 2rem;
          }
          
          .orders-grid {
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .assigned-wrapper {
            padding: 1rem;
          }
          
          .assigned-container h2 {
            font-size: 1.8rem;
          }
          
          .order-card {
            padding: 1rem;
          }
          
          .order-card h3 {
            font-size: 1.1rem;
          }
          
          .action-buttons {
            flex-direction: column;
            align-items: stretch;
          }
          
          .price-input, .file-input {
            width: 100%;
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
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <h3>{order.title}</h3>
                  <p className="order-description">{order.description}</p>

                  <div className="customer-info">
                    <p>
                      <strong>👤 Customer:</strong> {order.customer?.name || "N/A"}
                    </p>
                    <p>
                      <strong>📧 Email:</strong> {order.customer?.email || "N/A"}
                    </p>
                  </div>

                  <span className={`status-badge status-${order.status?.toLowerCase().replace('_', '_') || 'assigned'}`}>
                    Status: {order.status || "ASSIGNED"}
                  </span>

                  {/* 🔥 CHAT BUTTON */}
                  {order.status !== "PENDING" && (
                    <button
                      onClick={() => navigate(`/chat/${order._id}`)}
                      className="chat-btn"
                    >
                      💬 Chat with Customer
                    </button>
                  )}

                  <div className="action-buttons">
                    {/* START ORDER */}
                    {order.status === "ASSIGNED" && (
                      <button
                        className="start-btn"
                        onClick={() => updateStatus(order._id, "IN_PROGRESS")}
                      >
                        🚀 Start Order
                      </button>
                    )}

                    {/* IN PROGRESS */}
                    {order.status === "IN_PROGRESS" && (
                      <>
                        <input
                          type="number"
                          placeholder="Enter price ₹"
                          className="price-input"
                          value={price[order._id] || ""}
                          onChange={(e) =>
                            setPrice({
                              ...price,
                              [order._id]: e.target.value,
                            })
                          }
                        />

                        <input
                          type="file"
                          multiple
                          className="file-input"
                          onChange={(e) =>
                            setFiles({
                              ...files,
                              [order._id]: e.target.files,
                            })
                          }
                        />

                        <button
                          className="upload-btn"
                          onClick={() => uploadFiles(order._id)}
                        >
                          📁 Upload Work
                        </button>

                        <button
                          className="complete-btn"
                          disabled={order.status === "COMPLETED"}
                          onClick={() => updateStatus(order._id, "COMPLETED")}
                        >
                          ✅ Complete Order
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AssignedOrders;