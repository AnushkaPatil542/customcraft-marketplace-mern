import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import API from "../../api";

const AdminEarnings = () => {
  const [data, setData] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    orders: [],
  });

  const [monthly, setMonthly] = useState([]);
  const [topCreators, setTopCreators] = useState([]);

  const token = localStorage.getItem("token");

  // ✅ ALL LOGIC INSIDE useEffect (no dependency issue)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const earningsRes = await axios.get(
          `${API}/api/admin/earnings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const monthlyRes = await axios.get(
          `${API}/api/admin/monthly-earnings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const creatorsRes = await axios.get(
          `${API}/api/admin/top-creators`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setData(earningsRes.data);
        setMonthly(monthlyRes.data);
        setTopCreators(creatorsRes.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load analytics");
      }
    };

    fetchAll();
  }, [token]); // ✅ correct dependency

  const chartData = data.orders.map((o) => ({
    name: o.title,
    admin: o.platformFee,
    creator: o.creatorEarning,
  }));

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

        /* Section headings */
        .section-heading {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 2rem 0 1rem 0;
          color: #1f2937;
          padding-bottom: 0.5rem;
          border-bottom: 3px solid #22c55e;
          display: inline-block;
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

        /* Chart containers */
        .chart-container {
          background: white;
          padding: 1.5rem;
          border-radius: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .chart-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        /* Top creators list */
        .creators-list {
          background: white;
          border-radius: 1.5rem;
          padding: 1rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .creator-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          transition: background 0.2s ease;
        }

        .creator-item:hover {
          background: #f9fafb;
        }

        .creator-item:last-child {
          border-bottom: none;
        }

        .creator-rank {
          font-weight: 700;
          font-size: 1.1rem;
          color: #22c55e;
          width: 50px;
        }

        .creator-name {
          flex: 1;
          font-weight: 500;
          color: #1f2937;
        }

        .creator-earnings {
          font-weight: 700;
          background: linear-gradient(125deg, #22c55e, #eab308);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Table container */
        .table-container {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          overflow-x: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

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

        /* Admin fee highlight */
        .admin-fee {
          color: #8b5cf6;
          font-weight: 600;
        }

        .creator-fee {
          color: #22c55e;
          font-weight: 600;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .earnings-wrapper {
            padding: 1.5rem;
          }
          
          .earnings-container h2 {
            font-size: 2rem;
          }
          
          .cards-container {
            gap: 1rem;
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
          
          .earning-card {
            min-width: auto;
          }
          
          .chart-container, .table-container, .creators-list {
            padding: 1rem;
          }
          
          .earnings-table th, .earnings-table td {
            padding: 0.75rem;
            font-size: 0.85rem;
          }
          
          .creator-item {
            flex-wrap: wrap;
            gap: 0.5rem;
          }
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

        .earning-card, .chart-container, .creators-list, .table-container {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>

      <div className="earnings-wrapper">
        <div className="earnings-container">
          <h2>💰 Admin Analytics Dashboard</h2>

          {/* CARDS */}
          <div className="cards-container">
            <div className="earning-card">
              <h4>Total Platform Earnings</h4>
              <h2>₹ {data.totalEarnings}</h2>
            </div>
            <div className="earning-card">
              <h4>Total Orders</h4>
              <h2>{data.totalOrders}</h2>
            </div>
          </div>

          {/* BAR CHART - Earnings Breakdown */}
          {chartData.length > 0 && (
            <div className="chart-container">
              <div className="chart-title">📊 Earnings Breakdown (Admin vs Creator)</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip 
                    formatter={(value) => [`₹ ${value}`, '']}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      padding: "0.5rem 1rem"
                    }}
                  />
                  <Bar dataKey="admin" name="Admin Fee" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="creator" name="Creator Earnings" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* MONTHLY LINE CHART */}
          {monthly.length > 0 && (
            <div className="chart-container">
              <div className="chart-title">📈 Monthly Platform Earnings</div>
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

          {/* TOP CREATORS */}
          {topCreators.length > 0 && (
            <div className="creators-list">
              <div className="chart-title">🏆 Top Performing Creators</div>
              {topCreators.map((c, i) => (
                <div key={i} className="creator-item">
                  <div className="creator-rank">#{i + 1}</div>
                  <div className="creator-name">{c.name}</div>
                  <div className="creator-earnings">₹ {c.earnings || 0}</div>
                </div>
              ))}
            </div>
          )}

          {/* ORDER TABLE */}
          {data.orders.length > 0 && (
            <div className="table-container">
              <div className="chart-title">📋 Detailed Order Breakdown</div>
              <table className="earnings-table">
                <thead>
                  <tr>
                    <th>Order Title</th>
                    <th>Total Price</th>
                    <th>Admin Fee</th>
                    <th>Creator Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((o) => (
                    <tr key={o._id}>
                      <td style={{ fontWeight: "500" }}>{o.title}</td>
                      <td>₹ {o.price}</td>
                      <td className="admin-fee">₹ {o.platformFee}</td>
                      <td className="creator-fee">₹ {o.creatorEarning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminEarnings;