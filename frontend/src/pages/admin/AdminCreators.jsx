import { useEffect, useState } from "react";
import axios from "axios";
import API from "../api";

function AdminCreators() {
  const [creators, setCreators] = useState([]);
  const [portfolioData, setPortfolioData] = useState({}); // ✅ NEW

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadCreators = async () => {
      try {
        const res = await axios.get(
          `${API}/api/admin/creators`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCreators(
          Array.isArray(res.data.creators)
            ? res.data.creators
            : Array.isArray(res.data)
            ? res.data
            : []
        );
      } catch (err) {
        console.error(err);
      }
    };

    loadCreators();
  }, [token]);

  /* 🔥 VIEW PORTFOLIO */
  const viewPortfolio = async (creatorId) => {
    try {
      const res = await axios.get(
        `${API}/api/portfolio/${creatorId}`
      );

      setPortfolioData((prev) => ({
        ...prev,
        [creatorId]: res.data,
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to load portfolio");
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
        .admin-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* Wide container */
        .admin-container {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Heading */
        .admin-container h2 {
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

        /* Creator Grid */
        .creator-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
        }

        /* Creator Card */
        .creator-card {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .creator-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        /* Creator Name */
        .creator-card h4 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Creator Email */
        .creator-card p {
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }

        /* View Portfolio Button */
        .view-portfolio-btn {
          background: linear-gradient(125deg, #8b5cf6, #7c3aed);
          color: white;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          width: 100%;
        }

        .view-portfolio-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        /* Portfolio Section */
        .portfolio-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid #e5e7eb;
        }

        /* Portfolio Item */
        .portfolio-item {
          background: #f9fafb;
          border-radius: 1rem;
          padding: 1rem;
          margin-top: 1rem;
          border: 1px solid #e5e7eb;
        }

        .portfolio-title {
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .portfolio-desc {
          color: #6b7280;
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
        }

        /* Portfolio Images */
        .portfolio-images {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .portfolio-img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 0.5rem;
          border: 2px solid #e5e7eb;
          transition: transform 0.2s ease;
          cursor: pointer;
        }

        .portfolio-img:hover {
          transform: scale(1.05);
          border-color: #22c55e;
        }

        /* No Portfolio Message */
        .no-portfolio {
          color: #9ca3af;
          font-size: 0.85rem;
          text-align: center;
          padding: 1rem;
        }

        /* No Creators */
        .no-creators {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 1rem;
          color: #6b7280;
          font-size: 1.1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .admin-wrapper {
            padding: 1.5rem;
          }
          
          .admin-container h2 {
            font-size: 2rem;
          }
          
          .creator-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .admin-wrapper {
            padding: 1rem;
          }
          
          .admin-container h2 {
            font-size: 1.8rem;
          }
          
          .creator-grid {
            grid-template-columns: 1fr;
          }
          
          .creator-card {
            padding: 1rem;
          }
          
          .creator-card h4 {
            font-size: 1.1rem;
          }
          
          .portfolio-img {
            width: 60px;
            height: 60px;
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

        .creator-card {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>

      <div className="admin-wrapper">
        <div className="admin-container">
          <h2>🎨 Creative Creators</h2>

          {creators.length === 0 ? (
            <div className="no-creators">
              No creators found
              <br />
              <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                Creators will appear here once they register
              </span>
            </div>
          ) : (
            <div className="creator-grid">
              {creators.map((c) => (
                <div className="creator-card" key={c._id}>
                  <h4>{c.name}</h4>
                  <p>{c.email}</p>

                  {/* 👁 BUTTON */}
                  <button 
                    className="view-portfolio-btn"
                    onClick={() => viewPortfolio(c._id)}
                  >
                    👁 View Portfolio
                  </button>

                  {/* 🔥 SHOW PORTFOLIO */}
                  {portfolioData[c._id] && (
                    <div className="portfolio-section">
                      {portfolioData[c._id].length === 0 ? (
                        <div className="no-portfolio">
                          No work uploaded yet
                        </div>
                      ) : (
                        portfolioData[c._id].map((item) => (
                          <div key={item._id} className="portfolio-item">
                            <div className="portfolio-title">{item.title}</div>
                            <div className="portfolio-desc">
                              {item.description || "No description provided"}
                            </div>
                            <div className="portfolio-images">
                              {item.images.map((img, i) => (
                                <img
                                  key={i}
                                  src={`${API}/${img.replace(/\\/g, "/")}`}
                                  alt={item.title}
                                  className="portfolio-img"
                                  onClick={() => window.open(`${API}/${img.replace(/\\/g, "/")}`, '_blank')}
                                />
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
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

export default AdminCreators;