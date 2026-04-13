import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../../api";

function CreateOrder() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [filePreviews, setFilePreviews] = useState([]);

  /* ================= HANDLE FILE SELECTION ================= */
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Create preview URLs
    const previews = selectedFiles.map(file => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  /* ================= REMOVE FILE ================= */
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(filePreviews[index]);
    
    setFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
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

      /* ✅ 2. UPLOAD FILES TO SAME ORDER */
      if (files && files.length > 0) {
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }

        await axios.post(
          `${API}/api/orders/upload/creator/${orderId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
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
      }, 1500);

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
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Full screen wrapper */
        .createorder-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Form container */
        .createorder-container {
          width: 90%;
          max-width: 700px;
          background: white;
          border-radius: 2rem;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 5px 12px rgba(0, 0, 0, 0.05);
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

        /* Heading */
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

        .form-subtitle {
          text-align: center;
          color: #6b7280;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        /* Message styling */
        .createorder-container .message {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          color: #166534;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
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
          font-size: 0.9rem;
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
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        /* File input styling */
        .file-input-wrapper {
          position: relative;
        }

        .file-input-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 1.2rem;
          background: #f9fafb;
          border: 2px dashed #e5e7eb;
          border-radius: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
        }

        .file-input-label:hover {
          border-color: #22c55e;
          background: #f0fdf4;
        }

        .file-input-label span {
          font-size: 1.2rem;
        }

        .file-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        /* File previews */
        .file-previews {
          margin-top: 0.75rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .preview-item {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 2px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .preview-item:hover {
          border-color: #ef4444;
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-file {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
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

        .remove-file:hover {
          transform: scale(1.1);
          background: #dc2626;
        }

        .file-count {
          font-size: 0.75rem;
          color: #22c55e;
          margin-top: 0.5rem;
        }

        /* Submit button */
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
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
          background: linear-gradient(125deg, #2ecc71, #1e8e3e);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Back button */
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
        }

        .back-btn:hover {
          background: #f9fafb;
          border-color: #22c55e;
          color: #22c55e;
        }

        /* Loading spinner */
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

        /* Responsive */
        @media (max-width: 1024px) {
          .createorder-wrapper {
            padding: 1.5rem;
          }
          
          .createorder-container {
            padding: 2rem;
          }
          
          .createorder-container h2 {
            font-size: 1.8rem;
          }
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
          
          .form-field label {
            font-size: 0.85rem;
          }
          
          .form-field input,
          .form-field textarea {
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
          }
          
          .preview-item {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>

      <div className="createorder-wrapper">
        <div className="createorder-container">
          <h2>✨ Create Custom Order</h2>
          <div className="form-subtitle">
            Describe your vision and we'll find the perfect creator
          </div>

          {message && <div className="message">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>📝 Order Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Custom Logo Design, Handmade Saree, Portrait Drawing..."
                required
              />
            </div>

            <div className="form-field">
              <label>📋 Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your requirement in detail. Include colors, sizes, materials, or any specific instructions..."
                required
              />
            </div>

            {/* ✅ FILE UPLOAD WITH PREVIEW */}
            <div className="form-field">
              <label>📎 Upload Reference Files</label>
              <div className="file-input-wrapper">
                <label className="file-input-label">
                  <span>📁</span>
                  Choose files (images, PDFs, etc.)
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    className="file-input"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              
              {files.length > 0 && (
                <>
                  <div className="file-previews">
                    {filePreviews.map((preview, index) => (
                      <div key={index} className="preview-item">
                        <img src={preview} alt={`Preview ${index + 1}`} className="preview-image" />
                        <button
                          type="button"
                          className="remove-file"
                          onClick={() => removeFile(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="file-count">
                    ✓ {files.length} file(s) selected
                  </div>
                </>
              )}
            </div>

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