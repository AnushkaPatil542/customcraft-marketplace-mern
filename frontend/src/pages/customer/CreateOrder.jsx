import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../../api";

function CreateOrder() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      return alert("Please fill all fields");
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      /* ✅ CREATE ORDER ONLY */
      await axios.post(
        `${API}/api/orders`,
        {
          title,
          description,
          price: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("✅ Order created successfully!");

      /* RESET */
      setTitle("");
      setDescription("");

      /* REDIRECT */
      setTimeout(() => {
        navigate("/customer/my-orders");
      }, 1200);

    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "❌ Order failed");
    } finally {
      setLoading(false);
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

        .createorder-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .createorder-container {
          width: 90%;
          max-width: 650px;
          background: white;
          border-radius: 2rem;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.1);
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

        .createorder-container h2 {
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 0.5rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9, #eab308);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
        }

        .subtitle {
          text-align: center;
          color: #6b7280;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .message {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          text-align: center;
          margin: 1rem 0;
          color: #166534;
          font-size: 0.9rem;
        }

        .error-message {
          background: #fef2f2;
          border-left-color: #ef4444;
          color: #991b1b;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        input, textarea {
          width: 100%;
          padding: 0.9rem 1.2rem;
          border-radius: 1rem;
          border: 2px solid #e5e7eb;
          outline: none;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.2s ease;
          background: #f9fafb;
          color: #1f2937;
        }

        input:focus, textarea:focus {
          border-color: #22c55e;
          background: white;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        input::placeholder, textarea::placeholder {
          color: #9ca3af;
        }

        textarea {
          resize: vertical;
          min-height: 120px;
        }

        button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border: none;
          border-radius: 1rem;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .createorder-wrapper {
            padding: 1rem;
          }
          .createorder-container {
            padding: 1.5rem;
            width: 95%;
          }
          .createorder-container h2 {
            font-size: 1.5rem;
          }
          input, textarea {
            padding: 0.75rem 1rem;
          }
        }
      `}</style>

      <div className="createorder-wrapper">
        <div className="createorder-container">
          <h2>✨ Create Custom Order</h2>
          <div className="subtitle">
            Describe your vision and we'll find the perfect creator
          </div>

          {message && (
            <div className={`message ${message.includes("❌") ? "error-message" : ""}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="📝 Order Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              placeholder="📋 Describe your order in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            {/* FILE INPUT BUTTON REMOVED */}

            <button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Order...
                </>
              ) : (
                "🚀 Submit Order"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateOrder;