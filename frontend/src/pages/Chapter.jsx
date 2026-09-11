import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api.js";

export default function Chapter() {
  const { subjectSlug } = useParams();
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    api.get(`/subjects/${subjectSlug}/chapters`).then(res => setChapters(res.data));
  }, [subjectSlug]);

  useEffect(() => {
    if (!activeChapter) return;
    api.get(`/chapters/${activeChapter}/questions`).then(res => setQuestions(res.data));
  }, [activeChapter]);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6 capitalize">{subjectSlug.replace(/-/g, " ")}</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {chapters.map((c) => (
          <button
            key={c._id}
            onClick={() => setActiveChapter(c._id)}
            className={`text-sm px-3 py-1.5 border ${
              activeChapter === c._id ? "border-brass text-ink" : "border-slate/25 text-slate"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {activeChapter && (
        <div className="space-y-3">
          {questions.map((q) => (
            <Link
              key={q._id}
              to={`/questions/${q._id}`}
              className="block border-b border-slate/15 pb-3 hover:text-brass"
            >
              <span className="text-xs text-slate font-mono mr-2">GATE {q.year}{q.set ? ` ${q.set}` : ""}</span>
              {q.text.slice(0, 110)}{q.text.length > 110 ? "…" : ""}
            </Link>
          ))}
          {questions.length === 0 && (
            <p className="text-slate text-sm">No questions in this chapter yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
