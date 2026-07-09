const express = require("express");
const {
  addReferral,
  getReferral,
  getReferrals
} = require("../controllers/mvpController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireRole("ambassador", "admin"));
router.post("/referrals", addReferral);
router.get("/referrals", getReferrals);
router.get("/referrals/:referredUserId", getReferral);

module.exports = router;
