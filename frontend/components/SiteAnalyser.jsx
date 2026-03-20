import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Zap, Droplets, Users, AlertTriangle, CheckCircle, AlertCircle, RotateCcw, Lock } from "lucide-react";

const PRIMARY = "#1E3A5F";
const ACCENT = "#38BDF8";

const VERDICT_CONFIG = {
  "SAFE TO BUILD": {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: <CheckCircle size={20} />,
    dot: "#10B981",
  },
  "PROCEED WITH CAUTION": {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: <AlertCircle size={20} />,
    dot: "#F59E0B",
  },
  "HIGH RISK": {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: <AlertTriangle size={20} />,
    dot: "#EF4444",
  },
};

function ScoreBar({ label, icon, score }) {
  const getRisk = (s) => {
    if (s < 40) return { label: "LOW", color: "#10B981", bg: "bg-emerald-500" };
    if (s < 60) return { label: "MEDIUM", color: "#F59E0B", bg: "bg-amber-400" };
    return { label: "HIGH", color: "#EF4444", bg: "bg-red-500" };
  };
  const risk = getRisk(score);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span style={{ color: risk.color }}>{icon}</span>
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{ color: risk.color, backgroundColor: risk.color + "18" }}
          >
            {risk.label}
          </span>
          <span className="text-sm text-gray-400 w-6 text-right">{score}</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${risk.bg}`}
        />
      </div>
    </div>
  );
}

function AlternativeCard({ alt, delay }) {
  const config = VERDICT_CONFIG[alt.verdict] || VERDICT_CONFIG["SAFE TO BUILD"];
  const avg = Math.round((alt.scores.water + alt.scores.energy + alt.scores.community) / 3);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`p-4 rounded-xl border ${config.border} ${config.bg}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm" style={{ color: PRIMARY }}>
            {alt.location}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{alt.reason}</p>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-xs font-bold ${config.text}`}>{alt.verdict}</div>
          <div className="text-xs text-gray-400 mt-0.5">avg score {avg}</div>
        </div>
      </div>
    </motion.div>
  );
}

function ResultsCard({ result, onReset }) {
  const config = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG["SAFE TO BUILD"];
  const sizeLabel = { small: "Small (10MW)", medium: "Medium (50MW)", large: "Large (100MW+)" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Site header */}
      <div
        className="rounded-t-2xl px-6 py-5"
        style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #0F2040 100%)` }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: ACCENT }}>
              SITE ANALYSIS
            </p>
            <h3 className="text-xl font-bold text-white">{result.location}</h3>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              {sizeLabel[result.size]}
            </p>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors mt-1"
          >
            <RotateCcw size={12} /> New analysis
          </button>
        </div>
      </div>

      {/* Scores */}
      <div className="bg-white border-x border-gray-100 px-6 py-6">
        <ScoreBar label="Water & Cooling" icon={<Droplets size={14} />} score={result.scores.water} />
        <ScoreBar label="Energy Grid" icon={<Zap size={14} />} score={result.scores.energy} />
        <ScoreBar label="Community & Political" icon={<Users size={14} />} score={result.scores.community} />
      </div>

      {/* Verdict */}
      <div className={`border-x px-6 py-4 flex items-center gap-3 border-t ${config.border} ${config.bg}`}>
        <span className={config.text}>{config.icon}</span>
        <span className={`font-bold text-sm ${config.text}`}>{result.verdict}</span>
      </div>

      {/* Flags */}
      {result.flags.length > 0 && (
        <div className="border-x border-gray-100 bg-gray-50 px-6 py-4">
          {result.flags.map((flag, i) => (
            <p key={i} className="text-xs text-gray-600 flex items-start gap-2">
              <span className="text-amber-500 mt-0.5 shrink-0">⚠</span> {flag}
            </p>
          ))}
        </div>
      )}

      {/* Alternatives */}
      {result.alternatives.length > 0 && (
        <div className="border border-gray-100 rounded-b-2xl bg-white px-6 py-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Consider these instead
          </p>
          <div className="flex flex-col gap-3">
            {result.alternatives.map((alt, i) => (
              <AlternativeCard key={alt.location} alt={alt} delay={i * 0.1} />
            ))}
          </div>
        </div>
      )}

      {result.alternatives.length === 0 && (
        <div className="border border-gray-100 rounded-b-2xl" />
      )}
    </motion.div>
  );
}

export default function SiteAnalyser({ token, onLoginRequest }) {
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("small");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.trim()) return;
    if (!token) { onLoginRequest?.(); return; }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ location: location.trim(), size }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else if (res.status === 404) {
        setError(data.detail || `Location not found. Try a city name, zip code, or "City, State" format.`);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="analyser" className="py-24 bg-white relative">
      {/* Auth overlay */}
      {!token && (
        <div className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center px-8 py-10 rounded-2xl border border-gray-200 bg-white shadow-xl max-w-sm mx-4"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "rgba(30,58,95,0.08)" }}
            >
              <Lock size={24} style={{ color: PRIMARY }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: PRIMARY }}>
              Sign in to access
            </h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              The Site Analyser is available to Terrascope subscribers.
              Sign in to run unlimited analyses.
            </p>
            <button
              onClick={onLoginRequest}
              className="px-8 py-3 rounded-lg font-semibold text-white text-sm transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: PRIMARY }}
            >
              Sign In to Analyse
            </button>
          </motion.div>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ backgroundColor: "rgba(56,189,248,0.1)", color: ACCENT }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Live Demo
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: PRIMARY }}>
            Try the Site Analyser
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Enter any US location — city, zip code, suburb, or street address.
            Terrascope scores it across all three risk dimensions using real data.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-4xl mx-auto">
          {/* Form */}
          <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="analyser-location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <input
                  id="analyser-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, zip code, suburb or address…"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label
                  htmlFor="analyser-size"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data Centre Size
                </label>
                <select
                  id="analyser-size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                >
                  <option value="small">Small — 10MW</option>
                  <option value="medium">Medium — 50MW</option>
                  <option value="large">Large — 100MW+</option>
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !location.trim()}
                className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: PRIMARY }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analysing...
                  </>
                ) : (
                  <>
                    <MapPin size={15} /> Analyse Site
                  </>
                )}
              </button>

              {/* Example searches */}
              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-2">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {["Ashburn, VA", "20001", "Brooklyn, NY", "Irving, TX", "New Albany, OH"].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setLocation(ex)}
                      className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-sky-300 hover:text-sky-600 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Results */}
          <div className="min-h-[200px]">
            <AnimatePresence mode="wait">
              {result ? (
                <ResultsCard
                  key="result"
                  result={result}
                  onReset={() => { setResult(null); setLocation(""); }}
                />
              ) : !loading ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center py-16 rounded-2xl border-2 border-dashed border-gray-100"
                >
                  <MapPin size={32} className="mb-3" style={{ color: "#CBD5E1" }} />
                  <p className="text-sm text-gray-400">
                    Enter a US city to see its risk analysis
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-gray-100"
                >
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-sky-400 rounded-full animate-spin mb-4" />
                  <p className="text-sm text-gray-400">Analysing site risks…</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
