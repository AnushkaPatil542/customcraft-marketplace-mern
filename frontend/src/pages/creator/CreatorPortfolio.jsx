import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../api";

const CreatorPortfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const token = localStorage.getItem("token");

  const BASE_URL = `${API}`;

  /* 🔹 LOAD PORTFOLIO */
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await axios.get(
          `${API}/api/portfolio/my`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPortfolios(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPortfolio();
  }, [token]);

  /* 🔹 ADD PORTFOLIO */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      await axios.post(
        `${API}/api/portfolio/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Portfolio added successfully!");

      setTitle("");
      setDescription("");
      setFiles([]);

      // 🔁 reload after upload
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("❌ Failed to add portfolio");
    } finally {
      setIsAdding(false);
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

        .file-input {
          padding: 0.7rem !important;
          cursor: pointer;
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
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
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
        }

        .portfolio-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15);
        }

        /* Image Gallery - FIXED: Proper image display */
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
        }

        .portfolio-image {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.2s ease;
          cursor: pointer;
        }

        .portfolio-image:hover {
          transform: scale(1.02);
        }

        /* For multiple images - grid layout */
        .image-gallery.multiple {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .image-gallery.multiple .portfolio-image-wrapper {
          width: 100%;
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

        /* Responsive */
        @media (max-width: 1024px) {
          .portfolio-wrapper {
            padding: 1.5rem;
          }
          
          .portfolio-container h2 {
            font-size: 2rem;
          }
          
          .portfolio-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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

        /* Animation */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .portfolio-card {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>

      <div className="portfolio-wrapper">
        <div className="portfolio-container">
          <h2>🎨 My Creative Portfolio</h2>

          {/* 🔹 ADD TOGGLE BUTTON */}
          <button 
            className="add-toggle-btn"
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? "− Cancel" : "+ Add New Work"}
            {isAdding && files.length > 0 && ` (${files.length} files selected)`}
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
                    placeholder="e.g., Custom Logo Design, Handmade Saree, Portrait Art..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Describe your creative process, materials used, or unique features..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Upload Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="file-input"
                    onChange={(e) => setFiles(e.target.files)}
                  />
                  {files.length > 0 && (
                    <small style={{ color: "#22c55e", marginTop: "0.5rem", display: "block" }}>
                      ✓ {files.length} file(s) selected
                    </small>
                  )}
                </div>

                <button type="submit" className="submit-btn" >
                  {isAdding ? "📤 Publishing..." : "➕ Publish to Portfolio"}
                </button>
              </form>
            </div>
          )}

          {/* 🔹 DISPLAY PORTFOLIO */}
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
                  <div className={`image-gallery ${item.images.length > 1 ? 'multiple' : ''}`}>
                    {item.images.map((img, i) => (
                      <div key={i} className="portfolio-image-wrapper">
                        <img
                          src={`${BASE_URL}/${img}`}
                          alt={`${item.title} - Image ${i + 1}`}
                          className="portfolio-image"
                          onClick={() => window.open(`${BASE_URL}/${img}`, '_blank')}
                          loading="lazy"
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
    </>
  );
};

export default CreatorPortfolio;