const express = require("express");
const cors = require("cors");
require("dotenv").config();
const reportRoutes = require("./routes/reportRoutes");
const cleanupRoutes = require("./routes/cleanupRoutes");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/cleanups", cleanupRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Green-Sweep API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
