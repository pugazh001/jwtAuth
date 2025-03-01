//console.log("hello");
require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sql = require("mssql");
const cors = require("cors");
const fs = require("fs");
const app = express();
app.use(express.json());
app.use(cors());

// MSSQL Database Config
const dbConfig = {
  user: "user",
  password: "*****",
  server: "server",
  database: "dbname",
  options: { encrypt: true, trustServerCertificate: true },
};

// JWT Keys (Symmetric & Asymmetric)
const SECRET_KEY = process.env.JWT_SECRET; // Symmetric key (HMAC)
const PRIVATE_KEY = fs.readFileSync("private.pem", "utf8");
const PUBLIC_KEY = fs.readFileSync("public.pem", "utf8");


// Connect to MSSQL
sql.connect(dbConfig, (err) => {
  if (err) console.error("Database connection failed:", err);
  else console.log("Connected to MSSQL");
});

// Register User
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const pool = await sql.connect(dbConfig);
    await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, hashedPassword)
      .query("INSERT INTO UsersJwt (username, password) VALUES (@username, @password)");
    
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
    console.log("Login Request Received:", req.body); // Log request body
  
    const { username, password, method } = req.body;
    console.log("PRIVATE_KEY:", PRIVATE_KEY ? "Loaded" : "MISSING");

    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool
        .request()
        .input("username", sql.NVarChar, username)
        .query("SELECT * FROM UsersJwt WHERE username = @username");
  
      console.log("User Data from DB:", result.recordset); // Log retrieved user data
  
      if (!result.recordset.length) return res.status(400).json({ error: "User not found" });
  
      const user = result.recordset[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      console.log("Password Match:", passwordMatch); // Log password comparison result
  
      if (!passwordMatch) return res.status(401).json({ error: "Invalid credentials" });
  
      // Generate JWT Token
      const payload = { id: user.id, username: user.username };
      console.log("JWT Payload:", payload); // Log JWT payload
  
      let token;
  
      if (method === "symmetric") {
        token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h", algorithm: "HS256" });
      } else if (method === "asymmetric") {
        token = jwt.sign(payload, PRIVATE_KEY, { expiresIn: "1h", algorithm: "RS256" });
      } else {
        return res.status(400).json({ error: "Invalid method" });
      }
  
      console.log("Generated JWT Token:", token); // Log generated token
  
      res.json({ token });
    } catch (err) {
      console.error("Error during login:", err); // Log errors
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get("/protected", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
  
    console.log("Received Token for Verification:", token); // Log received token
  
    if (!token) return res.status(401).json({ error: "Access Denied" });
  
    try {
      let decoded = null;
      try {
        decoded = jwt.verify(token, SECRET_KEY, { algorithms: ["HS256"] });
      } catch (err) {
        decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });
      }
  
      console.log("Decoded Token:", decoded); // Log decoded token
  
      res.json({ message: "Protected content", user: decoded });
    } catch (err) {
      console.error("Invalid Token:", err); // Log verification errors
      res.status(401).json({ error: "Invalid token" });
    }
  });
  

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
