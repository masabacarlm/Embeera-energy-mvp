const express = require("express");
const { getAdminOverview, getAmbassadorOverview } = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));
router.get("/overview", getAdminOverview);
router.get("/ambassador/:user_id", getAmbassadorOverview);

module.exports = router;
