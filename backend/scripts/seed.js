// Run with: node scripts/seed.js
// Populates a minimal set of subjects/chapters plus one sample question and mock test,
// so the app has something to show immediately. Replace with real ingested data later.

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Subject, Chapter, Question, MockTest } from "../models/models.js";

dotenv.config();

const SUBJECTS = [
  { name: "Linear Algebra", slug: "linear-algebra", chapters: [
    "Matrices", "Determinants", "System of Linear Equations", "Eigenvalues and Eigenvectors", "LU Decomposition",
  ]},
  { name: "Calculus", slug: "calculus", chapters: [
    "Limits, Continuity and Differentiability", "Maxima and Minima", "Mean Value Theorem", "Integration",
  ]},
  { name: "Probability and Statistics", slug: "probability-and-statistics", chapters: [
    "Random Variables and Distributions", "Mean, Median, Mode and Standard Deviation", "Conditional Probability and Bayes' Theorem",
  ]},
  { name: "Discrete Mathematics", slug: "discrete-mathematics", chapters: [
    "Propositional and First Order Logic", "Sets, Relations, Functions, Partial Orders and Lattices",
    "Monoids, Groups", "Graphs: Connectivity, Matching, Colouring", "Combinatorics",
  ]},
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding...");

  for (const s of SUBJECTS) {
    const subject = await Subject.findOneAndUpdate(
      { slug: s.slug }, { name: s.name, slug: s.slug }, { upsert: true, new: true }
    );
    for (const chName of s.chapters) {
      const slug = chName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      await Chapter.findOneAndUpdate(
        { subjectId: subject._id, slug }, { subjectId: subject._id, name: chName, slug }, { upsert: true }
      );
    }
  }

  // one real, verified sample question (GATE CSE 2021 Set 2)
  const laSubject = await Subject.findOne({ slug: "linear-algebra" });
  const sysChapter = await Chapter.findOne({ subjectId: laSubject._id, slug: "system-of-linear-equations" });

  const q = await Question.findOneAndUpdate(
    { text: /Suppose that P is a 4/ },
    {
      chapterId: sysChapter._id,
      subjectId: laSubject._id,
      year: 2021,
      set: "Set 2",
      questionType: "nat",
      text: "Suppose that P is a 4 x 5 matrix such that every solution of the equation Px = 0 is a scalar multiple of [2 5 4 3 1]^T. What is the rank of P?",
      options: [],
      correctAnswer: "4",
      marks: 1,
      negativeMarks: 0,
      explanation: "Px = 0 is homogeneous with 5 unknowns. Since every solution is a scalar multiple of one vector, the null space has dimension 1. By Rank-Nullity, rank(P) = 5 - 1 = 4.",
      difficulty: "medium",
      sourceNote: "Official GATE CSE 2021 Set 2 question paper",
    },
    { upsert: true, new: true }
  );

  await MockTest.findOneAndUpdate(
    { title: "Linear Algebra — Quick Practice Test" },
    {
      title: "Linear Algebra — Quick Practice Test",
      subjectIds: [laSubject._id],
      questionIds: [q._id],
      durationMinutes: 10,
      totalMarks: q.marks,
    },
    { upsert: true }
  );

  console.log("Seed complete.");
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
