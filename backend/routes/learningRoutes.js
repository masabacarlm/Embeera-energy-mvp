const express = require("express");
const { updateLearningProgress } = require("../controllers/learningController");

const router = express.Router();

router.post("/update", updateLearningProgress);

module.exports = router;
