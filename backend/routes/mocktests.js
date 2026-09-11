import { Router } from "express";
import { MockTest, Question, Attempt } from "../models/models.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/mocktests
router.get("/mocktests", async (req, res) => {
  const tests = await MockTest.find().select("-questionIds");
  res.json(tests);
});

// POST /api/mocktests/:id/start  (auth required) -> returns questions WITHOUT correct answers
router.post("/mocktests/:id/start", requireAuth, async (req, res) => {
  const test = await MockTest.findById(req.params.id).populate("questionIds");
  if (!test) return res.status(404).json({ error: "Mock test not found" });

  const attempt = await Attempt.create({
    userId: req.userId,
    mockTestId: test._id,
    answers: [],
  });

  const questionsForClient = test.questionIds.map(q => ({
    _id: q._id,
    text: q.text,
    options: q.options,
    questionType: q.questionType,
    marks: q.marks,
    negativeMarks: q.negativeMarks,
  }));

  res.json({ attemptId: attempt._id, durationMinutes: test.durationMinutes, questions: questionsForClient });
});

// POST /api/attempts/:attemptId/submit  { answers: [{questionId, givenAnswer}] }
router.post("/attempts/:attemptId/submit", requireAuth, async (req, res) => {
  const attempt = await Attempt.findById(req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: "Attempt not found" });
  if (String(attempt.userId) !== req.userId) return res.status(403).json({ error: "Not your attempt" });

  const { answers } = req.body; // [{ questionId, givenAnswer }]
  const questionIds = answers.map(a => a.questionId);
  const questions = await Question.find({ _id: { $in: questionIds } });
  const questionMap = Object.fromEntries(questions.map(q => [String(q._id), q]));

  let score = 0;
  const gradedAnswers = answers.map(a => {
    const q = questionMap[a.questionId];
    if (!q) return { ...a, isCorrect: false, marksAwarded: 0 };

    let isCorrect;
    if (q.questionType === "msq") {
      const given = Array.isArray(a.givenAnswer) ? [...a.givenAnswer].sort() : [];
      const correct = Array.isArray(q.correctAnswer) ? [...q.correctAnswer].sort() : [];
      isCorrect = JSON.stringify(given) === JSON.stringify(correct);
    } else {
      isCorrect = String(a.givenAnswer).trim() === String(q.correctAnswer).trim();
    }

    const marksAwarded = isCorrect ? q.marks : (a.givenAnswer == null || a.givenAnswer === "" ? 0 : -q.negativeMarks);
    score += marksAwarded;
    return { questionId: a.questionId, givenAnswer: a.givenAnswer, isCorrect, marksAwarded };
  });

  attempt.answers = gradedAnswers;
  attempt.score = score;
  attempt.submittedAt = new Date();
  await attempt.save();

  res.json({ score, answers: gradedAnswers });
});

// GET /api/me/attempts  (progress history)
router.get("/me/attempts", requireAuth, async (req, res) => {
  const attempts = await Attempt.find({ userId: req.userId }).sort({ startedAt: -1 });
  res.json(attempts);
});

export default router;
