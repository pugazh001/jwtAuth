import React, { useState, useEffect } from "react";
import axios from "axios";

const ProtectedPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const token = localStorage.getItem("token"); // Get JWT token from local storage
        if (!token) {
          setError("No token found. Please login first.");
          return;
        }

        const response = await axios.get("http://localhost:5000/protected", {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in Authorization header
          },
        });

        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Something went wrong!");
      }
    };

    fetchProtectedData();
  }, []);

  return (
    <div>
      <h2>Protected Page</h2>
      {error ? <p style={{ color: "red" }}>{error}</p> : <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};

export default ProtectedPage;
