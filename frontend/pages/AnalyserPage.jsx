import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SiteAnalyser from "../components/SiteAnalyser";
import LoginModal from "../components/LoginModal";

const PRIMARY = "#1E3A5F";
const ACCENT  = "#38BDF8";

export default function AnalyserPage() {
  const [token, setToken]       = useState(() => localStorage.getItem("terrascope_token") || "");
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    setShowLogin(false);
  };

  const handleLogout = () => {
    fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    localStorage.removeItem("terrascope_token");
    setToken("");
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Left: back + logo */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={15} /> Back
            </Link>
            <div className="w-px h-5 bg-gray-200" />
            <Link to="/" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="36" height="36">
                <ellipse cx="50" cy="58" rx="42" ry="18" fill="none" stroke="#1E3A5F" strokeWidth="2.5"/>
                <ellipse cx="50" cy="50" rx="30" ry="13" fill="none" stroke="#1E3A5F" strokeWidth="2.5"/>
                <ellipse cx="50" cy="43" rx="19" ry="8"  fill="none" stroke="#1E3A5F" strokeWidth="2.5"/>
                <ellipse cx="50" cy="37" rx="10" ry="4.5" fill="none" stroke="#38BDF8" strokeWidth="2.5"/>
                <ellipse cx="50" cy="32" rx="4"  ry="2"   fill="#38BDF8"/>
              </svg>
              <span className="text-lg font-bold" style={{ color: PRIMARY }}>Terrascope</span>
            </Link>
          </div>

          {/* Right: auth */}
          {token ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-300 transition-all"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: ACCENT, color: PRIMARY }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ── Analyser ── */}
      <SiteAnalyser token={token} onLoginRequest={() => setShowLogin(true)} />

      {/* ── Login modal ── */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
