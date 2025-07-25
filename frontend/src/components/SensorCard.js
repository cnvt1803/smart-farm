import { FaThermometerHalf, FaTint, FaSun, FaLeaf, FaEye } from "react-icons/fa";

const iconMap = {
  Temperature: <FaThermometerHalf className="text-3xl" />,
  Humidity: <FaTint className="text-3xl" />,
  Lux: <FaSun className="text-3xl" />,
  Soil: <FaLeaf className="text-3xl" />,
  Rain: <FaEye className="text-3xl" />,
};

const getProgressPercent = (label, value) => {
  if (value === undefined || value === null) return 0;
  switch (label) {
    case "Temperature":
      return Math.min(Math.max(((value - 0) / 50) * 100, 0), 100); // 0 - 50°C
    case "Humidity":
    case "Soil":
      return Math.min(Math.max(value, 0), 100); // 0 - 100%
    case "Lux":
      return Math.min(Math.max((value / 30), 0), 100); // e.g., 0 - 3000 lux → 0 - 100
    case "Rain":
      return Math.min(Math.max((value / 100), 0), 100);
    default:
      return 0;
  }
};

export default function SensorCard({ label, value, unit, color = "#10b981", rawValue }) {
  const percent = getProgressPercent(label, rawValue ?? value);

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-start justify-between gap-3 min-h-[130px] transition-transform duration-200 hover:scale-[1.02]">

      {/* Icon + Label */}
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {iconMap[label] || <FaEye className="text-2xl" />}
        </div>
        <div className="text-gray-700 font-semibold text-lg">{label}</div>
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-gray-900">
        {value !== undefined && value !== null ? value : "--"}
        <span className="text-lg font-medium ml-1">{unit}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
