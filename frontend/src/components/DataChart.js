import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  FaThermometerHalf,
  FaTint,
  FaCloudRain,
  FaSun,
  FaLeaf,
} from "react-icons/fa";

/* ================= Rain levels ================= */
const rainLevels = [
  { level: 1, label: "Không mưa",        range: [3500, Infinity], desc: "Bề mặt khô thoáng", colorFrom: "#cbd5e1", colorTo: "#94a3b8" },
  { level: 2, label: "Mưa rất nhẹ",     range: [3000, 3500],     desc: "Hơi ẩm",          colorFrom: "#93c5fd", colorTo: "#60a5fa" },
  { level: 3, label: "Mưa nhẹ",     range: [2000, 3000],     desc: "Có thể tích tụ nước",colorFrom: "#60a5fa", colorTo: "#3b82f6" },
  { level: 4, label: "Mưa vừa",       range: [1000, 2000],     desc: "Toàn bộ bề mặt ướt",     colorFrom: "#38bdf8", colorTo: "#0ea5e9" },
  { level: 5, label: "Mưa lớn",     range: [0, 1000],        desc: "Bề mặt ngập nước",        colorFrom: "#818cf8", colorTo: "#4f46e5" },
];
const getRainLevel = (v) =>
  rainLevels.find((lv) => v >= lv.range[0] && v < lv.range[1]) || rainLevels[0];

/* ================= Demo data (có Lux & Soil) ================= */
const sampleData = {
  Temperature: [
    { day: "Mon", value: 29 }, { day: "Tue", value: 30 }, { day: "Wed", value: 28 },
    { day: "Thu", value: 31 }, { day: "Fri", value: 37 }, { day: "Sat", value: 26 }, { day: "Sun", value: 30 },
  ],
  Humidity: [
    { day: "Mon", value: 70 }, { day: "Tue", value: 75 }, { day: "Wed", value: 80 },
    { day: "Thu", value: 78 }, { day: "Fri", value: 82 }, { day: "Sat", value: 79 }, { day: "Sun", value: 77 },
  ],
  Rainfall: [
    { day: "Mon", value: 1200 }, { day: "Tue", value: 560 }, { day: "Wed", value: 2550 },
    { day: "Thu", value: 3660 }, { day: "Fri", value: 3207 }, { day: "Sat", value: 800 }, { day: "Sun", value: 3300 },
  ],
  Lux: [
    { day: "Mon", value: 2000 }, { day: "Tue", value: 2500 }, { day: "Wed", value: 1800 },
    { day: "Thu", value: 3000 }, { day: "Fri", value: 2800 }, { day: "Sat", value: 2600 }, { day: "Sun", value: 2900 },
  ],
  Soil: [
    { day: "Mon", value: 45 }, { day: "Tue", value: 50 }, { day: "Wed", value: 48 },
    { day: "Thu", value: 55 }, { day: "Fri", value: 53 }, { day: "Sat", value: 52 }, { day: "Sun", value: 49 },
  ],
};

/* ================= UI tokens ================= */
const colorMap = {
  Temperature: "#ef4444", // red
  Humidity: "#3b82f6",    // blue
  Rainfall: "#8b5cf6",    // violet
  Lux: "#f59e0b",         // amber (
  Soil: "#10b981",        // emerald
};
const unitOf = (mode) =>
  mode === "Humidity" ? "%" :
  mode === "Temperature" ? "°C" :
  mode === "Soil" ? "%" :
  mode === "Lux" ? "lx" : "";

/* ================= Icons ================= */
const iconOf = {
  Temperature: <FaThermometerHalf className="text-base" />,
  Humidity: <FaTint className="text-base" />,
  Rainfall: <FaCloudRain className="text-base" />,
  Lux: <FaSun className="text-base" />,
  Soil: <FaLeaf className="text-base" />,
};

/* ================= Tooltip modern ================= */
function FancyTooltip({ active, payload, label, mode }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-xl bg-white px-3 py-2 shadow-sm border border-slate-100">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="flex items-baseline gap-1">
        <div className="text-lg font-semibold text-slate-900">{val}</div>
        <div className="text-xs text-slate-500">{unitOf(mode)}</div>
      </div>
    </div>
  );
}

/* ================= Component ================= */
export default function DataChart() {
  const [mode, setMode] = useState("Temperature");
  const data = sampleData[mode];

  const themeColor = colorMap[mode];
  const gradId = useMemo(() => `grad-${mode}`, [mode]);

  /* ---------- Rainfall custom bars (rounded + gradient + motion) ---------- */
  const renderRainBars = () => (
    <div className="px-2">
      <div className="relative h-64">
        {/* grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="border-t border-slate-100"
              style={{ position: "absolute", top: `${(i + 1) * 20}%`, left: 0, right: 0 }}
            />
          ))}
        </div>

        <div className="relative z-[1] flex items-end h-full gap-4">
          {sampleData.Rainfall.map((item, idx) => {
            const lv = getRainLevel(item.value);
            const heightPx = [0, 36, 64, 92, 124, 156][lv.level]; // 1..5
            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="h-[85%] flex items-end w-full justify-center">
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: heightPx, opacity: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.06 }}
                    className="w-10 sm:w-12 shadow-sm"
                    style={{
                      background: `linear-gradient(180deg, ${lv.colorFrom}, ${lv.colorTo})`,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                      borderBottomLeftRadius: 6,
                      borderBottomRightRadius: 6,
                      outline: "1px solid rgba(226,232,240,1)",
                    }}
                    title={`${lv.label}`}
                  />
                </div>
                <div className="mt-2 text-xs font-medium text-slate-700">{item.day}</div>
                <div className="text-[11px] text-slate-500">{lv.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {rainLevels.map((lv) => (
          <div key={lv.label} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded"
              style={{ background: `linear-gradient(90deg, ${lv.colorFrom}, ${lv.colorTo})` }}
            />
            <span className="text-xs text-slate-600">{lv.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-100  rounded-2xl shadow-sm p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-semibold text-slate-900">Biểu đồ cảm biến hàng tuần</h2>
          {/* <span className="text-xs text-slate-500 hidden sm:inline">({mode})</span> */}
        </div>

        {/* Segmented control w/ icons */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(sampleData).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={[
                  "group inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border transition-all",
                  "rounded-full",
                  active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
                ].join(" ")}
              >
                <span
                  className="grid place-items-center w-5 h-5 rounded-full"
                  style={{
                    background: active ? "rgba(255,255,255,0.15)" : "rgba(148,163,184,0.2)",
                    color: active ? "#fff" : colorMap[m],
                  }}
                >
                  {iconOf[m]}
                </span>
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <AnimatePresence mode="wait">
        {mode === "Rainfall" ? (
          <motion.div
            key="rain"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {renderRainBars()}
          </motion.div>
        ) : (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pt-2"
          >
            <ResponsiveContainer width="100%" height={320}>
              {/* Dùng AreaChart để có vùng fill gradient + line “glow” */}
              <AreaChart data={data} margin={{ left: 4, right: 8 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={themeColor} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={themeColor} stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                  width={48}
                  tickFormatter={(v) => `${v}${unitOf(mode)}`}
                />
                <Tooltip
                  content={<FancyTooltip mode={mode} />}
                  cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={themeColor}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#${gradId})`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={themeColor}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7, style: { filter: "drop-shadow(0 0 6px rgba(0,0,0,0.15))" } }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
