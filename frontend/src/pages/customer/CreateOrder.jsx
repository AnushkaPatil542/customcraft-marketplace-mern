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
          `${API}/api/orders/upload/customer/${orderId}`, // ✅ FIXED
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
    <div className="createorder-wrapper">
      <div className="createorder-container">
        <h2>✨ Create Custom Order</h2>

        {message && <div className="message">{message}</div>}

        <form onSubmit={handleSubmit}>
          {/* TITLE */}
          <input
            type="text"
            placeholder="Order Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* DESCRIPTION */}
          <textarea
            placeholder="Describe your order..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {/* FILE INPUT */}
          <input
            type="file"
            multiple
            onChange={handleFileChange}
          />

          {/* PREVIEW */}
          {filePreviews.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {filePreviews.map((preview, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={preview}
                    alt="preview"
                    width="80"
                    height="80"
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "red",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SUBMIT */}
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Submit Order"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateOrder;