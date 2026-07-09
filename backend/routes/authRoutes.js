const express = require("express");
const rateLimit = require("express-rate-limit");
const { login, register } = require("../controllers/authController");
const { getMe, requestOtp, verifyOtp } = require("../controllers/mvpController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth attempts. Please try again later." }
});

router.use(authLimiter);
router.post("/login", login);
router.post("/register", register);
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me", requireAuth, getMe);

module.exports = router;
