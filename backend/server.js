const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const circleRoutes = require("./routes/circleRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const ambassadorMvpRoutes = require("./routes/ambassadorMvpRoutes");
const { ensurePilotAdmin } = require("./controllers/authController");

const app = express();

const allowedOrigins = ["http://localhost:5173"];

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("CORS origin is not allowed"));
  }
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Embeera Energy Backend is running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "embeera-energy-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/circles", circleRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/ambassador", ambassadorMvpRoutes);

app.use((error, req, res, next) => {
  if (error.message === "CORS origin is not allowed") {
    return res.status(403).json({ message: error.message });
  }

  console.error("Unhandled server error:", error);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

ensurePilotAdmin()
  .catch((error) => {
    console.error("Pilot admin setup error:", error);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Embeera Energy backend running on port ${PORT}`);
    });
  });
