import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api.js";

export default function QuestionView() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [natAnswer, setNatAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    api.get(`/questions/${id}`).then(res => setQuestion(res.data));
  }, [id]);

  if (!question) return <p className="text-slate text-sm">Loading…</p>;

  const isCorrect = question.questionType === "nat"
    ? natAnswer.trim() === String(question.correctAnswer).trim()
    : selected === question.correctAnswer;

  return (
    <div>
      <p className="text-xs text-slate font-mono mb-4">
        GATE CSE {question.year}{question.set ? ` ${question.set}` : ""} &middot; {question.marks} mark(s)
      </p>

      <p className="font-serif text-lg leading-relaxed mb-6">{question.text}</p>

      {question.questionType !== "nat" ? (
        <div className="space-y-2 mb-6">
          {question.options.map((opt) => {
            const isChosen = selected === opt.label;
            const show = revealed && opt.label === question.correctAnswer;
            return (
              <button
                key={opt.label}
                onClick={() => !revealed && setSelected(opt.label)}
                className={`w-full text-left px-4 py-2.5 border text-sm
                  ${isChosen ? "border-brass" : "border-slate/25"}
                  ${show ? "border-correct text-correct" : ""}`}
              >
                <span className="font-mono text-slate mr-2">{opt.label}.</span>{opt.text}
              </button>
            );
          })}
        </div>
      ) : (
        <input
          type="text"
          value={natAnswer}
          onChange={(e) => setNatAnswer(e.target.value)}
          disabled={revealed}
          placeholder="Enter numerical answer"
          className="border border-slate/25 px-4 py-2 text-sm mb-6 w-48"
        />
      )}

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="bg-ink text-parchment text-sm px-5 py-2.5"
        >
          Check answer
        </button>
      ) : (
        <div className="border-l-2 pl-4 mt-2" style={{ borderColor: isCorrect ? "#2F6E4C" : "#A23B3B" }}>
          <p className={`text-sm font-medium mb-2 ${isCorrect ? "text-correct" : "text-incorrect"}`}>
            {isCorrect ? "Correct" : "Not quite"} — answer: {String(question.correctAnswer)}
          </p>
          <p className="text-sm text-slate leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
