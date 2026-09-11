import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/subjects").then(res => setSubjects(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-1">Engineering Mathematics</h1>
      <p className="text-slate mb-8">Pick a subject to browse previous-year questions by chapter.</p>

      {loading && <p className="text-slate text-sm">Loading subjects…</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        {subjects.map((s) => (
          <Link
            key={s._id}
            to={`/subjects/${s.slug}`}
            className="border border-slate/25 rounded-none p-5 hover:border-brass transition-colors"
          >
            <h2 className="font-serif text-lg text-ink">{s.name}</h2>
            <p className="text-sm text-slate mt-1">View chapters &amp; practice questions</p>
          </Link>
        ))}
      </div>

      {!loading && subjects.length === 0 && (
        <p className="text-slate text-sm">
          No subjects yet — run <code className="font-mono text-xs">node backend/scripts/seed.js</code> to populate sample data.
        </p>
      )}
    </div>
  );
}
