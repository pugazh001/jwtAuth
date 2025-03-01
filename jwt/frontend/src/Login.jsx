import { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useContext(AuthContext);
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
      const res = await axios.post("http://localhost:5000/login", formData);
      login(res.data.token);
      navigate("/dashboard"); // Redirect after login
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error || "Invalid credentials");
      } else {
        setError("Server unreachable. Please try again.");
      }
    }
  };

  return (
    <div style={{ width: "300px", margin: "50px auto", textAlign: "center" }}>
      <h1>Login</h1>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error */}
      
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

        <select name="method" value={formData.method} onChange={handleChange}>
          <option value="symmetric">HS256 (Symmetric)</option>
          <option value="asymmetric">RS256 (Asymmetric)</option>
        </select>

        <button type="submit">Login</button>
      </form>

      <button onClick={() => navigate("/signup")} style={{ marginTop: "10px" }}>
        Signup
      </button>
    </div>
  );
};

export default Login;
