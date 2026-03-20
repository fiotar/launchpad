import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import { Lock, MousePointer2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

const PRIMARY = "#1E3A5F";
const ACCENT = "#38BDF8";

const VERDICT_COLORS = {
  "SAFE TO BUILD":        { fill: "#10B981", stroke: "#059669" },
  "PROCEED WITH CAUTION": { fill: "#F59E0B", stroke: "#D97706" },
  "HIGH RISK":            { fill: "#EF4444", stroke: "#DC2626" },
};

const LEGEND = [
  { label: "Safe to Build",        color: "#10B981" },
  { label: "Proceed with Caution", color: "#F59E0B" },
  { label: "High Risk",            color: "#EF4444" },
];

/** Flies the map to a new target whenever `analysedResult` changes. */
function MapController({ analysedResult }) {
  const map = useMap();
  useEffect(() => {
    if (analysedResult?.lat && analysedResult?.lng) {
      map.flyTo([analysedResult.lat, analysedResult.lng], 9, { duration: 1.4 });
    }
  }, [analysedResult, map]);
  return null;
}

export default function USRiskMap({ token, onLoginRequest, analysedResult, onLocationSelect }) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch("/api/risk-map")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAreas(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const analysedColors = analysedResult
    ? (VERDICT_COLORS[analysedResult.verdict] || VERDICT_COLORS["SAFE TO BUILD"])
    : null;

  return (
    <section id="risk-map" className="py-24 bg-gray-50 relative">
      {/* Auth overlay */}
      {!token && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ background: "rgba(249,250,251,0.85)", backdropFilter: "blur(6px)" }}
        >
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
              Premium feature
            </h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              The interactive risk map is available to Terrascope subscribers.
              Sign in to explore site risk across all US markets.
            </p>
            <button
              onClick={onLoginRequest}
              className="px-8 py-3 rounded-lg font-semibold text-white text-sm transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: PRIMARY }}
            >
              Sign In to View Map
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
            Live Risk Intelligence
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: PRIMARY }}>
            US Data Centre Risk Map
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Top data centre markets across the US — colour-coded by risk profile.{" "}
            <span className="font-medium" style={{ color: PRIMARY }}>
              Click any marker to analyse that location.
            </span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative"
          style={{ height: 480 }}
        >
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-sky-400 rounded-full animate-spin" />
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

              {/* Controller: flies map when analysis result changes */}
              <MapController analysedResult={analysedResult} />

              {/* Curated area markers — clickable */}
              {areas.map((area) => {
                const colors = VERDICT_COLORS[area.verdict] || VERDICT_COLORS["SAFE TO BUILD"];
                const isAnalysed =
                  analysedResult &&
                  area.location.toLowerCase() === analysedResult.location.toLowerCase();
                return (
                  <CircleMarker
                    key={area.location}
                    center={[area.lat, area.lng]}
                    radius={isAnalysed ? 14 : 10}
                    pathOptions={{
                      color: isAnalysed ? "#ffffff" : colors.stroke,
                      fillColor: colors.fill,
                      fillOpacity: isAnalysed ? 1 : 0.8,
                      weight: isAnalysed ? 3 : 2,
                    }}
                    eventHandlers={{
                      click: () => onLocationSelect?.(area.location),
                    }}
                  >
                    <Popup>
                      <div className="text-sm min-w-[180px]">
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
                        <div className="mt-1 grid grid-cols-3 gap-1 text-xs text-gray-500 mb-3">
                          <div>
                            <span className="block font-semibold text-gray-700">{area.scores.water}</span>
                            Water
                          </div>
                          <div>
                            <span className="block font-semibold text-gray-700">{area.scores.energy}</span>
                            Energy
                          </div>
                          <div>
                            <span className="block font-semibold text-gray-700">{area.scores.community}</span>
                            Community
                          </div>
                        </div>
                        <button
                          onClick={() => onLocationSelect?.(area.location)}
                          className="w-full text-center text-xs font-semibold py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: PRIMARY }}
                        >
                          Analyse this site →
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* Analysed location pin — shown when result is for a location NOT in curated areas */}
              {analysedResult?.lat && analysedResult?.lng &&
                !areas.some((a) => a.location.toLowerCase() === analysedResult.location.toLowerCase()) && (
                <>
                  {/* Outer glow ring */}
                  <CircleMarker
                    center={[analysedResult.lat, analysedResult.lng]}
                    radius={20}
                    pathOptions={{
                      color: analysedColors?.fill || "#38BDF8",
                      fillColor: analysedColors?.fill || "#38BDF8",
                      fillOpacity: 0.15,
                      weight: 1.5,
                    }}
                    interactive={false}
                  />
                  {/* Main pin */}
                  <CircleMarker
                    center={[analysedResult.lat, analysedResult.lng]}
                    radius={12}
                    pathOptions={{
                      color: "#ffffff",
                      fillColor: analysedColors?.fill || "#38BDF8",
                      fillOpacity: 1,
                      weight: 3,
                    }}
                  >
                    <Popup>
                      <div className="text-sm min-w-[180px]">
                        <p className="font-bold text-base mb-0.5" style={{ color: PRIMARY }}>
                          {analysedResult.location}
                        </p>
                        <p className="text-xs text-gray-400 mb-2">Your analysed site</p>
                        <div
                          className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white mb-2"
                          style={{ backgroundColor: analysedColors?.fill }}
                        >
                          {analysedResult.verdict}
                        </div>
                        <div className="mt-1 grid grid-cols-3 gap-1 text-xs text-gray-500">
                          <div>
                            <span className="block font-semibold text-gray-700">
                              {analysedResult.scores.water}
                            </span>
                            Water
                          </div>
                          <div>
                            <span className="block font-semibold text-gray-700">
                              {analysedResult.scores.energy}
                            </span>
                            Energy
                          </div>
                          <div>
                            <span className="block font-semibold text-gray-700">
                              {analysedResult.scores.community}
                            </span>
                            Community
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                </>
              )}
            </MapContainer>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-md px-4 py-3 flex flex-col gap-2">
            {LEGEND.map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1 flex items-center gap-2">
              <MousePointer2 size={11} className="text-gray-400 shrink-0" />
              <span className="text-xs text-gray-400">Click marker to analyse</span>
            </div>
          </div>

          {/* Active analysis badge */}
          {analysedResult && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-md px-4 py-2.5 flex items-center gap-2.5 max-w-[220px]"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: analysedColors?.fill }}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">{analysedResult.location}</p>
                <p className="text-xs font-bold" style={{ color: analysedColors?.fill }}>
                  {analysedResult.verdict}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Metro summary */}
        {areas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6 flex flex-wrap justify-center gap-3"
          >
            {[...new Set(areas.map((a) => a.metro))].map((metro) => {
              const metroAreas = areas.filter((a) => a.metro === metro);
              const safe = metroAreas.filter((a) => a.verdict === "SAFE TO BUILD").length;
              return (
                <div
                  key={metro}
                  className="px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm flex items-center gap-2"
                >
                  <span className="text-xs font-semibold" style={{ color: PRIMARY }}>{metro}</span>
                  <span className="text-xs text-gray-400">{safe}/{metroAreas.length} safe</span>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
