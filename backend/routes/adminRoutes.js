const express = require("express");
const { getAdminOverview, getAmbassadorOverview, getUsers, getCircles, getContributions, getCertificates, getReferrals } = require("../controllers/adminController");
const { getAllDeliveries } = require("../controllers/deliveryController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));
router.get("/overview", getAdminOverview);
router.get("/users", getUsers);
router.get("/circles", getCircles);
router.get("/contributions", getContributions);
router.get("/certificates", getCertificates);
router.get("/referrals", getReferrals);
router.get("/deliveries", getAllDeliveries);
router.get("/ambassador/:user_id", getAmbassadorOverview);

module.exports = router;
