const express = require("express");
const {
  completeLesson,
  getLesson,
  getLessonProgress,
  getLessons
} = require("../controllers/mvpController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireRole("member", "ambassador"));
router.get("/", getLessons);
router.get("/progress/me", getLessonProgress);
router.get("/:lessonId", getLesson);
router.post("/:lessonId/complete", completeLesson);

module.exports = router;
