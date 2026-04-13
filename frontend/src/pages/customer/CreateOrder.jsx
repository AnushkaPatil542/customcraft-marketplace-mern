import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../../api";

function CreateOrder() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FILE CHANGE ================= */
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);

    // cleanup old previews
    filePreviews.forEach((url) => URL.revokeObjectURL(url));

    setFiles(selected);
    setFilePreviews(selected.map((file) => URL.createObjectURL(file)));
  };

  /* ================= REMOVE FILE ================= */
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);

    URL.revokeObjectURL(filePreviews[index]);

    setFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      return alert("Please fill all fields");
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      /* ✅ 1. CREATE ORDER */
      const res = await axios.post(
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

      const orderId = res.data._id;

      /* ✅ 2. UPLOAD REFERENCE FILES (FIXED ROUTE) */
      if (files.length > 0) {
        const formData = new FormData();

        files.forEach((file) => {
          formData.append("files", file);
        });

        await axios.post(
          `${API}/api/orders/upload/customer/${orderId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setMessage("✅ Order created successfully!");

      /* RESET */
      setTitle("");
      setDescription("");
      setFiles([]);
      setFilePreviews([]);

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
        }

        .message {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          color: #166534;
          margin: 1rem 0;
          font-size: 0.9rem;
          text-align: center;
        }

        .createorder-container form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .createorder-container input[type="text"],
        .createorder-container textarea {
          width: 100%;
          padding: 0.9rem 1.2rem;
          font-size: 1rem;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 1rem;
          color: #1f2937;
          transition: all 0.2s ease;
          outline: none;
          font-family: inherit;
        }

        .createorder-container input[type="text"]:focus,
        .createorder-container textarea:focus {
          border-color: #22c55e;
          background: white;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .createorder-container textarea {
          resize: vertical;
          min-height: 120px;
        }

        .createorder-container input[type="file"] {
          width: 100%;
          padding: 0.8rem;
          border: 2px dashed #e5e7eb;
          border-radius: 1rem;
          cursor: pointer;
          background: #f9fafb;
          transition: all 0.2s ease;
        }

        .createorder-container input[type="file"]:hover {
          border-color: #22c55e;
          background: #f0fdf4;
        }

        .preview-container {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .preview-item {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 2px solid #e5e7eb;
        }

        .preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-file-btn {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .remove-file-btn:hover {
          transform: scale(1.1);
          background: #dc2626;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          font-weight: 700;
          font-size: 1rem;
          border: none;
          border-radius: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .createorder-wrapper { padding: 1rem; }
          .createorder-container { padding: 1.5rem; width: 95%; }
          .createorder-container h2 { font-size: 1.5rem; }
        }
      `}</style>

      <div className="createorder-wrapper">
        <div className="createorder-container">
          <h2>✨ Create Custom Order</h2>
          <div style={{ textAlign: "center", color: "#6b7280", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Describe your vision and we'll find the perfect creator
          </div>

          {message && <div className="message">{message}</div>}

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

            <input
              type="file"
              multiple
              onChange={handleFileChange}
            />

            {filePreviews.length > 0 && (
              <div className="preview-container">
                {filePreviews.map((preview, index) => (
                  <div key={index} className="preview-item">
                    <img src={preview} alt="preview" />
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
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