const express = require("express");
const { joinGroup } = require("../controllers/groupController");

const router = express.Router();

router.post("/join", joinGroup);

module.exports = router;
