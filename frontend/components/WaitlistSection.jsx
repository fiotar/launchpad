import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Share2, Twitter, Linkedin, Link, CheckCircle } from "lucide-react";

const PRIMARY = "#1E3A5F";
const ACCENT = "#38BDF8";

function ConfettiPiece({ x, color, delay }) {
  return (
    <motion.div
      initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
      animate={{ y: 120, x: x, opacity: 0, scale: 0.5, rotate: 360 }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        width: 8,
        height: 8,
        borderRadius: 2,
        backgroundColor: color,
      }}
    />
  );
}

function SuccessState({ position }) {
  const confettiColors = [ACCENT, "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#fff"];
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    x: (Math.random() - 0.5) * 300,
    color: confettiColors[i % confettiColors.length],
    delay: Math.random() * 0.4,
  }));

  const shareText = `I just joined the waitlist for Terrascope — the location intelligence layer for data centre developers.`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center relative"
    >
      {/* Confetti */}
      <div style={{ position: "relative", height: 0 }}>
        {pieces.map((p, i) => (
          <ConfettiPiece key={i} {...p} />
        ))}
      </div>

      <CheckCircle size={56} className="mx-auto mb-4" style={{ color: "#10B981" }} />
      <h3 className="text-2xl font-bold mb-2" style={{ color: PRIMARY }}>
        You're on the list!
      </h3>
      <p className="text-gray-500 mb-2">
        You're{" "}
        <span className="font-bold" style={{ color: PRIMARY }}>
          #{position}
        </span>{" "}
        on the Terrascope waitlist.
      </p>
      <p className="text-sm text-gray-400 mb-8">
        We'll email you as soon as your account is ready.
      </p>

      <div
        className="p-5 rounded-xl border border-gray-100 bg-gray-50 text-left"
        style={{ maxWidth: 380, margin: "0 auto" }}
      >
        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Share2 size={14} /> Move up the list by sharing
        </p>
        <div className="flex gap-3">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#1DA1F2" }}
          >
            <Twitter size={14} /> Twitter/X
          </a>
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#0A66C2" }}
          >
            <Linkedin size={14} /> LinkedIn
          </a>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Link size={14} /> {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("");
  const [emailError, setEmailError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState(null);
  const [count, setCount] = useState(null);

  useEffect(() => {
    fetch("/api/waitlist/count")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, []);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, interest: interest || undefined }),
      });
      const data = await res.json();

      if (res.ok) {
        setPosition(data.position);
        setSubmitted(true);
        setCount((c) => (c !== null ? c + 1 : 1));
      } else if (res.status === 409) {
        setServerError("Looks like you're already on the list!");
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="py-24 bg-white">
      <div className="max-w-xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {submitted ? (
            <SuccessState key="success" position={position} />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-8">
                <MapPin size={40} className="mx-auto mb-4" style={{ color: ACCENT }} />
                <h2 className="text-3xl font-bold mb-3" style={{ color: PRIMARY }}>
                  Join the Waitlist
                </h2>
                {count !== null && (
                  <p className="text-gray-500 text-sm">
                    Join{" "}
                    <span className="font-semibold" style={{ color: PRIMARY }}>
                      {count}+
                    </span>{" "}
                    others on the waitlist
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                {/* Email */}
                <div>
                  <label
                    htmlFor="waitlist-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="waitlist-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    placeholder="you@company.com"
                    className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
                      emailError ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-sky-200"
                    }`}
                  />
                  {emailError && (
                    <p className="mt-1 text-xs text-red-500">{emailError}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="waitlist-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    id="waitlist-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                {/* Interest dropdown */}
                <div>
                  <label
                    htmlFor="waitlist-interest"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    What excites you most?{" "}
                    <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <select
                    id="waitlist-interest"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                  >
                    <option value="">Select an option...</option>
                    <option value="water">Water &amp; Cooling Risk Analysis</option>
                    <option value="energy">Energy Grid Intelligence</option>
                    <option value="community">Community &amp; Political Risk</option>
                  </select>
                </div>

                {serverError && (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: PRIMARY }}
                >
                  {loading ? "Joining..." : "Join Waitlist"}
                </button>

                <p className="text-center text-xs text-gray-400">
                  We'll only use your email to notify you when we launch. No spam,
                  unsubscribe anytime.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
