import { Routes, Route, Link } from "react-router-dom";
import Subjects from "./pages/Subjects.jsx";
import Chapter from "./pages/Chapter.jsx";
import QuestionView from "./pages/QuestionView.jsx";
import MockTest from "./pages/MockTest.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate/20 px-6 md:px-10 py-5 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl tracking-tight text-ink">
          Rankwise <span className="text-brass">/</span> GATE CS
        </Link>
        <nav className="flex gap-6 text-sm text-slate">
          <Link to="/" className="hover:text-ink">Subjects</Link>
          <Link to="/dashboard" className="hover:text-ink">Progress</Link>
        </nav>
      </header>

      <main className="flex-1 px-6 md:px-10 py-10 max-w-4xl w-full mx-auto">
        <Routes>
          <Route path="/" element={<Subjects />} />
          <Route path="/subjects/:subjectSlug" element={<Chapter />} />
          <Route path="/questions/:id" element={<QuestionView />} />
          <Route path="/mocktests/:id" element={<MockTest />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>

      <footer className="px-6 md:px-10 py-6 text-xs text-slate border-t border-slate/20">
        Questions sourced from official GATE CS question papers. Explanations are original.
      </footer>
    </div>
  );
}
