import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../api";


function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🔐 AUTO REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "customer") navigate("/customer/dashboard", { replace: true });
      else if (role === "creator") navigate("/creator/dashboard", { replace: true });
      else if (role === "admin") navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const res = await axios.post(`${API}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const role = res.data.role.toLowerCase();

      // ✅ SAVE EVERYTHING (IMPORTANT FIX)
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", res.data.name);

      // 🔥 THIS IS THE MOST IMPORTANT LINE
      localStorage.setItem("user", JSON.stringify(res.data)); 
      // MUST contain _id

      setMessage("Login successful");

      // ✅ ROLE-BASED REDIRECT
      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (role === "creator") {
          navigate("/creator/dashboard", { replace: true });
        } else {
          navigate("/customer/dashboard", { replace: true });
        }
      }, 500);

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
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
        .login-wrapper {
          width: 100vw;
          min-height: 100vh;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        /* Wide form container */
        .login-container {
          width: 90%;
          max-width: 500px;
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

        /* Heading style */
        .login-container h2 {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 0.5rem;
          background: linear-gradient(125deg, #22c55e, #0ea5e9, #eab308);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          text-align: center;
          color: #6b7280;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        /* Message styling */
        .login-container p:first-of-type {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          color: #166534;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        /* Error message */
        .error-message {
          background: #fef2f2 !important;
          border-left-color: #ef4444 !important;
          color: #991b1b !important;
        }

        /* Form layout */
        .login-container form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* Form group */
        .login-container form div {
          width: 100%;
        }

        /* Label styling */
        .login-container label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1f2937;
          font-size: 0.9rem;
        }

        /* Input styling - clean and visible */
        .login-container input {
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

        .login-container input::placeholder {
          color: #9ca3af;
        }

        /* Focus state */
        .login-container input:focus {
          border-color: #22c55e;
          background: white;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        /* Hover state */
        .login-container input:hover {
          border-color: #0ea5e9;
        }

        /* Login button */
        .login-btn {
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
          font-family: inherit;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
          background: linear-gradient(125deg, #2ecc71, #1e8e3e);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Register section */
        .register-section {
          margin-top: 1.5rem;
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .register-section p {
          margin: 0;
          background: none;
          border-left: none;
          padding: 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .register-section button {
          background: none;
          border: none;
          color: #22c55e;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .register-section button:hover {
          color: #16a34a;
          text-decoration: underline;
          transform: scale(1.05);
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
          .login-container {
            padding: 2rem;
            max-width: 450px;
          }
          
          .login-container h2 {
            font-size: 2rem;
          }
        }

        @media (max-width: 768px) {
          .login-wrapper {
            padding: 1rem;
          }
          
          .login-container {
            padding: 1.5rem;
            width: 95%;
          }
          
          .login-container h2 {
            font-size: 1.8rem;
          }
          
          .login-container label {
            font-size: 0.85rem;
          }
          
          .login-container input {
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div className="login-wrapper">
        <div className="login-container">
          <h2>Welcome Back</h2>
          <div className="login-subtitle">Sign in to continue to CustomCraft</div>

          {message && (
            <p className={message.includes("successful") ? "" : "error-message"}>
              {message.includes("successful") ? "✅ " : "❌ "}
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div>
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          <div className="register-section">
            <p>
              Don't have an account?{" "}
              <button onClick={() => navigate("/register")}>
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;