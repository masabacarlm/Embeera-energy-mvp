const express = require("express");
const { getSavingsProgress } = require("../controllers/savingsController");

const router = express.Router();

router.get("/progress/:user_id", getSavingsProgress);

module.exports = router;
