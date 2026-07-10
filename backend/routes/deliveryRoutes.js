const express = require("express");
const {
  getAllDeliveries,
  getMyDeliveries,
  requestDelivery,
  updateDeliveryStatus
} = require("../controllers/deliveryController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.post("/", requireRole("member"), requestDelivery);
router.get("/my", requireRole("member"), getMyDeliveries);
router.get("/", requireRole("admin"), getAllDeliveries);
router.patch("/:deliveryId/status", requireRole("admin"), updateDeliveryStatus);

module.exports = router;
