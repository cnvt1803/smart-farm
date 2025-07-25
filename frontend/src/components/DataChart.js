import { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";

// Rain level mapping
const rainLevels = [
  { level: 1, label: "No Rain", range: [3500, Infinity], description: "Surface completely dry" },
  { level: 2, label: "Very Light Rain", range: [3000, 3500], description: "Slightly damp" },
  { level: 3, label: "Light Rain", range: [2000, 3000], description: "Some water accumulation" },
  { level: 4, label: "Moderate Rain", range: [1000, 2000], description: "Surface mostly wet" },
  { level: 5, label: "Heavy Rain", range: [0, 1000], description: "Flooded surface" },
];

// Sample data (THÊM Lux và Soil)
const sampleData = {
  Temperature: [
    { day: "Mon", value: 29 },
    { day: "Tue", value: 30 },
    { day: "Wed", value: 28 },
    { day: "Thu", value: 31 },
    { day: "Fri", value: 27 },
    { day: "Sat", value: 26 },
    { day: "Sun", value: 30 },
  ],
  Humidity: [
    { day: "Mon", value: 70 },
    { day: "Tue", value: 75 },
    { day: "Wed", value: 80 },
    { day: "Thu", value: 78 },
    { day: "Fri", value: 82 },
    { day: "Sat", value: 79 },
    { day: "Sun", value: 77 },
  ],
  Rainfall: [
    { day: "Mon", value: 500 },
    { day: "Tue", value: 560 },
    { day: "Wed", value: 550 },
    { day: "Thu", value: 660 },
    { day: "Fri", value: 707 },
    { day: "Sat", value: 800 },
    { day: "Sun", value: 300 },
  ],
  Lux: [
    { day: "Mon", value: 2000 },
    { day: "Tue", value: 2500 },
    { day: "Wed", value: 1800 },
    { day: "Thu", value: 3000 },
    { day: "Fri", value: 2800 },
    { day: "Sat", value: 2600 },
    { day: "Sun", value: 2900 },
  ],
  Soil: [
    { day: "Mon", value: 45 },
    { day: "Tue", value: 50 },
    { day: "Wed", value: 48 },
    { day: "Thu", value: 55 },
    { day: "Fri", value: 53 },
    { day: "Sat", value: 52 },
    { day: "Sun", value: 49 },
  ]
};

// Convert rain value to level
const getRainLevel = (value) => {
  return rainLevels.find((level) => value >= level.range[0] && value < level.range[1]) || rainLevels[0];
};

// Color mapping (THÊM Lux và Soil)
const colorMap = {
  Temperature: "#ef4444", // red
  Humidity: "#3b82f6",    // blue
  Rainfall: "#8b5cf6",    // violet
  Lux: "#facc15",         // yellow
  Soil: "#10b981",        // green
};

export default function DataChart() {
  const [mode, setMode] = useState("Temperature");

  const renderRainBars = () => {
    const data = sampleData.Rainfall;
    return (
        <div className="flex justify-between items-end h-60 px-4 relative">
            {data.map((item, idx) => {
                const level = getRainLevel(item.value);
                const barHeight = (level.level / 5) * 100;

                return (
                <div key={idx} className="flex flex-col items-center flex-1 px-1">
                    <div className="flex justify-center items-end h-32 w-full">
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: `${barHeight}%`, opacity: 1 }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className={`w-4 sm:w-5 rounded-md ${
                        level.level >= 4
                            ? "bg-violet-700"
                            : level.level >= 3
                            ? "bg-violet-600"
                            : level.level >= 2
                            ? "bg-violet-400"
                            : "bg-violet-300"
                        }`}
                    />
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-800">{item.day}</div>
                    <div className="text-xs text-gray-500 text-center">{level.label}</div>
                </div>
                );
            })}
        </div>
    );
};

  return (
    <div className="bg-gray-50 rounded-2xl shadow-md p-6 w-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold text-gray-800">Weekly Sensor Chart</h2>
        <div className="flex gap-2 flex-wrap">
          {Object.keys(sampleData).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-sm rounded-md font-medium transition-all border ${
                mode === m
                  ? "bg-blue-100 text-blue-800 border-blue-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === "Rainfall" ? (
        renderRainBars()
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sampleData[mode]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis unit={
              mode === "Humidity" ? "%" :
              mode === "Temperature" ? "°C" :
              mode === "Soil" ? "%" :
              mode === "Lux" ? "lx" : ""
            } />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colorMap[mode]}
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
