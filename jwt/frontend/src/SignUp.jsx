import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "", method: "symmetric" });
  const [error, setError] = useState(""); // Store error messages

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      await axios.post("http://localhost:5000/register", formData);
      alert("Signup Successful!");
      navigate("/login"); // Redirect after signup
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error || "Signup failed");
      } else {
        setError("Server unreachable. Please try again.");
      }
    }
  };

  return (
    <div style={{ width: "300px", margin: "50px auto", textAlign: "center" }}>
      <h1>Signup</h1>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error messages */}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input 
          type="text" 
          name="username" 
          placeholder="Username" 
          value={formData.username} 
          onChange={handleChange} 
          required 
        />

        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={formData.password} 
          onChange={handleChange} 
          required 
        />

        {/* <select name="method" value={formData.method} onChange={handleChange}>
          <option value="symmetric">HS256 (Symmetric)</option>
          <option value="asymmetric">RS256 (Asymmetric)</option>
        </select> */}

        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
