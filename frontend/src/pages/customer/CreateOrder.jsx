import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateOrder() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]); // ✅ NEW
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // ✅ 1. Create Order
      const res = await axios.post(
        "http://localhost:5000/api/orders",
        { title, description, price: 1000 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orderId = res.data._id; // ✅ get created order id

      // ✅ 2. Upload files (if any)
      if (files.length > 0) {
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }

        await axios.post(
          `http://localhost:5000/api/orders/upload/customer/${orderId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setMessage("✅ Order + Files submitted successfully!");

      // reset form
      setTitle("");
      setDescription("");
      setFiles([]);

      // redirect
      setTimeout(() => {
        navigate("/customer/my-orders");
      }, 1500);
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "❌ Order submission failed");
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
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Full screen wrapper with CustomCraft theme gradient */
        .createorder-wrapper {
          width: 100vw;
          min-height: 100vh;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        /* Wide form container */
        .createorder-container {
          width: 90%;
          max-width: 900px;
          background: white;
          border-radius: 2rem;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 5px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        /* Heading style */
        .createorder-container h2 {
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
        .createorder-container .message {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 1rem;
          border-radius: 0.75rem;
          color: #166534;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          text-align: center;
        }

        /* Form layout */
        .createorder-container form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Form field */
        .form-field {
          width: 100%;
        }

        /* Label styling */
        .form-field label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1f2937;
          font-size: 0.95rem;
        }

        /* Input styling */
        .form-field input[type="text"],
        .form-field input[type="file"] {
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

        /* Textarea styling */
        .form-field textarea {
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
          resize: vertical;
          min-height: 120px;
        }

        .form-field input::placeholder,
        .form-field textarea::placeholder {
          color: #9ca3af;
        }

        /* Focus state */
        .form-field input:focus,
        .form-field textarea:focus {
          border-color: #22c55e;
          background: white;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
        }

        /* Hover state */
        .form-field input:hover,
        .form-field textarea:hover {
          border-color: #0ea5e9;
        }

        /* File input styling */
        .form-field input[type="file"] {
          padding: 0.7rem;
          cursor: pointer;
        }

        .form-field input[type="file"]:hover {
          border-color: #22c55e;
        }

        /* Submit button styling */
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
          font-family: inherit;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(34, 197, 94, 0.3);
          background: linear-gradient(125deg, #2ecc71, #1e8e3e);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Back button styling */
        .back-btn {
          width: 100%;
          padding: 0.9rem;
          background: transparent;
          border: 2px solid #e5e7eb;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.95rem;
          border-radius: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          margin-top: 0.5rem;
        }

        .back-btn:hover {
          background: #f9fafb;
          border-color: #22c55e;
          color: #22c55e;
        }

        /* Responsive design */
        @media (max-width: 1024px) {
          .createorder-container {
            width: 95%;
            padding: 2rem;
          }
          
          .createorder-container h2 {
            font-size: 2rem;
          }
        }

        @media (max-width: 768px) {
          .createorder-container {
            width: 98%;
            padding: 1.5rem;
          }
          
          .createorder-container h2 {
            font-size: 1.8rem;
          }
          
          .form-field label {
            font-size: 0.9rem;
          }
          
          .form-field input,
          .form-field textarea {
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div className="createorder-wrapper">
        <div className="createorder-container">
          <h2>Create Custom Order</h2>

          {message && <div className="message">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Order Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Handmade Saree, Custom Logo, Portrait Drawing..."
                required
              />
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your custom requirement in detail..."
                required
              />
            </div>

            {/* ✅ FILE UPLOAD */}
            <div className="form-field">
              <label>Upload Reference Files (Optional)</label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Order"}
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => navigate("/customer/dashboard")}
            >
              ← Back to Dashboard
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateOrder;