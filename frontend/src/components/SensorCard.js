import { FaThermometerHalf, FaTint, FaSun, FaLeaf, FaEye } from "react-icons/fa";

/* ===== Icons ===== */
const iconMap = {
  Temperature: <FaThermometerHalf className="text-2xl" />,
  Humidity: <FaTint className="text-2xl" />,
  Lux: <FaSun className="text-2xl" />,
  Soil: <FaLeaf className="text-2xl" />,
  Rain: <FaEye className="text-2xl" />,
};

/* ===== Helpers ===== */
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const isFiniteNumber = (v) => typeof v === "number" && Number.isFinite(v);

// Tạo nền nhạt từ màu hex (#RRGGBB) với alpha
const softBg = (hex, alpha = 0.12) => {
  if (!hex?.startsWith("#") || (hex.length !== 7 && hex.length !== 4)) return "rgba(16,185,129,0.12)";
  const h = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const formatValue = (v) => (isFiniteNumber(v) ? v : "--");

/** Tính % theo label chuẩn */
const getProgressPercent = (label, value) => {
  if (!isFiniteNumber(value)) return 0;

  switch (label) {
    case "Temperature": // 0 – 50 °C
      return clamp(((value - 0) / 50) * 100, 0, 100);

    case "Humidity":    // 0 – 100 %
    case "Soil":
      return clamp(value, 0, 100);

    case "Lux":         // ví dụ 0 – 3000 lux  ->  0 – 100 %
      return clamp(value / 30, 0, 100);

    case "Rain":        // 0 – 100 (mm hoặc điểm)
      return clamp(value, 0, 100);

    default:
      return 0;
  }
};

/* ===== Component ===== */
export default function SensorCard({
  label,
  value,        // hiển thị
  unit,
  color = "#10b981",
  rawValue,     // dùng để tính tiến trình, nếu không có sẽ dùng value
  showBar = true,
  className = "",
}) {
  const numeric = isFiniteNumber(rawValue) ? rawValue : (isFiniteNumber(value) ? value : null);
  const percent = getProgressPercent(label, numeric);

  return (
    <div
      className={`shadow-md p-4 ${className}`}
      style={{
        backgroundColor: softBg(color, 0.08), // nền nhạt toàn card
      }}
    >
      {/* Icon + Label */}
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: softBg(color, 0.3),
            color,
          }}
        >
          {iconMap[label] || <FaEye className="text-2xl" />}
        </div>
        <div className="text-slate-800 font-semibold text-base">{label}</div>
      </div>

      {/* Value */}
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900">
          {formatValue(value)}
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
