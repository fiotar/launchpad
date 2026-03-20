import { useState, useEffect, useRef } from "react";
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
  MapPin,
  CheckCircle,
} from "lucide-react";
import { HeroComposition } from "./components/HeroComposition";
import { HowItWorksComposition } from "./components/HowItWorksComposition";
import WaitlistSection from "./components/WaitlistSection";
import SiteAnalyser from "./components/SiteAnalyser";
import LoginModal from "./components/LoginModal";


const PRIMARY = "#1E3A5F";
const ACCENT = "#38BDF8";

const NAV_LINKS = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How It Works" },
  { id: "analyser", label: "Try It" },
  { id: "about", label: "About" },
  { id: "waitlist", label: "Waitlist" },
];

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const HOW_IT_WORKS_STEPS = [
  {
    number: 1,
    icon: <MapPin size={32} />,
    title: "Input your candidate sites",
    description:
      "Enter any US location — a city, zip code, suburb, or address. Terrascope accepts anything from a single site to a portfolio of 100+ locations, and resolves each one to precise coordinates automatically.",
  },
  {
    number: 2,
    icon: <Zap size={32} />,
    title: "We analyse every risk dimension",
    description:
      "Our models cross-reference real water stress data, grid interconnection queues, and community sentiment signals — simultaneously, for every site. No manual research. No waiting.",
  },
  {
    number: 3,
    icon: <CheckCircle size={32} />,
    title: "Get ranked, actionable recommendations",
    description:
      "Receive a risk-ranked result with scores, red flags, reasoning, and alternative sites for each dimension. Share with your team and move to the next phase with confidence.",
  },
];

function HowItWorksCarousel() {
  const [active, setActive] = useState(0);
  const prev = () => setActive((i) => (i + 2) % 3);
  const next = () => setActive((i) => (i + 1) % 3);
  const step = HOW_IT_WORKS_STEPS[active];

  return (
    <div className="flex items-center gap-4 md:gap-8">
      {/* Prev button */}
      <button
        onClick={prev}
        aria-label="Previous step"
        className="shrink-0 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{ borderColor: PRIMARY, color: PRIMARY, backgroundColor: "white" }}
      >
        <ChevronDown size={20} className="rotate-90" />
      </button>

      {/* Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="flex-1 rounded-2xl px-10 py-12 text-center"
          style={{ background: `linear-gradient(145deg, #0A1628 0%, #0F2040 100%)` }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-5" style={{ color: ACCENT }}>
            {step.icon}
          </div>

          {/* Text */}
          <h3 className="text-xl font-bold mb-4 text-white">{step.title}</h3>
          <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "#94A3B8" }}>
            {step.description}
          </p>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {HOW_IT_WORKS_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === active ? 24 : 8,
                  height: 8,
                  backgroundColor: i === active ? ACCENT : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
      <button
        onClick={next}
        aria-label="Next step"
        className="shrink-0 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{ borderColor: PRIMARY, color: PRIMARY, backgroundColor: "white" }}
      >
        <ChevronDown size={20} className="-rotate-90" />
      </button>
    </div>
  );
}

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("terrascope_token") || "");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    setShowLogin(false);
    setTimeout(() => scrollTo("analyser"), 300);
  };

  const handleLogout = () => {
    fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    localStorage.removeItem("terrascope_token");
    setToken("");
  };

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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="44" height="44">
            <ellipse cx="50" cy="58" rx="42" ry="18" fill="none" stroke={scrolled ? "#1E3A5F" : "#fff"} strokeWidth="2.5"/>
            <ellipse cx="50" cy="50" rx="30" ry="13" fill="none" stroke={scrolled ? "#1E3A5F" : "#fff"} strokeWidth="2.5"/>
            <ellipse cx="50" cy="43" rx="19" ry="8" fill="none" stroke={scrolled ? "#1E3A5F" : "#fff"} strokeWidth="2.5"/>
            <ellipse cx="50" cy="37" rx="10" ry="4.5" fill="none" stroke="#38BDF8" strokeWidth="2.5"/>
            <ellipse cx="50" cy="32" rx="4" ry="2" fill="#38BDF8"/>
          </svg>

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
            {token ? (
              <button
                onClick={handleLogout}
                className="hidden md:block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
                style={{ borderColor: scrolled ? "#CBD5E1" : "rgba(255,255,255,0.3)", color: scrolled ? "#64748B" : "rgba(255,255,255,0.7)" }}
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="hidden md:block px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: ACCENT, color: PRIMARY }}
              >
                Sign In
              </button>
            )}

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
                {token ? (
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="mt-2 py-3 px-4 rounded-lg text-sm font-semibold text-center border border-gray-200 text-gray-600"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowLogin(true); setMobileOpen(false); }}
                    className="mt-2 py-3 px-4 rounded-lg text-sm font-semibold text-center"
                    style={{ backgroundColor: ACCENT, color: PRIMARY }}
                  >
                    Sign In
                  </button>
                )}
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
            backgroundImage: `linear-gradient(135deg, rgba(30,58,95,0.93) 0%, rgba(15,32,64,0.93) 50%, rgba(26,53,84,0.96) 100%), url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
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
                    "Understand community needs before you build. Terrascope surfaces local sentiment, planning dynamics, and engagement opportunities — so developers can design projects that create shared value and build lasting trust with the communities that host them.",
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
              <HowItWorksCarousel />
            </div>
          </div>
        </section>

        {/* ── SITE ANALYSER + MAP ── */}
        <SiteAnalyser token={token} onLoginRequest={() => setShowLogin(true)} />

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
                    "We lost 14 months on a Northern Virginia site because of a grid interconnection queue we didn't know existed. Terrascope would have flagged it on day one.",
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

        {/* ── ABOUT US ── */}
        <section id="about" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: story */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
                  style={{ backgroundColor: "rgba(56,189,248,0.1)", color: ACCENT }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  About Terrascope
                </div>
                <h2 className="text-4xl font-bold mb-6 leading-tight" style={{ color: PRIMARY }}>
                  We've seen what bad site selection costs
                </h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  A $400M campus stalled for three years over a grid interconnection
                  queue nobody modelled. A 200-acre site abandoned after a community
                  opposition campaign that took 18 months to organise. Water rights
                  disputes that surfaced during due diligence — after the land was
                  under contract.
                </p>
                <p className="text-gray-500 leading-relaxed mb-8">
                  We built Terrascope because the data to avoid all of this exists —
                  it's just scattered across dozens of regulatory bodies, utility
                  filings, and planning archives. We bring it together, score it, and
                  surface it in seconds.
                </p>
                <div className="flex flex-wrap gap-6 mb-10">
                  {[
                    { value: "$64B+", label: "in failed site investments we've studied" },
                    { value: "15+", label: "markets covered across the US" },
                    { value: "3 sec", label: "from input to risk score" },
                  ].map(({ value, label }) => (
                    <div key={value}>
                      <div className="text-2xl font-bold" style={{ color: PRIMARY }}>{value}</div>
                      <div className="text-xs text-gray-400 mt-0.5 max-w-[120px]">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Our Values */}
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  Our Values
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      title: "Responsible placement",
                      body: "We believe data centres should be built where communities, resources, and infrastructure can genuinely support them.",
                    },
                    {
                      title: "Trust through transparency",
                      body: "We show our working. Every risk score comes with the reasoning behind it.",
                    },
                    {
                      title: "Rigour in everything",
                      body: "Our intelligence is only as valuable as its accuracy. We hold ourselves to the highest standard of evidence.",
                    },
                  ].map(({ title, body }) => (
                    <div
                      key={title}
                      className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4"
                    >
                      <p className="text-sm font-semibold mb-1" style={{ color: PRIMARY }}>{title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right: team */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="flex flex-col gap-5"
              >
                {[
                  {
                    name: "Fiola Tariang",
                    role: "Co-founder",
                    initials: "FT",
                  },
                  {
                    name: "Aishani Grover",
                    role: "Co-founder",
                    initials: "AG",
                  },
                  {
                    name: "Sherwin Stanley Isaac",
                    role: "Co-founder",
                    initials: "SS",
                  },
                  {
                    name: "Edgar Khieu",
                    role: "Co-founder",
                    initials: "EK",
                  },
                  {
                    name: "Tayyab Rana",
                    role: "Co-founder",
                    initials: "TR",
                  },
                ].map(({ name, role, initials }, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #2563EB 100%)` }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: PRIMARY }}>{name}</p>
                      <p className="text-xs font-medium" style={{ color: ACCENT }}>{role}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section
          className="py-24"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(30,58,95,0.92) 0%, rgba(15,32,64,0.95) 100%), url('https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1920&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
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

      {/* ── LOGIN MODAL ── */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* ── FOOTER ── */}
      <footer className="py-12 border-t border-gray-100" style={{ backgroundColor: "#FAFAFA" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="28" height="28">
                <ellipse cx="50" cy="58" rx="42" ry="18" fill="none" stroke="#1E3A5F" strokeWidth="2.5"/>
                <ellipse cx="50" cy="50" rx="30" ry="13" fill="none" stroke="#1E3A5F" strokeWidth="2.5"/>
                <ellipse cx="50" cy="43" rx="19" ry="8" fill="none" stroke="#1E3A5F" strokeWidth="2.5"/>
                <ellipse cx="50" cy="37" rx="10" ry="4.5" fill="none" stroke="#38BDF8" strokeWidth="2.5"/>
                <ellipse cx="50" cy="32" rx="4" ry="2" fill="#38BDF8"/>
              </svg>
              <span className="text-lg font-bold" style={{ color: PRIMARY }}>Terrascope</span>
            </div>
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
