import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../../api";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [portfolioData, setPortfolioData] = useState({});

  const navigate = useNavigate(); // ✅ NEW

  /* 🔹 SELECT CREATOR */
  const selectCreator = async (orderId, creatorId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API}/api/orders/${orderId}/select-creator`,
        { creatorId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await loadOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to select creator");
    }
  };

  /* 🔹 LOAD ORDERS */
  const loadOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return setMessage("Not authorized");

      const res = await axios.get(
        `${API}/api/orders/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(res.data);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load orders");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* 🔹 VIEW PORTFOLIO */
  const viewPortfolio = async (creatorId) => {
    try {
      const res = await axios.get(
        `${API}/api/portfolio/${creatorId}`
      );

      setPortfolioData((prev) => ({
        ...prev,
        [creatorId]: res.data,
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to load portfolio");
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
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* Full screen wrapper */
        .myorders-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* Wide container */
        .myorders-container {
          width: 90%;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Heading style */
        .myorders-container h2 {
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

        /* Message styling */
        .message-text {
          text-align: center;
          padding: 1rem;
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
          border-radius: 0.75rem;
          color: #166534;
          margin-bottom: 1.5rem;
        }

        .no-orders {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 1rem;
          color: #6b7280;
          font-size: 1.1rem;
        }

        /* Order card styling */
        .order-card {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        /* Card header */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .card-header h3 {
          font-size: 1.3rem;
          color: #1f2937;
          margin: 0;
        }

        /* Status badge */
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Description */
        .order-description {
          color: #4b5563;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        /* Order info */
        .order-info {
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .order-info b {
          color: #1f2937;
        }

        /* Selected creator */
        .selected-creator {
          margin-top: 0.75rem;
          padding: 0.5rem 0.75rem;
          background: #f0fdf4;
          border-radius: 0.75rem;
          color: #166534;
          display: inline-block;
        }

        /* Button group */
        .button-group {
          margin-top: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        /* Button styles */
        .chat-btn {
          background: linear-gradient(125deg, #8b5cf6, #7c3aed);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .chat-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .view-btn {
          background: #1f2937;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .view-btn:hover {
          background: #374151;
          transform: translateY(-1px);
        }

        /* Creator box */
        .creator-box {
          margin-top: 1rem;
          background: #f9fafb;
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
        }

        .creator-box h4 {
          margin-bottom: 0.75rem;
          color: #1f2937;
        }

        .creator-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: white;
          border-radius: 0.75rem;
          margin-bottom: 0.5rem;
          border: 1px solid #e5e7eb;
        }

        .creator-row span {
          color: #1f2937;
        }

        .creator-row small {
          color: #6b7280;
        }

        .creator-actions {
          display: flex;
          gap: 0.5rem;
        }

        .select-btn {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border: none;
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .select-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }

        /* Portfolio box */
        .portfolio-box {
          margin-top: 1rem;
          background: #fef3c7;
          padding: 1rem;
          border-radius: 1rem;
          border-left: 4px solid #eab308;
        }

        .portfolio-box h4 {
          color: #92400e;
          margin-bottom: 0.75rem;
        }

        .portfolio-item {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #fde68a;
        }

        .portfolio-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .portfolio-title {
          font-weight: 700;
          color: #78350f;
        }

        .portfolio-desc {
          color: #92400e;
          font-size: 0.9rem;
          margin: 0.25rem 0 0.5rem;
        }

        .portfolio-images {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .portfolio-img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 0.5rem;
          border: 2px solid #fde68a;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .myorders-wrapper {
            padding: 1.5rem;
          }
          
          .myorders-container {
            width: 95%;
          }
          
          .myorders-container h2 {
            font-size: 2rem;
          }
        }

        @media (max-width: 768px) {
          .myorders-wrapper {
            padding: 1rem;
          }
          
          .myorders-container h2 {
            font-size: 1.8rem;
          }
          
          .order-card {
            padding: 1rem;
          }
          
          .card-header h3 {
            font-size: 1.1rem;
          }
          
          .creator-row {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
          
          .button-group {
            flex-direction: column;
          }
          
          .chat-btn, .view-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      <div className="myorders-wrapper">
        <div className="myorders-container">
          <h2>My Orders</h2>

          {message && <div className="message-text">{message}</div>}

          {!message && orders.length === 0 ? (
            <div className="no-orders">No orders found</div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="card-header">
                  <h3>{order.title}</h3>
                  <span className="status-badge" style={{
                    background: order.status === "PENDING" ? "#f59e0b" : order.status === "ASSIGNED" ? "#3b82f6" : "#22c55e"
                  }}>
                    {order.status}
                  </span>
                </div>

                <p className="order-description">{order.description}</p>
                {/* CUSTOMER UPLOADED IMAGES */}
{order.customerFiles?.length > 0 && (
  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
    {order.customerFiles.map((file, index) => (
      <img
        key={index}
        src={file}
        alt="customer upload"
        style={{
          width: "120px",
          height: "120px",
          objectFit: "cover",
          borderRadius: "8px",
          border: "2px solid #ddd",
        }}
      />
    ))}
  </div>
)}

                {/* 💰 PAYMENT */}
                <p className="order-info">
  <b>Total Amount:</b> ₹{order.price || 0}
</p>

                <p className="order-info">
                  <b>Payment Method:</b> {order.paymentMethod || "COD"}
                </p>

                <p className="order-info">
                  <b>Payment Status:</b>{" "}
                  {order.isPaid ? "Paid ✅" : "Pending ❌"}
                </p>

                {/* ✅ SELECTED CREATOR */}
                {order.assignedCreator && (
                  <>
                    <div className="selected-creator">
                      ✅ Selected Creator: <b>{order.assignedCreator.name}</b>
                    </div>

                    <div className="button-group">
                      {/* 🔥 CHAT BUTTON ADDED */}
                      {order.status !== "PENDING" && (
                        <button
                          onClick={() => navigate(`/chat/${order._id}`)}
                          className="chat-btn"
                        >
                          💬 Chat
                        </button>
                      )}

                      <button
                        onClick={() => viewPortfolio(order.assignedCreator._id)}
                        className="view-btn"
                      >
                        👁 View Portfolio
                      </button>
                    </div>

                    {/* 🔥 SHOW PORTFOLIO */}
                    {portfolioData[order.assignedCreator._id] && (
                      <div className="portfolio-box">
                        <h4>🎨 Portfolio</h4>

                        {portfolioData[order.assignedCreator._id].length === 0 && (
                          <p>No work uploaded</p>
                        )}

                        {portfolioData[order.assignedCreator._id].map((item) => (
                          <div key={item._id} className="portfolio-item">
                            <div className="portfolio-title">{item.title}</div>
                            <div className="portfolio-desc">{item.description}</div>

                            <div className="portfolio-images">
                              {item.images.map((img, i) => (
                                <img
                                  key={i}
src={img.startsWith("http") ? img : `${API}/${img}`}
                                  alt="portfolio"
                                  className="portfolio-img"
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* 🔥 APPLIED CREATORS */}
                {order.status === "PENDING" &&
                  order.appliedCreators?.length > 0 && (
                    <div className="creator-box">
                      <h4>📋 Applied Creators</h4>

                      {order.appliedCreators.map((creator) => (
                        <div key={creator._id} className="creator-row">
                          <span>
                            {creator.name}{" "}
                            <small>({creator.email})</small>
                          </span>

                          <div className="creator-actions">
                            <button
                              className="select-btn"
                              onClick={() =>
                                selectCreator(order._id, creator._id)
                              }
                            >
                              Select
                            </button>

                            <button
                              onClick={() => viewPortfolio(creator._id)}
                              className="view-btn"
                            >
                              👁 Portfolio
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrders;