import { FaThermometerHalf, FaTint, FaSun, FaLeaf, FaEye } from "react-icons/fa";

/* ===== Icons (song ngữ) ===== */
const iconMap = {
  "Nhiệt độ": <FaThermometerHalf className="text-2xl" />,
  "Độ ẩm": <FaTint className="text-2xl" />,
  "Ánh sáng": <FaSun className="text-2xl" />,
  "Đất": <FaLeaf className="text-2xl" />,
  "Lượng mưa": <FaEye className="text-2xl" />,
  Temperature: <FaThermometerHalf className="text-2xl" />,
  Humidity: <FaTint className="text-2xl" />,
  Lux: <FaSun className="text-2xl" />,
  Soil: <FaLeaf className="text-2xl" />,
  Rain: <FaEye className="text-2xl" />,
};

/* ===== Helpers ===== */
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// Ép kiểu mềm: nhận number/string/null/undefined → number hoặc NaN
const toNum = (v) => {
  if (v == null) return NaN;
  if (typeof v === "number") return v;
  return Number(String(v).trim().replace(",", "."));
};

const isFiniteNumber = (v) => Number.isFinite(toNum(v));

const softBg = (hex, alpha = 0.12) => {
  if (!hex?.startsWith("#") || (hex.length !== 7 && hex.length !== 4)) return "rgba(16,185,129,0.12)";
  const h = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Hiển thị số với n chữ số thập phân; mặc định 1
const formatValue = (v, digits = 1) => (isFiniteNumber(v) ? toNum(v).toFixed(digits) : "--");

const getProgressPercent = (label, value) => {
  if (!isFiniteNumber(value)) return 0;
  const val = toNum(value);

  switch (label) {
    case "Nhiệt độ": // 0 – 50 °C
      return clamp(((val - 0) / 50) * 100, 0, 100);

    case "Độ ẩm":    // 0 – 100 %
    case "Đất":
      return clamp(val, 0, 100);

    case "Ánh sáng": //  0 – 3500 lux -> 0 – 100 %
      return clamp(val / 35, 0, 100);

    case "Lượng mưa": // 0 – 100
      return clamp(val, 0, 100);

    default:
      return 0;
  }
};

/* ===== Component ===== */
export default function SensorCard({
  label,
  value,       
  unit,
  color = "#10b981",
  rawValue,   
  showBar = true,
  className = "",
}) {
  const numeric = isFiniteNumber(rawValue) ? toNum(rawValue) : toNum(value);
  const percent = getProgressPercent(label, numeric);

  return (
    <div
      className={`shadow-md p-4 ${className}`}
      style={{ backgroundColor: softBg(color, 0.08) }}
    >
      {/* Icon + Label */}
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-full flex items-center justify-center"
          style={{ backgroundColor: softBg(color, 0.3), color }}
        >
          {iconMap[label] || <FaEye className="text-2xl" />}
        </div>
        <div className="text-slate-800 font-semibold text-base">{label}</div>
      </div>

      {/* Value */}
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900">
          {formatValue(value ?? rawValue, 1)}
          <span className="text-sm font-medium ml-1 text-slate-700">{unit}</span>
        </div>
      </div>

      {/* Progress bar */}
      {showBar && isFiniteNumber(numeric) && (
        <div className="mt-3 w-full h-2 bg-slate-200 overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${percent}%`,
              background: `linear-gradient(to right, ${color}, ${softBg(color, 0.6)})`,
            }}
          />
        </div>
      )}
    </div>
  );
}
