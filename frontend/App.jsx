import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@remotion/player";
import {
  Droplets,
  Zap,
  Users,
  ChevronDown,
  Quote,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { HeroComposition } from "./components/HeroComposition";
import { HowItWorksComposition } from "./components/HowItWorksComposition";
import WaitlistSection from "./components/WaitlistSection";
import SiteAnalyser from "./components/SiteAnalyser";

const PRIMARY = "#1E3A5F";
const ACCENT = "#38BDF8";

const NAV_LINKS = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How It Works" },
  { id: "analyser", label: "Try It" },
  { id: "waitlist", label: "Waitlist" },
];

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (id) => {
    scrollTo(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── NAVIGATION ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight" style={{ color: scrolled ? PRIMARY : "#fff" }}>
            Terrascope
          </span>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollTo("analyser")}
              className="hidden md:block px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: ACCENT, color: PRIMARY }}
            >
              Try the Analyser
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: scrolled ? PRIMARY : "#fff" }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-b border-gray-100 shadow-lg"
            >
              <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
                {NAV_LINKS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => handleNav(id)}
                    className="text-left py-3 px-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b border-gray-50 last:border-0"
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => handleNav("analyser")}
                  className="mt-2 py-3 px-4 rounded-lg text-sm font-semibold text-center"
                  style={{ backgroundColor: ACCENT, color: PRIMARY }}
                >
                  Try the Analyser
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* ── HERO ── */}
        <section
          className="min-h-screen flex items-center pt-16"
          style={{
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #0F2040 50%, #1A3554 100%)`,
          }}
        >
          <div className="max-w-6xl mx-auto px-6 py-24 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
                  style={{ backgroundColor: "rgba(56,189,248,0.15)", color: ACCENT }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Now in Early Access
                </div>
                <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                  Terrascope
                </h1>
                <p className="text-xl font-semibold mb-4" style={{ color: ACCENT }}>
                  The location intelligence layer for data centre developers
                </p>
                <p className="text-gray-300 text-lg leading-relaxed mb-10">
                  Know before you build. Terrascope surfaces water, energy grid,
                  and community risk at any candidate site — so you can screen
                  dozens of locations in hours, not months.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => scrollTo("analyser")}
                    className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: ACCENT, color: PRIMARY }}
                  >
                    Try the Analyser
                  </button>
                  <button
                    onClick={() => scrollTo("features")}
                    className="px-8 py-4 rounded-lg font-semibold border border-white/30 text-white hover:bg-white/10 transition-all duration-200 flex items-center gap-2"
                  >
                    Learn More <ChevronDown size={16} />
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="w-full"
              >
                {mounted && (
                  <Player
                    component={HeroComposition}
                    durationInFrames={180}
                    compositionWidth={540}
                    compositionHeight={360}
                    fps={30}
                    autoPlay
                    loop
                    controls={false}
                    acknowledgeRemotionLicense
                    style={{ width: "100%", borderRadius: 16 }}
                  />
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF BAR ── */}
        <section className="bg-gray-50 border-y border-gray-200 py-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { value: "$64B+", label: "in data centre projects blocked by avoidable site risks" },
                { value: "3 risk layers", label: "Water, energy & community — analysed in one platform" },
                { value: "3 seconds", label: "What used to take 3 months of consulting" },
              ].map(({ value, label }) => (
                <div key={value} className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold" style={{ color: PRIMARY }}>{value}</span>
                  <span className="text-sm text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4" style={{ color: PRIMARY }}>
                Three risks. One platform.
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                The three dimensions that kill data centre projects — now
                surfaced before you commit a single dollar to a site.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Droplets size={28} />,
                  title: "Water & Cooling Risk",
                  description:
                    "Hydrological stress scores, watershed availability, and cooling constraint flags for any candidate site. Know if the water is there before the planning begins.",
                  delay: 0,
                },
                {
                  icon: <Zap size={28} />,
                  title: "Energy Grid Intelligence",
                  description:
                    "Grid capacity, interconnection queue status, and renewable access — the number one constraint killing projects today. Terrascope shows you the queue before you join it.",
                  delay: 0.1,
                },
                {
                  icon: <Users size={28} />,
                  title: "Community & Political Risk",
                  description:
                    "Local opposition sentiment, planning ordinance exposure, and moratorium risk signals — before you engage planners. Avoid the communities that will fight you.",
                  delay: 0.2,
                },
              ].map(({ icon, title, description, delay }) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay }}
                  whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(30,58,95,0.12)" }}
                  className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm transition-all duration-200 cursor-default"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-5"
                    style={{ backgroundColor: "rgba(56,189,248,0.12)", color: ACCENT }}
                  >
                    {icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: PRIMARY }}>{title}</h3>
                  <p className="text-gray-500 leading-relaxed">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4" style={{ color: PRIMARY }}>
                How it works
              </h2>
              <p className="text-lg text-gray-500">
                From site list to risk-ranked decisions — in three steps.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              {mounted && (
                <Player
                  component={HowItWorksComposition}
                  durationInFrames={300}
                  compositionWidth={720}
                  compositionHeight={420}
                  fps={30}
                  autoPlay
                  loop
                  controls={false}
                  acknowledgeRemotionLicense
                  style={{ width: "100%", borderRadius: 16 }}
                />
              )}
            </div>
          </div>
        </section>

        {/* ── SITE ANALYSER ── */}
        <SiteAnalyser />

        {/* ── TESTIMONIALS ── */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4" style={{ color: PRIMARY }}>
                What developers say
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "We lost 14 months on a Frankfurt site because of a grid interconnection queue we didn't know existed. Terrascope would have flagged it on day one.",
                  name: "Marcus Teller",
                  role: "VP Development, EdgeCore Partners",
                },
                {
                  quote:
                    "Community opposition killed our Virginia project after 18 months of planning. The local data was always there — we just didn't have a tool to surface it.",
                  name: "Priya Nair",
                  role: "Head of Site Acquisition, Meridian Data",
                },
                {
                  quote:
                    "The ability to screen 40 sites in a single afternoon changes everything about how we do portfolio due diligence.",
                  name: "Jonas Braun",
                  role: "Director of Infrastructure, Nova Capital",
                },
              ].map(({ quote, name, role }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm"
                >
                  <Quote size={24} className="mb-4" style={{ color: ACCENT }} />
                  <p className="text-gray-700 leading-relaxed mb-6 italic">{quote}</p>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: PRIMARY }}>{name}</p>
                    <p className="text-gray-400 text-sm">{role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section
          className="py-24"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #0F2040 100%)` }}
        >
          <div className="max-w-3xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Stop losing money on the wrong sites
              </h2>
              <p className="text-gray-300 text-lg mb-10 leading-relaxed">
                Join the waitlist for early access to Terrascope — the platform
                that gives data centre developers an unfair advantage in site
                selection.
              </p>
              <button
                onClick={() => scrollTo("waitlist")}
                className="px-10 py-4 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
                style={{ backgroundColor: ACCENT, color: PRIMARY }}
              >
                Get Early Access <ArrowRight size={20} />
              </button>
            </motion.div>
          </div>
        </section>

        {/* ── WAITING LIST ── */}
        <WaitlistSection />
      </main>

      {/* ── FOOTER ── */}
      <footer className="py-12 border-t border-gray-100" style={{ backgroundColor: "#FAFAFA" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="text-lg font-bold" style={{ color: PRIMARY }}>Terrascope</span>
            <nav className="flex items-center gap-6 flex-wrap justify-center">
              {NAV_LINKS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {label}
                </button>
              ))}
            </nav>
            <span className="text-sm text-gray-400">
              © {new Date().getFullYear()} Terrascope. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
