import { Router } from "express";
import mongoose from "mongoose";
import { Attempt, Question } from "../models/models.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/me/progress -> accuracy per chapter, based on all past attempts
router.get("/me/progress", requireAuth, async (req, res) => {
  const attempts = await Attempt.find({ userId: req.userId, submittedAt: { $ne: null } });

  const allAnswers = attempts.flatMap(a => a.answers);
  const questionIds = [...new Set(allAnswers.map(a => String(a.questionId)))];
  const questions = await Question.find({ _id: { $in: questionIds } }).populate("chapterId");
  const questionMap = Object.fromEntries(questions.map(q => [String(q._id), q]));

  const chapterStats = {}; // chapterName -> { attempted, correct }
  for (const ans of allAnswers) {
    const q = questionMap[String(ans.questionId)];
    if (!q || !q.chapterId) continue;
    const chapterName = q.chapterId.name;
    if (!chapterStats[chapterName]) chapterStats[chapterName] = { attempted: 0, correct: 0 };
    chapterStats[chapterName].attempted += 1;
    if (ans.isCorrect) chapterStats[chapterName].correct += 1;
  }

  const result = Object.entries(chapterStats).map(([chapter, stats]) => ({
    chapter,
    attempted: stats.attempted,
    correct: stats.correct,
    accuracy: stats.attempted ? Math.round((stats.correct / stats.attempted) * 100) : 0,
  })).sort((a, b) => a.accuracy - b.accuracy); // weakest first

  res.json({
    totalAttempts: attempts.length,
    totalScore: attempts.reduce((sum, a) => sum + a.score, 0),
    chapterBreakdown: result,
    weakestChapters: result.slice(0, 3),
  });
});

export default router;
