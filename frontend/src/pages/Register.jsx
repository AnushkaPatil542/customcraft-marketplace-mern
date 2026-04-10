import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  // 1️⃣ State to store form input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer"); // default role
  const [message, setMessage] = useState("");

  // 2️⃣ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        role,
      });

      setMessage(res.data.message);

      // After successful registration, redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(
        error.response && error.response.data.message
          ? error.response.data.message
          : "Error registering user"
      );
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
        .register-wrapper {
          width: 100vw;
          min-height: 100vh;
          background: linear-gradient(125deg, #f0fdf4 0%, #dcfce7 25%, #e0f2fe 50%, #fef3c7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        /* Wide form container */
        .register-container {
          width: 90%;
          max-width: 1100px;
          background: white;
          border-radius: 2rem;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 5px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        /* Heading style */
        .register-container h2 {
          font-size: 2.8rem;
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
        .register-container p {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 1rem;
          border-radius: 0.75rem;
          color: #166534;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        /* Form layout */
        .register-container form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Form group */
        .register-container form div {
          width: 100%;
        }

        /* Label styling */
        .register-container label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1f2937;
          font-size: 0.95rem;
        }

        /* Input and select styling - clean and visible */
        .register-container input,
        .register-container select {
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

        .register-container input::placeholder {
          color: #9ca3af;
        }

        /* Focus state */
        .register-container input:focus,
        .register-container select:focus {
          border-color: #22c55e;
          background: white;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
        }

        /* Hover state */
        .register-container input:hover,
        .register-container select:hover {
          border-color: #0ea5e9;
        }

        /* Select styling */
        .register-container select {
          cursor: pointer;
          background-color: #f9fafb;
        }

        .register-container select option {
          background: white;
          color: #1f2937;
        }

        /* Button styling */
        .register-container button {
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

        .register-container button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(34, 197, 94, 0.3);
          background: linear-gradient(125deg, #2ecc71, #1e8e3e);
        }

        .register-container button:active {
          transform: translateY(0);
        }

        /* Responsive design */
        @media (max-width: 1024px) {
          .register-container {
            width: 95%;
            padding: 2rem;
          }
          
          .register-container h2 {
            font-size: 2.3rem;
          }
        }

        @media (max-width: 768px) {
          .register-container {
            width: 98%;
            padding: 1.5rem;
          }
          
          .register-container h2 {
            font-size: 2rem;
          }
          
          .register-container label {
            font-size: 0.9rem;
          }
          
          .register-container input,
          .register-container select {
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div className="register-wrapper">
        <div className="register-container">
          <h2>Register</h2>
          {message && <p>{message}</p>}
          <form onSubmit={handleSubmit}>
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a strong password"
              />
            </div>

            <div>
              <label>Role:</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="customer">Customer</option>
                <option value="creator">Creator</option>
              </select>
            </div>

            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;