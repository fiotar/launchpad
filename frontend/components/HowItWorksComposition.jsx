import { useCurrentFrame, interpolate, AbsoluteFill, Sequence } from "remotion";

const PRIMARY = "#1E3A5F";
const ACCENT = "#38BDF8";

// Each step gets 100 frames: 80 visible + 20 transition
// Total: 300 frames
const STEP_DURATION = 100;
const FADE_DURATION = 20;

function Step({ number, icon, title, description, frame, inFrame, outFrame }) {
  const opacity = interpolate(
    frame,
    [inFrame, inFrame + FADE_DURATION, outFrame - FADE_DURATION, outFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const y = interpolate(frame, [inFrame, inFrame + FADE_DURATION], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Progress bar fills during the step
  const barProgress = interpolate(frame, [inFrame + 20, outFrame - 20], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 60px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Step number */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: `2px solid ${ACCENT}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ACCENT,
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        {number}
      </div>

      {/* Icon */}
      <div style={{ fontSize: 40, marginBottom: 16 }}>{icon}</div>

      {/* Text */}
      <h3
        style={{
          color: "#F1F5F9",
          fontSize: 22,
          fontWeight: 700,
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "#94A3B8",
          fontSize: 14,
          textAlign: "center",
          lineHeight: 1.6,
          maxWidth: 420,
          marginBottom: 28,
        }}
      >
        {description}
      </p>

      {/* Progress bar */}
      <div
        style={{
          width: 200,
          height: 3,
          backgroundColor: "rgba(255,255,255,0.08)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${barProgress}%`,
            backgroundColor: ACCENT,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Step indicators */}
      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            style={{
              width: n === number ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: n === number ? ACCENT : "rgba(255,255,255,0.15)",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function HowItWorksComposition() {
  const frame = useCurrentFrame();

  const steps = [
    {
      number: 1,
      icon: "📍",
      title: "Input your candidate sites",
      description:
        "Upload a list of site coordinates or addresses. Terrascope accepts anything from a single postcode to a portfolio of 100+ locations.",
      inFrame: 0,
      outFrame: STEP_DURATION,
    },
    {
      number: 2,
      icon: "⚡",
      title: "AI analyses every risk dimension",
      description:
        "Our models cross-reference water stress data, grid interconnection queues, and community sentiment signals — simultaneously, for every site.",
      inFrame: STEP_DURATION,
      outFrame: STEP_DURATION * 2,
    },
    {
      number: 3,
      icon: "✅",
      title: "Get ranked, actionable recommendations",
      description:
        "Receive a risk-ranked shortlist with scores and red flags for each dimension. Share with your team and move to the next phase with confidence.",
      inFrame: STEP_DURATION * 2,
      outFrame: STEP_DURATION * 3,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(145deg, #0A1628 0%, #0F2040 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {steps.map((step) => (
        <Step key={step.number} {...step} frame={frame} />
      ))}
    </AbsoluteFill>
  );
}
