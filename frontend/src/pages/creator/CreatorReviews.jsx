import { useEffect, useState } from "react";
import axios from "axios";
import API from "../api";


function CreatorReviews() {
  const [reviews, setReviews] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `${API}/api/reviews/creator`, // ✅ FIXED
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setReviews(res.data);
      } catch (error) {
        console.error("Error fetching reviews", error);
      }
    };

    fetchReviews();
  }, [token]);

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Rating distribution
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  // Render stars function
  const renderStars = (rating) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
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
        .reviews-wrapper {
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
        }

        /* Wide container */
        .reviews-container {
          width: 95%;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Heading */
        .reviews-container h2 {
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

        /* Stats Section */
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        /* Rating Summary Card */
        .rating-summary {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .average-rating {
          font-size: 3.5rem;
          font-weight: 800;
          background: linear-gradient(125deg, #22c55e, #eab308);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .total-reviews {
          color: #6b7280;
          margin-top: 0.5rem;
        }

        .stars-big {
          font-size: 1.5rem;
          margin: 0.5rem 0;
        }

        /* Distribution Card */
        .distribution-card {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .distribution-title {
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .rating-bar-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .rating-label {
          width: 60px;
          font-size: 0.9rem;
          color: #4b5563;
        }

        .bar-container {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #eab308);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .rating-count {
          width: 40px;
          font-size: 0.85rem;
          color: #6b7280;
        }

        /* Reviews Grid */
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        /* Review Card */
        .review-card {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .review-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        /* Order Title */
        .order-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        /* Rating Stars */
        .rating-stars {
          font-size: 1.1rem;
          margin: 0.75rem 0;
        }

        /* Comment */
        .review-comment {
          color: #4b5563;
          line-height: 1.5;
          margin-top: 0.5rem;
          font-style: italic;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.75rem;
        }

        /* No Reviews */
        .no-reviews {
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
          .reviews-wrapper {
            padding: 1.5rem;
          }
          
          .reviews-container h2 {
            font-size: 2rem;
          }
          
          .reviews-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .reviews-wrapper {
            padding: 1rem;
          }
          
          .reviews-container h2 {
            font-size: 1.8rem;
          }
          
          .stats-section {
            grid-template-columns: 1fr;
          }
          
          .reviews-grid {
            grid-template-columns: 1fr;
          }
          
          .review-card {
            padding: 1rem;
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

        .review-card, .rating-summary, .distribution-card {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>

      <div className="reviews-wrapper">
        <div className="reviews-container">
          <h2>⭐ My Reviews</h2>

          {reviews.length === 0 ? (
            <div className="no-reviews">
              No reviews yet
              <br />
              <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                Complete orders and provide great service to receive reviews!
              </span>
            </div>
          ) : (
            <>
              {/* Stats Section */}
              <div className="stats-section">
                {/* Rating Summary */}
                <div className="rating-summary">
                  <div className="average-rating">{averageRating}</div>
                  <div className="stars-big">{renderStars(Math.round(averageRating))}</div>
                  <div className="total-reviews">
                    Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="distribution-card">
                  <div className="distribution-title">Rating Distribution</div>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="rating-bar-item">
                      <span className="rating-label">{star} ⭐</span>
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${(ratingDistribution[star] / reviews.length) * 100}%` }}
                        />
                      </div>
                      <span className="rating-count">{ratingDistribution[star]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Grid */}
              <div className="reviews-grid">
                {reviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="order-title">
                      📦 {review.order?.title || "N/A"}
                    </div>
                    <div className="rating-stars">
                      {renderStars(review.rating)}
                    </div>
                    <div className="review-comment">
                      "{review.comment || "No comment provided"}"
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default CreatorReviews;