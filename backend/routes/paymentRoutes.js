const express = require("express");
const { createMockPayment } = require("../controllers/paymentController");

const router = express.Router();

router.post("/mock", createMockPayment);

module.exports = router;
