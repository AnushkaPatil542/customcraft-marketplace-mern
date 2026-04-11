import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../api";
const CustomerOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${API}/api/orders/customer/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch customer order history", err);
      }
    };

    if (token) fetchHistory();
  }, [token]);

  // ⭐ STEP 5 – Submit Review Function
  const submitReview = async () => {
    try {
      await axios.post(
        `${API}/api/reviews/${selectedOrderId}`,
        { rating, comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Review submitted successfully!");

      // Reset form
      setSelectedOrderId(null);
      setRating(5);
      setComment("");
    } catch (err) {
      console.error("Failed to submit review", err);
      alert("Review already submitted or error occurred");
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
        .history-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* Wide container */
        .history-container {
          width: 90%;
          max-width: 1200px;
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

        /* Orders grid */
        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
        }

        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        /* Order title */
        .order-card h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.75rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          display: inline-block;
        }

        /* Order description */
        .order-description {
          color: #4b5563;
          line-height: 1.5;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }

        /* Creator info */
        .creator-info {
          margin-bottom: 0.5rem;
          color: #374151;
          font-size: 0.9rem;
        }

        .creator-info b {
          color: #1f2937;
        }

        /* Status badge */
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
          background: #22c55e;
          color: white;
        }

        /* Review button */
        .review-btn {
          width: 100%;
          margin-top: 1rem;
          padding: 0.7rem;
          background: linear-gradient(125deg, #8b5cf6, #7c3aed);
          color: white;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .review-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        /* Review form */
        .review-form {
          margin-top: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
        }

        /* Select dropdown */
        .rating-select {
          width: 100%;
          padding: 0.6rem;
          font-size: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 0.75rem;
        }

        .rating-select:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        /* Textarea */
        .review-textarea {
          width: 100%;
          padding: 0.75rem;
          font-size: 0.95rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          background: white;
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
          margin-bottom: 0.75rem;
        }

        .review-textarea:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .review-textarea::placeholder {
          color: #9ca3af;
        }

        /* Submit button */
        .submit-review-btn {
          width: 100%;
          padding: 0.7rem;
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .submit-review-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .history-wrapper {
            padding: 1.5rem;
          }
          
          .history-container {
            width: 95%;
          }
          
          .history-container h2 {
            font-size: 2rem;
          }
          
          .orders-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
          }
          
          .orders-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="history-wrapper">
        <div className="history-container">
          <h2>✨ Completed Orders</h2>

          {orders.length === 0 && (
            <div className="no-orders">
              No completed orders yet
            </div>
          )}

          <div className="orders-grid">
            {orders.map((order) => (
              <div className="order-card" key={order._id}>
                <h3>{order.title}</h3>
                <p className="order-description">{order.description}</p>

                <p className="creator-info">
                  <b>Creator:</b> {order.assignedCreator?.name || "N/A"} 
                  <br />
                  <small>({order.assignedCreator?.email || "N/A"})</small>
                </p>

                <span className="status-badge">✓ {order.status}</span>

                {/* ⭐ Show Review Button Only If Completed */}
                {order.status === "COMPLETED" && (
                  <div>
                    <button 
                      className="review-btn"
                      onClick={() => setSelectedOrderId(order._id)}
                    >
                      ⭐ Add Review
                    </button>
                  </div>
                )}

                {/* ⭐ Simple Review Form */}
                {selectedOrderId === order._id && (
                  <div className="review-form">
                    <select
                      className="rating-select"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ 5 Stars - Excellent</option>
                      <option value={4}>⭐⭐⭐⭐ 4 Stars - Very Good</option>
                      <option value={3}>⭐⭐⭐ 3 Stars - Good</option>
                      <option value={2}>⭐⭐ 2 Stars - Fair</option>
                      <option value={1}>⭐ 1 Star - Poor</option>
                    </select>

                    <textarea
                      className="review-textarea"
                      placeholder="Share your experience with this creator..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />

                    <button 
                      className="submit-review-btn"
                      onClick={submitReview}
                    >
                      📝 Submit Review
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerOrderHistory;