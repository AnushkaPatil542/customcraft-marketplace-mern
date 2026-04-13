import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import API from "../../api";

const CreatorPortfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */
  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/portfolio/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPortfolios(res.data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchPortfolio();
  }, [token, fetchPortfolio]);

  /* ================= FILE CHANGE ================= */
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // cleanup old previews
    filePreviews.forEach((url) => URL.revokeObjectURL(url));

    setFiles(selectedFiles);
    setFilePreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
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

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    if (files.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      files.forEach((file) => {
        formData.append("files", file);
      });

      await axios.post(`${API}/api/portfolio/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Portfolio added successfully!");

      // reset form
      setTitle("");
      setDescription("");
      setFiles([]);
      setFilePreviews([]);
      setIsAdding(false);

      // refresh list
      await fetchPortfolio();

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "❌ Failed to add portfolio");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const deletePortfolio = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await axios.delete(`${API}/api/portfolio/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPortfolios((prev) => prev.filter((item) => item._id !== id));

      alert("✅ Deleted successfully");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to delete");
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

        .portfolio-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        .portfolio-container {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto;
        }

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

        /* Toggle Button */
        .portfolio-container > button {
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

        .portfolio-container > button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
        }

        /* Form Styles */
        .portfolio-container form {
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

        .portfolio-container form input[type="text"],
        .portfolio-container form textarea {
          width: 100%;
          padding: 0.9rem 1rem;
          margin-bottom: 1rem;
          font-size: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .portfolio-container form input[type="text"]:focus,
        .portfolio-container form textarea:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .portfolio-container form textarea {
          resize: vertical;
          min-height: 100px;
        }

        .portfolio-container form input[type="file"] {
          width: 100%;
          padding: 0.7rem;
          margin-bottom: 1rem;
          border: 2px dashed #e5e7eb;
          border-radius: 0.75rem;
          cursor: pointer;
          background: #f9fafb;
        }

        .portfolio-container form input[type="file"]:hover {
          border-color: #22c55e;
          background: #f0fdf4;
        }

        /* Preview Container */
        .preview-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin: 1rem 0;
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

        .preview-item button {
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

        .preview-item button:hover {
          transform: scale(1.1);
          background: #dc2626;
        }

        /* Submit Button */
        .portfolio-container form button[type="submit"] {
          width: 100%;
          padding: 0.9rem;
          background: linear-gradient(125deg, #22c55e, #16a34a);
          color: white;
          font-weight: 700;
          font-size: 1rem;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .portfolio-container form button[type="submit"]:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
        }

        .portfolio-container form button[type="submit"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Portfolio Grid */
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        /* Portfolio Card */
        .portfolio-card {
          background: white;
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid rgba(34, 197, 94, 0.1);
          position: relative;
        }

        .portfolio-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15);
        }

        /* Delete Button on Card */
        .portfolio-card > button {
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

        .portfolio-card:hover > button {
          opacity: 1;
        }

        .portfolio-card > button:hover {
          background: #ef4444;
          transform: scale(1.1);
        }

        /* Portfolio Images */
        .portfolio-card img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .portfolio-card img:hover {
          transform: scale(1.02);
        }

        /* Portfolio Title */
        .portfolio-card h3 {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 1rem 1rem 0.5rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Portfolio Description */
        .portfolio-card p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0 1rem 1rem;
          line-height: 1.4;
        }

        /* No Portfolio Message */
        .portfolio-container > p {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 1rem;
          color: #6b7280;
          font-size: 1.1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        /* Modal */
        .modal {
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
        }

        .modal img {
          max-width: 90%;
          max-height: 90%;
          border-radius: 0.5rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .portfolio-wrapper { padding: 1rem; }
          .portfolio-container h2 { font-size: 1.8rem; }
          .portfolio-grid { grid-template-columns: 1fr; }
          .portfolio-container form { padding: 1.25rem; }
        }
      `}</style>

      <div className="portfolio-wrapper">
        <div className="portfolio-container">
          <h2>🎨 My Creative Portfolio</h2>

          {/* TOGGLE BUTTON */}
          <button onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? "− Cancel" : "+ Add New Work"}
          </button>

          {/* FORM */}
          {isAdding && (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="✨ Work Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <textarea
                placeholder="📝 Describe your creative process..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <input type="file" multiple onChange={handleFileChange} />

              {/* previews */}
              {filePreviews.length > 0 && (
                <div className="preview-container">
                  {filePreviews.map((preview, i) => (
                    <div key={i} className="preview-item">
                      <img src={preview} alt="preview" />
                      <button type="button" onClick={() => removeFile(i)}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" disabled={loading}>
                {loading ? "📤 Uploading..." : "➕ Publish to Portfolio"}
              </button>
            </form>
          )}

          {/* LIST */}
          {portfolios.length === 0 ? (
            <p>🎨 No portfolio yet — click "Add New Work" to showcase your talent!</p>
          ) : (
            <div className="portfolio-grid">
              {portfolios.map((item) => (
                <div key={item._id} className="portfolio-card">
                  <button onClick={() => deletePortfolio(item._id)}>
                    ×
                  </button>

                  {item.images?.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      width="100"
                      alt="portfolio"
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}

                  <h3>{item.title}</h3>
                  <p>{item.description || "No description provided"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div className="modal" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="full" />
        </div>
      )}
    </>
  );
};

export default CreatorPortfolio;