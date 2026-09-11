import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SubjectSchema = new Schema({
  name: { type: String, required: true },        // e.g. "Linear Algebra"
  slug: { type: String, required: true, unique: true },
});

const ChapterSchema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  name: { type: String, required: true },         // e.g. "Eigenvalues and Eigenvectors"
  slug: { type: String, required: true },
});

const QuestionSchema = new Schema({
  chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  year: { type: Number, required: true },
  set: { type: String, default: null },           // e.g. "Set 1", null if single-shift year
  questionType: { type: String, enum: ["mcq", "msq", "nat"], required: true },
  text: { type: String, required: true },
  options: [{ label: String, text: String }],      // empty for NAT questions
  correctAnswer: { type: Schema.Types.Mixed, required: true }, // option label(s) or number
  marks: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  explanation: { type: String, default: "" },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  sourceNote: { type: String, default: "Official GATE CS question paper" },
});

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const MockTestSchema = new Schema({
  title: { type: String, required: true },
  subjectIds: [{ type: Schema.Types.ObjectId, ref: "Subject" }], // empty = full syllabus
  questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  durationMinutes: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
});

const AttemptSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  mockTestId: { type: Schema.Types.ObjectId, ref: "MockTest", default: null }, // null = practice mode
  answers: [{
    questionId: { type: Schema.Types.ObjectId, ref: "Question" },
    givenAnswer: Schema.Types.Mixed,
    isCorrect: Boolean,
    marksAwarded: Number,
  }],
  score: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: null },
});

const BookmarkSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  createdAt: { type: Date, default: Date.now },
});
BookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const Subject = model("Subject", SubjectSchema);
export const Chapter = model("Chapter", ChapterSchema);
export const Question = model("Question", QuestionSchema);
export const User = model("User", UserSchema);
export const MockTest = model("MockTest", MockTestSchema);
export const Attempt = model("Attempt", AttemptSchema);
export const Bookmark = model("Bookmark", BookmarkSchema);
