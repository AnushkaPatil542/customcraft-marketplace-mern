import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API from "../../api";

const OrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API}/api/orders/public/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

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
        <p>The order you're looking for doesn't exist.</p>
      </div>
    );
  }

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
          max-width: 1000px;
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
          padding: 2rem;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .image-wrapper {
          border-radius: 1rem;
          overflow: hidden;
          background: #f9fafb;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .image-wrapper:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .image:hover {
          transform: scale(1.02);
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

        @media (max-width: 768px) {
          .order-details-wrapper { padding: 1rem; }
          .order-header h1 { font-size: 1.4rem; }
          .order-body { padding: 1rem; }
          .grid { gap: 1rem; }
          .image { height: 160px; }
        }
      `}</style>

      <div className="order-details-wrapper">
        <div className="order-card">
          <div className="order-header">
            <h1>{order.title}</h1>
            <div className="order-id">Order ID: {order._id?.slice(-8)}</div>
          </div>
          <div className="order-body">
            <div className="grid">
              {order.images?.map((file, i) => (
                <div key={i} className="image-wrapper">
                  <img
                    src={file}
                    alt={`Work ${i + 1}`}
                    className="image"
                    onClick={() => window.open(file, "_blank")}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;