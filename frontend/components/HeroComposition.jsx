import { useCurrentFrame, interpolate, AbsoluteFill } from "remotion";

const PRIMARY = "#1E3A5F";
const ACCENT = "#38BDF8";

function RiskBar({ label, score, maxScore = 100, color, frame, startFrame }) {
  const progress = interpolate(frame, [startFrame, startFrame + 60], [0, score], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [startFrame - 10, startFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const getRiskLabel = (s) => {
    if (s < 40) return { text: "LOW RISK", col: "#10B981" };
    if (s < 70) return { text: "MEDIUM", col: "#F59E0B" };
    return { text: "HIGH RISK", col: "#EF4444" };
  };

  const risk = getRiskLabel(score);

  return (
    <div style={{ opacity, marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <span style={{ color: "#CBD5E1", fontSize: 13, fontWeight: 500 }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: risk.col,
              backgroundColor: risk.col + "22",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            {risk.text}
          </span>
          <span style={{ color: "#94A3B8", fontSize: 13 }}>{Math.round(progress)}</span>
        </div>
      </div>
      <div
        style={{
          height: 8,
          backgroundColor: "rgba(255,255,255,0.08)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(progress / maxScore) * 100}%`,
            backgroundColor: color,
            borderRadius: 4,
            transition: "width 0.1s",
          }}
        />
      </div>
    </div>
  );
}

export function HeroComposition() {
  const frame = useCurrentFrame();

  const cardOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(frame, [0, 20], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Verdict appears at frame 130
  const verdictOpacity = interpolate(frame, [130, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const verdictScale = interpolate(frame, [130, 150], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(145deg, #0A1628 0%, #0F2040 100%)",
        padding: 32,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          opacity: cardOpacity,
          transform: `translateY(${cardY}px)`,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: ACCENT,
              marginBottom: 6,
            }}
          >
            SITE RISK ANALYSIS
          </div>
          <div style={{ color: "#F1F5F9", fontSize: 20, fontWeight: 700 }}>
            Ashburn, VA — Campus Site C
          </div>
          <div style={{ color: "#64748B", fontSize: 12, marginTop: 4 }}>
            39.0438° N, 77.4874° W · 12.4 ha · Industrial zone
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.06)",
            marginBottom: 16,
          }}
        />

        {/* Risk bars */}
        <div style={{ flex: 1 }}>
          <RiskBar
            label="Water & Cooling"
            score={35}
            color="#10B981"
            frame={frame}
            startFrame={30}
          />
          <RiskBar
            label="Energy Grid"
            score={58}
            color="#F59E0B"
            frame={frame}
            startFrame={55}
          />
          <RiskBar
            label="Community & Political"
            score={22}
            color="#10B981"
            frame={frame}
            startFrame={80}
          />
        </div>

        {/* Verdict */}
        <div
          style={{
            opacity: verdictOpacity,
            transform: `scale(${verdictScale})`,
            marginTop: 20,
            padding: "14px 20px",
            borderRadius: 10,
            backgroundColor: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#fff",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            ✓
          </div>
          <div>
            <div style={{ color: "#10B981", fontSize: 13, fontWeight: 700 }}>
              SAFE TO BUILD
            </div>
            <div style={{ color: "#94A3B8", fontSize: 11 }}>
              Low risk across all 3 dimensions
            </div>
          </div>
        </div>

        {/* Powered by */}
        <div
          style={{
            marginTop: 16,
            textAlign: "right",
            color: "#334155",
            fontSize: 10,
            letterSpacing: "0.05em",
          }}
        >
          powered by Terrascope AI
        </div>
      </div>
    </AbsoluteFill>
  );
}
