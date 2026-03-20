import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin, Zap, Droplets, Users, AlertTriangle, CheckCircle, AlertCircle,
  RotateCcw, Lock, Lightbulb, ChevronDown, MousePointer2, FileText, X, Copy, Check,
} from "lucide-react";

const PRIMARY = "#1E3A5F";
const ACCENT  = "#38BDF8";

const VERDICT_CONFIG = {
  "SAFE TO BUILD": {
    bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700",
    icon: <CheckCircle size={20} />, dot: "#10B981",
  },
  "PROCEED WITH CAUTION": {
    bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700",
    icon: <AlertCircle size={20} />, dot: "#F59E0B",
  },
  "HIGH RISK": {
    bg: "bg-red-50", border: "border-red-200", text: "text-red-700",
    icon: <AlertTriangle size={20} />, dot: "#EF4444",
  },
};

const VERDICT_COLORS = {
  "SAFE TO BUILD":        { fill: "#10B981", stroke: "#059669" },
  "PROCEED WITH CAUTION": { fill: "#F59E0B", stroke: "#D97706" },
  "HIGH RISK":            { fill: "#EF4444", stroke: "#DC2626" },
};

const MAP_LEGEND = [
  { label: "Safe to Build",        color: "#10B981" },
  { label: "Proceed with Caution", color: "#F59E0B" },
  { label: "High Risk",            color: "#EF4444" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBar({ label, icon, score }) {
  const getRisk = (s) => {
    if (s < 40) return { label: "LOW",    color: "#10B981", bg: "bg-emerald-500" };
    if (s < 60) return { label: "MEDIUM", color: "#F59E0B", bg: "bg-amber-400"   };
    return              { label: "HIGH",  color: "#EF4444", bg: "bg-red-500"     };
  };
  const risk = getRisk(score);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
          <span style={{ color: risk.color }}>{icon}</span>
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-1.5 py-0.5 rounded"
            style={{ color: risk.color, backgroundColor: risk.color + "18" }}>
            {risk.label}
          </span>
          <span className="text-xs text-gray-400 w-6 text-right">{score}</span>
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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

const DIM_ICONS = {
  water:     <Droplets size={13} />,
  energy:    <Zap size={13} />,
  community: <Users size={13} />,
};

const RISK_STYLE = {
  HIGH:   { badge: "bg-red-100 text-red-700",         border: "border-red-100",     icon: "text-red-500"     },
  MEDIUM: { badge: "bg-amber-100 text-amber-700",      border: "border-amber-100",   icon: "text-amber-500"   },
  LOW:    { badge: "bg-emerald-100 text-emerald-700",  border: "border-emerald-100", icon: "text-emerald-500" },
};

/** Modal that displays a generated action document. */
function ActionModal({ doc, loading, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!doc) return;
    const text = [
      doc.title,
      `Prepared for: ${doc.location}`,
      `Document type: ${doc.document_type}`,
      "",
      ...doc.sections.flatMap((s) => [`${s.heading}\n${s.content}`, ""]),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between gap-4"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #0F2040 100%)` }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} style={{ color: ACCENT }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: ACCENT }}>
                Action Document
              </span>
            </div>
            {loading ? (
              <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
            ) : (
              <h3 className="text-base font-bold text-white leading-snug">{doc?.title}</h3>
            )}
            {!loading && doc && (
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                {doc.document_type} · {doc.location}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors shrink-0 mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-sky-400 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Generating action plan…</p>
            </div>
          ) : doc ? (
            <div className="flex flex-col gap-5">
              {doc.sections.map((section, i) => (
                <div key={i}>
                  <h4 className="text-sm font-bold mb-1.5" style={{ color: PRIMARY }}>{section.heading}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
                  {i < doc.sections.length - 1 && <div className="mt-5 border-b border-gray-100" />}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {!loading && doc && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">Generated by Terrascope · For planning purposes</p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: copied ? "#10B981" : PRIMARY }}
            >
              {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy document</>}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/** Collapsible reasoning card — open state controlled by parent. */
function ReasoningCard({ item, open, token, location, size, score }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionDoc, setActionDoc]         = useState(null);
  const [showModal, setShowModal]         = useState(false);

  const handleTakeAction = async (e) => {
    e.stopPropagation();
    setShowModal(true);
    setActionLoading(true);
    setActionDoc(null);
    try {
      const res  = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ location, dimension: item.dimension, size, score, mitigation: item.mitigation }),
      });
      const data = await res.json();
      if (res.ok) setActionDoc(data);
    } catch { /* silently ignore */ } finally {
      setActionLoading(false);
    }
  };

  const style    = RISK_STYLE[item.risk_level] || RISK_STYLE.MEDIUM;
  const isLow    = item.risk_level === "LOW";
  const tipBg    = isLow ? "bg-emerald-50"  : "bg-sky-50";
  const tipText  = isLow ? "text-emerald-700" : "text-sky-700";
  const tipIcon  = isLow ? "text-emerald-500" : "text-sky-500";
  const tipLabel = isLow ? "Best practice"    : "Mitigation";

  return (
    <>
    {showModal && (
      <ActionModal
        doc={actionDoc}
        loading={actionLoading}
        onClose={() => setShowModal(false)}
      />
    )}
    <div
      className={`rounded-xl border ${style.border} bg-white overflow-hidden`}
    >
      {/* Always-visible header */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`${style.icon} shrink-0`}>{DIM_ICONS[item.dimension]}</span>
          <span className="text-xs font-semibold text-gray-700 truncate">{item.label}</span>
        </div>
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${style.badge}`}>
          {item.risk_level}
        </span>
      </div>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 flex flex-col gap-2 border-t border-gray-50">
              <p className="text-xs text-gray-600 leading-relaxed pt-2">{item.detail}</p>
              <div className={`flex items-start gap-1.5 rounded-lg px-2.5 py-2 ${tipBg}`}>
                <Lightbulb size={11} className={`${tipIcon} shrink-0 mt-0.5`} />
                <div>
                  <span className={`text-xs font-semibold ${tipText}`}>{tipLabel}: </span>
                  <span className={`text-xs ${tipText} leading-relaxed`}>{item.mitigation}</span>
                </div>
              </div>
              {item.risk_level !== "LOW" && (
                <button
                  type="button"
                  onClick={handleTakeAction}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 mt-1"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <FileText size={11} /> Take Action →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}

/** Compact alternative card for 2-column grid. */
function AlternativeCard({ alt, onSelect }) {
  const config = VERDICT_CONFIG[alt.verdict] || VERDICT_CONFIG["SAFE TO BUILD"];
  const avg    = Math.round((alt.scores.water + alt.scores.energy + alt.scores.community) / 3);
  const shortVerdict = alt.verdict === "SAFE TO BUILD" ? "SAFE"
    : alt.verdict === "HIGH RISK" ? "HIGH RISK" : "CAUTION";

  return (
    <button
      type="button"
      onClick={() => onSelect(alt.location)}
      className={`w-full text-left p-3 rounded-xl border ${config.border} ${config.bg} hover:brightness-95 transition-all duration-150 cursor-pointer`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <p className="font-semibold text-xs leading-tight" style={{ color: PRIMARY }}>
          {alt.location}
        </p>
        <span className={`text-xs font-bold shrink-0 ${config.text}`}>{shortVerdict}</span>
      </div>
      <p className="text-xs text-gray-400 leading-tight line-clamp-2 mb-2">{alt.reason}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">avg {avg}</span>
        <span className="text-xs font-semibold" style={{ color: PRIMARY }}>Analyse →</span>
      </div>
    </button>
  );
}

function ResultsCard({ result, onReset, onSelectAlternative, token }) {
  const [reasoningOpen, setReasoningOpen] = useState(result.verdict !== "SAFE TO BUILD");
  const config    = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG["SAFE TO BUILD"];
  const sizeLabel = { small: "Small · 10 MW", medium: "Medium · 50 MW", large: "Large · 100 MW+" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
    >
      {/* Header */}
      <div className="px-5 py-4"
        style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #0F2040 100%)` }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest mb-0.5" style={{ color: ACCENT }}>
              SITE ANALYSIS
            </p>
            <h3 className="text-lg font-bold text-white leading-tight">{result.location}</h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              {sizeLabel[result.size]}
            </p>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors mt-0.5"
          >
            <RotateCcw size={11} /> New
          </button>
        </div>
      </div>

      {/* Scores */}
      <div className="bg-white px-5 pt-5 pb-3">
        <ScoreBar label="Water & Cooling"       icon={<Droplets size={13} />} score={result.scores.water}     />
        <ScoreBar label="Energy Grid"           icon={<Zap size={13} />}      score={result.scores.energy}    />
        <ScoreBar label="Community & Political" icon={<Users size={13} />}    score={result.scores.community} />
      </div>

      {/* Verdict */}
      <div className={`px-5 py-3 flex items-center gap-2.5 border-t ${config.border} ${config.bg}`}>
        <span className={config.text}>{config.icon}</span>
        <span className={`font-bold text-sm ${config.text}`}>{result.verdict}</span>
      </div>

      {/* Flags */}
      {result.flags.length > 0 && (
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
          {result.flags.map((flag, i) => (
            <p key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
              <span className="text-amber-500 mt-0.5 shrink-0">⚠</span> {flag}
            </p>
          ))}
        </div>
      )}

      {/* Site Intelligence — 3-column grid with single expand/collapse toggle */}
      {result.reasoning?.length > 0 && (
        <div className="bg-gray-50 px-5 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Site Intelligence
            </p>
            <button
              type="button"
              onClick={() => setReasoningOpen((o) => !o)}
              className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${reasoningOpen ? "rotate-180" : ""}`}
              />
              {reasoningOpen ? "Collapse" : "Expand"}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {result.reasoning.map((item) => (
              <ReasoningCard
                key={item.dimension}
                item={item}
                open={reasoningOpen}
                token={token}
                location={result.location}
                size={result.size}
                score={result.scores[item.dimension]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Alternatives — 2-column grid */}
      {result.alternatives.length > 0 && (
        <div className="bg-white px-5 py-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
            Consider these instead
          </p>
          <div className="grid grid-cols-2 gap-2">
            {result.alternatives.map((alt) => (
              <AlternativeCard
                key={alt.location}
                alt={alt}
                onSelect={onSelectAlternative}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/** Flies the Leaflet map to a new location whenever `result` changes. */
function MapController({ result }) {
  const map = useMap();
  useEffect(() => {
    if (result?.lat && result?.lng) {
      map.flyTo([result.lat, result.lng], 9, { duration: 1.4 });
    }
  }, [result, map]);
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SiteAnalyser({ token, onLoginRequest }) {
  const [location, setLocation]           = useState("");
  const [size, setSize]                   = useState("small");
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);
  const [error, setError]                 = useState("");
  const [suggestions, setSuggestions]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [areas, setAreas]                 = useState([]);
  const debounceRef = useRef(null);

  // Fetch curated areas for the map
  useEffect(() => {
    if (!token) return;
    fetch("/api/risk-map")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAreas(data); })
      .catch(() => {});
  }, [token]);

  const runAnalysis = async (loc, sz) => {
    if (!loc.trim()) return;
    if (!token) { onLoginRequest?.(); return; }
    setLoading(true);
    setError("");
    setResult(null);
    setLocation(loc);

    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ location: loc.trim(), size: sz }),
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

  const handleSubmit = (e) => {
    e.preventDefault();
    runAnalysis(location.trim(), size);
  };

  const handleLocationChange = (e) => {
    const val = e.target.value;
    setLocation(val);
    setResult(null);
    setError("");
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/location-search?q=${encodeURIComponent(val.trim())}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch { /* silently ignore */ }
    }, 350);
  };

  const selectSuggestion = (s) => {
    setLocation(s.canonical);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const analysedColors = result ? (VERDICT_COLORS[result.verdict] || VERDICT_COLORS["SAFE TO BUILD"]) : null;

  return (
    <section id="analyser" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* Section header */}
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
            Enter any US location — city, zip code, suburb, or address.
            Results appear alongside the risk map for full spatial context.
          </p>
        </motion.div>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── LEFT: form + results ── */}
          <div className="flex flex-col gap-5">

            {/* Form card */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-6 shadow-sm">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="analyser-location"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <input
                      id="analyser-location"
                      type="text"
                      value={location}
                      onChange={handleLocationChange}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="City, zip code, suburb or address…"
                      autoComplete="off"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                    <AnimatePresence>
                      {showSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                        >
                          {suggestions.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onMouseDown={() => selectSuggestion(s)}
                              className="w-full text-left px-4 py-3 hover:bg-sky-50 transition-colors border-b border-gray-50 last:border-0"
                            >
                              <div className="text-sm font-medium text-gray-800">{s.canonical}</div>
                              <div className="text-xs text-gray-400 truncate mt-0.5">{s.display}</div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <label htmlFor="analyser-size"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Data Centre Size
                  </label>
                  <select
                    id="analyser-size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                  >
                    <option value="small">Small — 10 MW</option>
                    <option value="medium">Medium — 50 MW</option>
                    <option value="large">Large — 100 MW+</option>
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
                      Analysing…
                    </>
                  ) : (
                    !token ? (
                      <><Lock size={14} /> Sign In to Analyse</>
                    ) : (
                      <><MapPin size={14} /> Analyse Site</>
                    )
                  )}
                </button>

                {/* Example searches */}
                <div>
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

            {/* Results card — animated in below the form */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-gray-100 bg-white flex items-center justify-center py-14"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-sky-400 rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Analysing site risks…</p>
                  </div>
                </motion.div>
              ) : result ? (
                <ResultsCard
                  key="result"
                  result={result}
                  onReset={() => { setResult(null); setLocation(""); }}
                  onSelectAlternative={(loc) => runAnalysis(loc, size)}
                  token={token}
                />
              ) : null}
            </AnimatePresence>
          </div>

          {/* ── RIGHT: map (sticky) ── */}
          <div className="lg:sticky lg:top-24 self-start flex flex-col gap-3">
            {/* Map heading */}
            <div>
              <p className="text-sm font-semibold" style={{ color: PRIMARY }}>
                US Risk Map
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {token
                  ? "Click any marker to analyse · Map updates with each result"
                  : "Sign in to explore the interactive risk map"}
              </p>
            </div>

            {/* Map container */}
            <div
              className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg relative"
              style={{ height: 500 }}
            >
              {!token ? (
                /* Locked state */
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center px-8">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: "rgba(30,58,95,0.08)" }}
                    >
                      <Lock size={20} style={{ color: PRIMARY }} />
                    </div>
                    <p className="text-sm font-semibold mb-1" style={{ color: PRIMARY }}>
                      Sign in to view map
                    </p>
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                      The interactive risk map is available to Terrascope subscribers.
                    </p>
                    <button
                      onClick={onLoginRequest}
                      className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={[37.5, -95]}
                  zoom={4}
                  style={{ width: "100%", height: "100%" }}
                  scrollWheelZoom={false}
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapController result={result} />

                  {/* Curated area markers */}
                  {areas.map((area) => {
                    const colors     = VERDICT_COLORS[area.verdict] || VERDICT_COLORS["SAFE TO BUILD"];
                    const isAnalysed = result &&
                      area.location.toLowerCase() === result.location.toLowerCase();
                    return (
                      <CircleMarker
                        key={area.location}
                        center={[area.lat, area.lng]}
                        radius={isAnalysed ? 14 : 9}
                        pathOptions={{
                          color:       isAnalysed ? "#ffffff" : colors.stroke,
                          fillColor:   colors.fill,
                          fillOpacity: isAnalysed ? 1 : 0.8,
                          weight:      isAnalysed ? 3 : 2,
                        }}
                        eventHandlers={{ click: () => runAnalysis(area.location, size) }}
                      >
                        <Popup>
                          <div className="text-sm min-w-[170px]">
                            <p className="font-bold text-base mb-0.5" style={{ color: PRIMARY }}>
                              {area.location}
                            </p>
                            <p className="text-gray-500 text-xs mb-2">{area.metro}</p>
                            <div
                              className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white mb-2"
                              style={{ backgroundColor: colors.fill }}
                            >
                              {area.verdict}
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-xs text-gray-500 mb-3">
                              <div><span className="block font-semibold text-gray-700">{area.scores.water}</span>Water</div>
                              <div><span className="block font-semibold text-gray-700">{area.scores.energy}</span>Energy</div>
                              <div><span className="block font-semibold text-gray-700">{area.scores.community}</span>Community</div>
                            </div>
                            <button
                              onClick={() => runAnalysis(area.location, size)}
                              className="w-full text-center text-xs font-semibold py-1.5 rounded-lg text-white hover:opacity-90"
                              style={{ backgroundColor: PRIMARY }}
                            >
                              Analyse this site →
                            </button>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}

                  {/* Analysed location pin — only when NOT in curated areas */}
                  {result?.lat && result?.lng &&
                    !areas.some((a) => a.location.toLowerCase() === result.location.toLowerCase()) && (
                    <>
                      <CircleMarker
                        center={[result.lat, result.lng]}
                        radius={20}
                        pathOptions={{
                          color: analysedColors?.fill, fillColor: analysedColors?.fill,
                          fillOpacity: 0.15, weight: 1.5,
                        }}
                        interactive={false}
                      />
                      <CircleMarker
                        center={[result.lat, result.lng]}
                        radius={12}
                        pathOptions={{
                          color: "#ffffff", fillColor: analysedColors?.fill,
                          fillOpacity: 1, weight: 3,
                        }}
                      >
                        <Popup>
                          <div className="text-sm min-w-[160px]">
                            <p className="font-bold text-base mb-0.5" style={{ color: PRIMARY }}>
                              {result.location}
                            </p>
                            <p className="text-xs text-gray-400 mb-2">Your analysed site</p>
                            <div
                              className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white"
                              style={{ backgroundColor: analysedColors?.fill }}
                            >
                              {result.verdict}
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    </>
                  )}
                </MapContainer>
              )}

              {/* Map legend (only when token) */}
              {token && (
                <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-md px-3 py-2.5 flex flex-col gap-1.5">
                  {MAP_LEGEND.map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-xs text-gray-600">{label}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 mt-0.5 pt-1.5 flex items-center gap-1.5">
                    <MousePointer2 size={10} className="text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-400">Click to analyse</span>
                  </div>
                </div>
              )}

              {/* Active result badge */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-md px-3 py-2 flex items-center gap-2 max-w-[200px]"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: analysedColors?.fill }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{result.location}</p>
                    <p className="text-xs font-bold" style={{ color: analysedColors?.fill }}>
                      {result.verdict}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Metro summary chips */}
            {areas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {[...new Set(areas.map((a) => a.metro))].map((metro) => {
                  const metroAreas = areas.filter((a) => a.metro === metro);
                  const safe = metroAreas.filter((a) => a.verdict === "SAFE TO BUILD").length;
                  return (
                    <div
                      key={metro}
                      className="px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm flex items-center gap-1.5"
                    >
                      <span className="text-xs font-semibold" style={{ color: PRIMARY }}>{metro}</span>
                      <span className="text-xs text-gray-400">{safe}/{metroAreas.length} safe</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
