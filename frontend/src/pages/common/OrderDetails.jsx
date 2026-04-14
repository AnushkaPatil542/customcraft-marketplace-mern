import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../api";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API}/api/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Helper: get status badge style
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { background: "#fef3c7", color: "#d97706", label: "Pending" };
      case "assigned":
        return { background: "#dbeafe", color: "#2563eb", label: "Assigned" };
      case "in_progress":
        return { background: "#ede9fe", color: "#7c3aed", label: "In Progress" };
      case "completed":
        return { background: "#dcfce7", color: "#16a34a", label: "Completed" };
      default:
        return { background: "#f3f4f6", color: "#6b7280", label: status || "Unknown" };
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="error-container">
        <span className="error-icon">🔍</span>
        <h2>Order not found</h2>
        <p>The order you're looking for doesn't exist or has been removed.</p>
        <button className="back-btn-home" onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  const statusStyle = getStatusStyle(order.status);

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

        .order-details-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .order-card {
          max-width: 800px;
          width: 100%;
          background: white;
          border-radius: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.1);
          overflow: hidden;
          animation: fadeInUp 0.5s ease;
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

        .order-header {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          padding: 1.5rem;
          color: white;
        }

        .order-header h1 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .order-header .order-id {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .order-body {
          padding: 1.5rem;
        }

        .description {
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .file-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 1rem;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 2px solid #e5e7eb;
        }

        .file-image:hover {
          transform: scale(1.02);
          border-color: #22c55e;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 600;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .chat-btn {
          flex: 1;
          background: linear-gradient(125deg, #8b5cf6, #7c3aed);
          color: white;
          border: none;
          padding: 0.85rem;
          border-radius: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .chat-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .back-btn {
          flex: 1;
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          padding: 0.85rem;
          border-radius: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background: #f9fafb;
          border-color: #22c55e;
          color: #22c55e;
        }

        .loading-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
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

        .error-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1rem;
          padding: 2rem;
        }

        .error-icon {
          font-size: 4rem;
        }

        .back-btn-home {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 2rem;
          cursor: pointer;
          font-weight: 600;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .order-details-wrapper { padding: 1rem; }
          .order-header h1 { font-size: 1.4rem; }
          .button-group { flex-direction: column; }
          .files-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
          .file-image { height: 120px; }
        }
      `}</style>

      <div className="order-details-wrapper">
        <div className="order-card">
          <div className="order-header">
            <h1>{order.title}</h1>
            <div className="order-id">Order ID: {order._id?.slice(-8)}</div>
          </div>

          <div className="order-body">
            <p className="description">{order.description}</p>

            {order.files?.length > 0 && (
              <>
                <div className="section-title">
                  📎 Attached Files ({order.files.length})
                </div>
                <div className="files-grid">
                  {order.files.map((file, i) => (
                    <img
                      key={i}
                      src={file}
                      alt={`Work file ${i + 1}`}
                      className="file-image"
                      onClick={() => window.open(file, "_blank")}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="status-badge" style={{ background: statusStyle.background, color: statusStyle.color }}>
              <span>📋</span> {statusStyle.label}
            </div>

            <div className="button-group">
              <button className="chat-btn" onClick={() => navigate(`/chat/${order._id}`)}>
                💬 Chat with Creator
              </button>
              <button className="back-btn" onClick={() => navigate(-1)}>
                🔙 Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;