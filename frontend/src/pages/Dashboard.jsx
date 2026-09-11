import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../api.js";

export default function Dashboard() {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get("/me/progress").then(res => setProgress(res.data)).catch(() => setError(true));
  }, []);

  if (error) {
    return <p className="text-slate text-sm">Log in to see your progress.</p>;
  }
  if (!progress) return <p className="text-slate text-sm">Loading…</p>;

  return (
    <div>
      <h1 className="font-serif text-3xl mb-1">Your Progress</h1>
      <p className="text-slate mb-8">{progress.totalAttempts} test attempts &middot; total score {progress.totalScore}</p>

      <h2 className="font-serif text-lg mb-4">Accuracy by chapter (weakest first)</h2>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={progress.chapterBreakdown} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3D445720" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="chapter" width={180} tick={{ fontSize: 12 }} />
            <Bar dataKey="accuracy" fill="#B08D57" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {progress.weakestChapters?.length > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-lg mb-2">Focus areas</h2>
          <ul className="text-sm text-slate space-y-1">
            {progress.weakestChapters.map((c) => (
              <li key={c.chapter}>{c.chapter} — {c.accuracy}% accuracy ({c.attempted} attempted)</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
