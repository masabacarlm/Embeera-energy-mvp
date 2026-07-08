const express = require("express");
const { getAdminOverview, getAmbassadorOverview } = require("../controllers/adminController");

const router = express.Router();

router.get("/overview", getAdminOverview);
router.get("/ambassador/:user_id", getAmbassadorOverview);

module.exports = router;
