const express = require("express");
const { getMyDeliveries, requestDelivery } = require("../controllers/deliveryController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.post("/", requestDelivery);
router.get("/my", getMyDeliveries);

module.exports = router;
