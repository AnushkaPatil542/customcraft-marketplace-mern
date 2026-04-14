import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import API from "../../api";

const CreatorEarnings = () => {
  const [data, setData] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    orders: [],
  });

  const [monthly, setMonthly] = useState([]);
  const [showShareOptions, setShowShareOptions] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");

  const token = localStorage.getItem("token");

    const shareWork = (order, platform) => {
    const orderId = order?._id;

    if (!orderId) {
      console.error("Order ID missing:", order);
      return;
    }

    const text = `✨ Check out my custom design: ${order.title} 🚀 I completed this project on CustomCraft!`;
    const url = `https://customcraft-marketplace-mern.vercel.app/order/${orderId}`;

    let shareUrl = "";

    
    
    switch(platform) {
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(`${text} ${url}`);
        setCopySuccess("Copied!");
        setTimeout(() => setCopySuccess(""), 2000);
        return;
      default:
        return;
    }
    
    window.open(shareUrl, "_blank");
    setShowShareOptions(null);
  };

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axios.get(
          `${API}/api/creator/earnings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setData(res.data);

        // ✅ Monthly calculation
        const grouped = {};

        res.data.orders.forEach((order) => {
          const date = new Date(order.updatedAt);
          const month = date.toLocaleString("default", { month: "short" });

          if (!grouped[month]) grouped[month] = 0;
          grouped[month] += order.creatorEarning || 0;
        });

        const monthlyData = Object.keys(grouped).map((m) => ({
          month: m,
          earnings: grouped[m],
        }));

        setMonthly(monthlyData);
      } catch (error) {
        console.error(error);
        alert("Failed to load earnings");
      }
    };

    fetchEarnings();
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

        /* Full screen wrapper */
        .earnings-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* Wide container */
        .earnings-container {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Heading */
        .earnings-container h2 {
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

        /* Cards container */
        .cards-container {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        /* Card styling */
        .earning-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1.5rem;
          flex: 1;
          min-width: 200px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .earning-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .earning-card h4 {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .earning-card h2 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          margin: 0;
        }

        /* Chart section */
        .chart-section {
          background: white;
          padding: 1.5rem;
          border-radius: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .chart-section h3 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        /* Table section */
        .table-section {
          background: white;
          padding: 1.5rem;
          border-radius: 1.5rem;
          overflow-x: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .table-section h3 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        /* Table styling */
        .earnings-table {
          width: 100%;
          border-collapse: collapse;
        }

        .earnings-table thead tr {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
        }

        .earnings-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
        }

        .earnings-table td {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }

        .earnings-table tbody tr:hover {
          background: #f9fafb;
          transition: background 0.2s ease;
        }

        /* Share button container */
        .share-container {
          position: relative;
        }

        .share-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          background: linear-gradient(125deg, #8b5cf6, #7c3aed);
          color: white;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .share-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        /* Share options dropdown */
        .share-options {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          z-index: 10;
          min-width: 160px;
          animation: fadeIn 0.2s ease;
        }

        .share-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          cursor: pointer;
          transition: background 0.2s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-size: 0.85rem;
          color: #1f2937;
        }

        .share-option:first-child {
          border-radius: 0.75rem 0.75rem 0 0;
        }

        .share-option:last-child {
          border-radius: 0 0 0.75rem 0.75rem;
        }

        .share-option:hover {
          background: #f9fafb;
        }

        /* Copy success message */
        .copy-success {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: #22c55e;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          font-weight: 500;
          animation: slideIn 0.3s ease;
          z-index: 1000;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
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

        /* No orders */
        .no-orders {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .earnings-wrapper {
            padding: 1.5rem;
          }
          
          .earnings-container h2 {
            font-size: 2rem;
          }
        }

        @media (max-width: 768px) {
          .earnings-wrapper {
            padding: 1rem;
          }
          
          .earnings-container h2 {
            font-size: 1.8rem;
          }
          
          .cards-container {
            flex-direction: column;
          }
          
          .earnings-table th, .earnings-table td {
            padding: 0.75rem;
            font-size: 0.85rem;
          }
          
          .share-btn {
            padding: 0.3rem 0.6rem;
            font-size: 0.75rem;
          }
        }
      `}</style>

      <div className="earnings-wrapper">
        <div className="earnings-container">
          <h2>💰 Creator Earnings Dashboard</h2>

          {/* SUMMARY */}
          <div className="cards-container">
            <div className="earning-card">
              <h4>Total Earnings</h4>
              <h2>₹ {data.totalEarnings}</h2>
            </div>
            <div className="earning-card">
              <h4>Completed Orders</h4>
              <h2>{data.totalOrders}</h2>
            </div>
          </div>

          {/* CHART */}
          {monthly.length > 0 && (
            <div className="chart-section">
              <h3>📈 Monthly Earnings Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthly}>
                  <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    formatter={(value) => [`₹ ${value}`, 'Earnings']}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      padding: "0.5rem 1rem"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#16a34a" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* TABLE */}
          <div className="table-section">
            <h3>📦 Order Earnings Breakdown</h3>

            {data.orders.length === 0 ? (
              <p className="no-orders">No completed orders</p>
            ) : (
              <table className="earnings-table">
                <thead>
                  <tr>
                    <th>Order Title</th>
                    <th>Total Price</th>
                    <th>Your Earnings</th>
                    <th>Status</th>
                    <th>Share</th>
                  </tr>
                </thead>

                <tbody>
                  {data.orders.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: "500" }}>{order.title}</td>
                      <td>₹ {order.price}</td>
                      <td style={{ color: "#22c55e", fontWeight: "600" }}>
                        ₹ {order.creatorEarning}
                      </td>
                      <td>
                        <span className="status-badge">{order.status}</span>
                      </td>

                      {/* ✅ SHARE BUTTON WITH DROPDOWN */}
                      <td className="share-container">
                        <button
                          className="share-btn"
                          onClick={() => setShowShareOptions(showShareOptions === order._id ? null : order._id)}
                        >
                          📤 Share
                        </button>
                        
                        {showShareOptions === order._id && (
                          <div className="share-options">
                            <button
                              className="share-option"
                              onClick={() => shareWork(order, "whatsapp")}
                            >
                              📱 WhatsApp
                            </button>
                            <button
                              className="share-option"
                              onClick={() => shareWork(order, "twitter")}
                            >
                              🐦 Twitter
                            </button>
                            <button
                              className="share-option"
                              onClick={() => shareWork(order, "linkedin")}
                            >
                              🔗 LinkedIn
                            </button>
                            <button
                              className="share-option"
                              onClick={() => shareWork(order, "facebook")}
                            >
                              📘 Facebook
                            </button>
                            <button
                              className="share-option"
                              onClick={() => shareWork(order, "copy")}
                            >
                              📋 Copy Link
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Copy success notification */}
      {copySuccess && (
        <div className="copy-success">
          ✅ {copySuccess}
        </div>
      )}
    </>
  );
};

export default CreatorEarnings;