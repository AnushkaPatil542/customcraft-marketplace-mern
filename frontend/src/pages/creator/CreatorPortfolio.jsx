import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../api";

const CreatorPortfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filePreviews, setFilePreviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const token = localStorage.getItem("token");

  /* ================= FETCH PORTFOLIO ================= */
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await axios.get(`${API}/api/portfolio/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPortfolios(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (token) fetchPortfolio();
  }, [token]);

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

  /* ================= ADD PORTFOLIO ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await axios.post(
        `${API}/api/portfolio/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ Update UI instantly
      setPortfolios((prev) => [res.data, ...prev]);

      alert("✅ Portfolio added successfully!");

      // reset
      setTitle("");
      setDescription("");
      setFiles([]);
      setFilePreviews([]);
      setIsAdding(false);

    } catch (error) {
      console.error(error);
      alert("❌ Failed to add portfolio");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE PORTFOLIO ================= */
  const deletePortfolio = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`${API}/api/portfolio/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPortfolios(portfolios.filter(item => item._id !== id));
        alert("✅ Deleted successfully");
      } catch (error) {
        console.error(error);
        alert("❌ Failed to delete");
      }
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
        .portfolio-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* Wide container */
        .portfolio-container {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Heading */
        .portfolio-container h2 {
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

        /* Add Button */
        .add-toggle-btn {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border: none;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 1rem;
          cursor: pointer;
          margin-bottom: 2rem;
          transition: all 0.2s ease;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .add-toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
        }

        /* Form Container */
        .form-container {
          background: white;
          border-radius: 1.5rem;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #1f2937;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.9rem 1rem;
          font-size: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
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

        .file-input {
          padding: 0.7rem;
          cursor: pointer;
          background: #f9fafb;
        }

        .submit-btn {
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          border: none;
          padding: 0.9rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Portfolio Grid */
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        /* Portfolio Card */
        .portfolio-card {
          background: white;
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid rgba(34, 197, 94, 0.1);
          position: relative;
        }

        .portfolio-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15);
        }

        /* Delete button */
        .delete-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
          opacity: 0;
        }

        .portfolio-card:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
          background: #ef4444;
          transform: scale(1.1);
        }

        /* Image Gallery */
        .image-gallery {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          background: #f9fafb;
        }

        .portfolio-image-wrapper {
          width: 100%;
          background: #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
          cursor: pointer;
        }

        .portfolio-image {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.3s ease;
        }

        .portfolio-image:hover {
          transform: scale(1.05);
        }

        .image-gallery.multiple {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
        }

        /* Card Content */
        .card-content {
          padding: 1.25rem;
        }

        .card-content h3 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .card-content p {
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        /* Image Modal */
        .image-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          cursor: pointer;
          animation: fadeIn 0.2s ease;
        }

        .modal-image {
          max-width: 90%;
          max-height: 90%;
          border-radius: 0.5rem;
        }

        .close-modal {
          position: absolute;
          top: 1rem;
          right: 2rem;
          color: white;
          font-size: 2rem;
          cursor: pointer;
        }

        /* No Portfolio */
        .no-portfolio {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 1rem;
          color: #6b7280;
          font-size: 1.1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .portfolio-wrapper {
            padding: 1.5rem;
          }
          
          .portfolio-container h2 {
            font-size: 2rem;
          }
          
          .portfolio-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .portfolio-wrapper {
            padding: 1rem;
          }
          
          .portfolio-container h2 {
            font-size: 1.8rem;
          }
          
          .portfolio-grid {
            grid-template-columns: 1fr;
          }
          
          .form-container {
            padding: 1.25rem;
          }
          
          .image-gallery.multiple {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="portfolio-wrapper">
        <div className="portfolio-container">
          <h2>🎨 My Creative Portfolio</h2>

          {/* 🔹 TOGGLE BUTTON */}
          <button
            className="add-toggle-btn"
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? "− Cancel" : "+ Add New Work"}
          </button>

          {/* 🔹 FORM */}
          {isAdding && (
            <div className="form-container">
              <h3 className="form-title">✨ Showcase Your Talent</h3>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Work Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Custom Logo Design, Handmade Saree"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your creative process, materials used, or unique features..."
                  />
                </div>

                <div className="form-group">
                  <label>Upload Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="file-input"
                    onChange={handleFileChange}
                  />
                  
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

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading || files.length === 0}
                >
                  {loading ? "📤 Publishing..." : "➕ Publish to Portfolio"}
                </button>
              </form>
            </div>
          )}

          {/* 🔹 DISPLAY */}
          {portfolios.length === 0 ? (
            <div className="no-portfolio">
              🎨 No portfolio yet
              <br />
              <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                Click "Add New Work" to showcase your amazing creations!
              </span>
            </div>
          ) : (
            <div className="portfolio-grid">
              {portfolios.map((item) => (
                <div className="portfolio-card" key={item._id}>
                  <button
                    className="delete-btn"
                    onClick={() => deletePortfolio(item._id)}
                    title="Delete"
                  >
                    ×
                  </button>
                  
                  <div className={`image-gallery ${item.images?.length > 1 ? "multiple" : ""}`}>
                    {item.images?.map((img, i) => (
                      <div key={i} className="portfolio-image-wrapper">
                        <img
                          src={img}
                          alt={item.title}
                          className="portfolio-image"
                          onClick={() => setSelectedImage(img)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="card-content">
                    <h3>{item.title}</h3>
                    <p>{item.description || "No description provided"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <span className="close-modal" onClick={() => setSelectedImage(null)}>×</span>
          <img src={selectedImage} alt="Full size" className="modal-image" />
        </div>
      )}
    </>
  );
};

export default CreatorPortfolio;