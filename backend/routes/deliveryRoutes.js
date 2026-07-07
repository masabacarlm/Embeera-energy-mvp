const express = require("express");
const { requestDelivery } = require("../controllers/deliveryController");

const router = express.Router();

router.post("/request", requestDelivery);

module.exports = router;
