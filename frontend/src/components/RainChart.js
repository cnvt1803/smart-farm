import React from "react";

/** Config mức mưa + màu */
const rainLevels = [
  { level: 1, key: "no",       label: "No Rain",    range: [3500, Infinity], desc: "Surface completely dry",  from: "#cbd5e1", to: "#94a3b8" },
  { level: 2, key: "vlight",   label: "Very Light", range: [3000, 3500],    desc: "Slightly damp",          from: "#93c5fd", to: "#60a5fa" },
  { level: 3, key: "light",    label: "Light Rain", range: [2000, 3000],    desc: "Some water accumulation",from: "#60a5fa", to: "#3b82f6" },
  { level: 4, key: "moderate", label: "Moderate",   range: [1000, 2000],    desc: "Surface mostly wet",     from: "#38bdf8", to: "#0ea5e9" },
  { level: 5, key: "heavy",    label: "Heavy Rain", range: [0, 1000],       desc: "Flooded surface",        from: "#818cf8", to: "#4f46e5" },
];

const heights = { 1: 36, 2: 64, 3: 92, 4: 124, 5: 156 }; // px

const getRainLevel = (v) => {
  if (v == null || Number.isNaN(v)) return null;
  return rainLevels.find((lv) => v >= lv.range[0] && v < lv.range[1]) || null;
};

// tạo màu rgba mềm từ hex
const soft = (hex, a = 0.14) => {
  if (!hex) return `rgba(241,245,249,${a})`;
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export default function RainLevelChart({ rainValue }) {
  const current = getRainLevel(rainValue);

  // Nền card tint theo level hiện tại
  const cardBg = current
    ? `linear-gradient(135deg, ${soft(current.from, 0.18)}, ${soft(current.to, 0.12)})`
    : `linear-gradient(135deg, ${soft("#f1f5f9", 0.7)}, ${soft("#f8fafc", 0.7)})`;

  const borderColor = current ? soft(current.to, 0.35) : "rgba(226,232,240,1)";
  const gridColor = "rgba(15,23,42,0.06)"; // đường kẻ rất nhạt

  return (
    <div
      className="shadow-sm p-5 rounded-2xl select-none border"
      style={{ background: cardBg, borderColor }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Rain level</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">Current</span>
          <span
            className="text-xs font-semibold px-2 py-1 rounded-lg"
            style={{
              background: current
                ? `linear-gradient(90deg, ${soft(current.from, 0.25)}, ${soft(current.to, 0.25)})`
                : "rgba(148,163,184,0.15)",
              color: "#0b1220",
            }}
          >
            {current ? current.label : "--"}
          </span>
        </div>
      </div>

      {/* Chart area */}
      <div className="relative">
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="border-t"
              style={{ borderColor: gridColor, position: "absolute", top: `${(i + 1) * 20}%`, left: 0, right: 0 }}
            />
          ))}
        </div>

        {/* Bars */}
        <div className="relative z-[1] flex justify-between items-end gap-4 h-48">
          {rainLevels.map((lv) => {
            const active = current?.level === lv.level;
            const h = heights[lv.level];

            return (
              <div key={lv.key} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className={`w-full max-w-[56px] transition-all duration-300 ease-out ${active ? "shadow" : ""}`}
                  style={{
                    height: h,
                    background: active
                      ? `linear-gradient(180deg, ${lv.from}, ${lv.to})`
                      : "rgba(226,232,240,1)",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    borderBottomLeftRadius: 6,
                    borderBottomRightRadius: 6,
                    outline: active ? "2px solid rgba(15,23,42,0.08)" : "1px solid rgba(226,232,240,1)",
                  }}
                  title={`${lv.label} — ${lv.desc}`}
                  role="img"
                  aria-label={lv.label}
                />
                <div className="mt-2 text-center text-[11px] text-slate-700 leading-tight">
                  {lv.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        {current ? (
          <div className="text-sm text-slate-800">
            <span className="font-semibold">{current.label}.</span> {current.desc}
          </div>
        ) : (
          <div className="text-sm text-slate-500">No data for rain sensor.</div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {rainLevels.map((lv) => (
          <div key={`legend-${lv.key}`} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: `linear-gradient(90deg, ${lv.from}, ${lv.to})` }}
            />
            <span className="text-xs text-slate-700">{lv.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
