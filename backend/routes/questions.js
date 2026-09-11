import { Router } from "express";
import { Subject, Chapter, Question, Bookmark } from "../models/models.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/subjects
router.get("/subjects", async (req, res) => {
  const subjects = await Subject.find().sort({ name: 1 });
  res.json(subjects);
});

// GET /api/subjects/:subjectSlug/chapters
router.get("/subjects/:subjectSlug/chapters", async (req, res) => {
  const subject = await Subject.findOne({ slug: req.params.subjectSlug });
  if (!subject) return res.status(404).json({ error: "Subject not found" });
  const chapters = await Chapter.find({ subjectId: subject._id }).sort({ name: 1 });
  res.json(chapters);
});

// GET /api/chapters/:chapterId/questions?year=2023
router.get("/chapters/:chapterId/questions", async (req, res) => {
  const filter = { chapterId: req.params.chapterId };
  if (req.query.year) filter.year = Number(req.query.year);
  const questions = await Question.find(filter).sort({ year: -1 });
  res.json(questions);
});

// GET /api/questions/:id
router.get("/questions/:id", async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).json({ error: "Question not found" });
  res.json(question);
});

// POST /api/questions/:id/bookmark  (auth required)
router.post("/questions/:id/bookmark", requireAuth, async (req, res) => {
  try {
    await Bookmark.create({ userId: req.userId, questionId: req.params.id });
    res.status(201).json({ bookmarked: true });
  } catch (err) {
    if (err.code === 11000) return res.json({ bookmarked: true }); // already bookmarked
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/questions/:id/bookmark
router.delete("/questions/:id/bookmark", requireAuth, async (req, res) => {
  await Bookmark.deleteOne({ userId: req.userId, questionId: req.params.id });
  res.json({ bookmarked: false });
});

// GET /api/me/bookmarks
router.get("/me/bookmarks", requireAuth, async (req, res) => {
  const bookmarks = await Bookmark.find({ userId: req.userId }).populate("questionId");
  res.json(bookmarks.map(b => b.questionId));
});

export default router;
