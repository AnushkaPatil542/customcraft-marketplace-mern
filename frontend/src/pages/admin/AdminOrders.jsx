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
        body{
          margin:0;
          font-family:Arial, sans-serif;
        }

        .wrapper{
          min-height:100vh;
          padding:30px;
          background:linear-gradient(135deg,#f0fdf4,#e0f2fe,#fef3c7);
        }

        .container{
          max-width:1200px;
          margin:auto;
        }

        .title{
          font-size:32px;
          font-weight:bold;
          margin-bottom:25px;
        }

        .grid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(380px,1fr));
          gap:20px;
        }

        .card{
          background:white;
          padding:20px;
          border-radius:16px;
          box-shadow:0 10px 25px rgba(0,0,0,0.08);
        }

        .header{
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:15px;
        }

        .badge{
          padding:6px 12px;
          border-radius:20px;
          font-size:12px;
          font-weight:bold;
        }

        .line{
          margin:8px 0;
          color:#333;
        }

        select{
          width:100%;
          padding:10px;
          margin-top:15px;
          border-radius:10px;
          border:1px solid #ddd;
        }

        button{
          width:100%;
          margin-top:15px;
          padding:12px;
          border:none;
          border-radius:10px;
          background:#22c55e;
          color:white;
          font-weight:bold;
          cursor:pointer;
        }

        button:hover{
          opacity:0.9;
        }

        .loading{
          text-align:center;
          font-size:20px;
          padding:80px;
        }
      `}</style>

      <div className="wrapper">
        <div className="container">
          <div className="title">📋 Manage Orders</div>

          {loading ? (
            <div className="loading">Loading...</div>
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