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
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.post("/", requireRole("member", "ambassador"), createCircle);
router.get("/my", requireRole("member", "ambassador"), getMyCircles);
router.post("/join", requireRole("member", "ambassador"), joinCircle);
router.get("/:circleId", getCircle);
router.get("/:circleId/members", getCircleMembers);
router.post("/:circleId/contributions", requireRole("member", "ambassador"), createContribution);
router.get("/:circleId/contributions", getContributions);
router.get("/:circleId/contributions/me", requireRole("member", "ambassador"), getMyContributions);
router.get("/:circleId/certificate/status", certificateStatus);
router.post("/:circleId/certificate/generate", generateCertificate);
router.get("/:circleId/certificate", getCertificate);

module.exports = router;
