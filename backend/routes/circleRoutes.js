const express = require("express");
const {
  createCircle,
  getCircle,
  getCircleMembers,
  getMyCircles,
  joinCircle,
  createContribution,
  getContributions,
  getMyContributions,
  certificateStatus,
  generateCertificate,
  getCertificate
} = require("../controllers/mvpController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.post("/", createCircle);
router.get("/my", getMyCircles);
router.post("/join", joinCircle);
router.get("/:circleId", getCircle);
router.get("/:circleId/members", getCircleMembers);
router.post("/:circleId/contributions", createContribution);
router.get("/:circleId/contributions", getContributions);
router.get("/:circleId/contributions/me", getMyContributions);
router.get("/:circleId/certificate/status", certificateStatus);
router.post("/:circleId/certificate/generate", generateCertificate);
router.get("/:circleId/certificate", getCertificate);

module.exports = router;
