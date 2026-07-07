const express = require("express");
const { getUserRewards } = require("../controllers/rewardController");

const router = express.Router();

router.get("/:user_id", getUserRewards);

module.exports = router;
