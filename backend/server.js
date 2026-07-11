const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const circleRoutes = require("./routes/circleRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const ambassadorMvpRoutes = require("./routes/ambassadorMvpRoutes");

const app = express();
app.set("trust proxy", 1);

const productionFrontendOrigin = "https://embeera-energy-mvp.vercel.app";
const allowedOrigins = [
  productionFrontendOrigin,
  process.env.FRONTEND_URL || "",
  process.env.FRONTEND_URLS || ""
]
  .join(",")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean)
  .filter((origin, index, origins) => origins.indexOf(origin) === index);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.trim().replace(/\/$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`Blocked CORS origin: ${normalizedOrigin}`);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
}));
app.use(express.json({ limit: "100kb" }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
    errors: []
  }
}));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Embeera Energy API is running", data: { status: "healthy" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/circles", circleRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/ambassador", ambassadorMvpRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found.",
    errors: []
  });
});

app.get("/", (req, res) => res.json({ success: true, message: "Embeera Energy API", data: {} }));

app.use((error, req, res, next) => {
  if (error.message === "Origin not allowed by CORS") {
    return res.status(403).json({ success: false, message: error.message, errors: [] });
  }

  console.error("Unhandled server error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: process.env.NODE_ENV === "production" ? [] : [error.message]
  });
});

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Embeera Energy API running on port ${PORT}`);
  });
}

module.exports = app;
