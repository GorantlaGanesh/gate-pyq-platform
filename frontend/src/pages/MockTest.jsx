import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api.js";

export default function MockTest() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null); // { attemptId, questions, durationMinutes }
  const [answers, setAnswers] = useState({});   // questionId -> givenAnswer
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    api.post(`/mocktests/${id}/start`).then(res => {
      setAttempt(res.data);
      setSecondsLeft(res.data.durationMinutes * 60);
    });
  }, [id]);

  const submit = useCallback(async () => {
    if (!attempt || result) return;
    const payload = Object.entries(answers).map(([questionId, givenAnswer]) => ({ questionId, givenAnswer }));
    const res = await api.post(`/attempts/${attempt.attemptId}/submit`, { answers: payload });
    setResult(res.data);
  }, [attempt, answers, result]);

  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) { submit(); return; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, result, submit]);

  if (!attempt) return <p className="text-slate text-sm">Starting test…</p>;

  const mm = String(Math.floor((secondsLeft ?? 0) / 60)).padStart(2, "0");
  const ss = String((secondsLeft ?? 0) % 60).padStart(2, "0");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl">Mock Test</h1>
        <span className="font-mono text-sm text-brass">{mm}:{ss}</span>
      </div>

      {result ? (
        <div>
          <p className="font-serif text-xl mb-4">Score: {result.score}</p>
          <div className="space-y-2">
            {result.answers.map((a) => (
              <p key={a.questionId} className={`text-sm ${a.isCorrect ? "text-correct" : "text-incorrect"}`}>
                {a.isCorrect ? "Correct" : "Incorrect"} — marks: {a.marksAwarded}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {attempt.questions.map((q, i) => (
            <div key={q._id}>
              <p className="text-sm mb-2">
                <span className="font-mono text-slate mr-2">Q{i + 1}.</span>{q.text}
              </p>
              {q.questionType !== "nat" ? (
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setAnswers((a) => ({ ...a, [q._id]: opt.label }))}
                      className={`text-sm px-3 py-1.5 border ${
                        answers[q._id] === opt.label ? "border-brass" : "border-slate/25"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  onChange={(e) => setAnswers((a) => ({ ...a, [q._id]: e.target.value }))}
                  className="border border-slate/25 px-3 py-1.5 text-sm w-40"
                />
              )}
            </div>
          ))}
          <button onClick={submit} className="bg-ink text-parchment text-sm px-5 py-2.5">
            Submit test
          </button>
        </div>
      )}
    </div>
  );
}
