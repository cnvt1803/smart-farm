import React from "react";

const rainLevels = [
  { level: 1, label: "No Rain", range: [3500, Infinity], description: "Surface completely dry" },
  { level: 2, label: "Very Light Rain", range: [3000, 3500], description: "Slightly damp" },
  { level: 3, label: "Light Rain", range: [2000, 3000], description: "Some water accumulation" },
  { level: 4, label: "Moderate Rain", range: [1000, 2000], description: "Surface mostly wet" },
  { level: 5, label: "Heavy Rain", range: [0, 1000], description: "Flooded surface" },
];

function getRainLevel(value) {
  return rainLevels.find((level) => value >= level.range[0] && value < level.range[1]);
}

const RainLevelChart = ({ rainValue }) => {
  const currentLevel = getRainLevel(rainValue);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-xl mx-auto">
      {/* Cột biểu đồ */}
      <div className="flex justify-between items-end h-40 mb-2 gap-2">
        {rainLevels.map((level) => (
          <div key={level.level} className="flex flex-col justify-end items-center flex-1 h-full">
            <div
              className={`w-full max-w-[40px] rounded-t-xl transition-all duration-300 ${
                currentLevel?.level === level.level ? "bg-indigo-500" : "bg-gray-200"
              }`}
              style={{
                height: `${level.level * 20}px`, 
              }}
            ></div>
          </div>
        ))}
      </div>

      {/* Nhãn tên dưới từng cột */}
      <div className="flex justify-between mt-1">
        {rainLevels.map((level) => (
          <div key={level.level} className="flex-1 text-center text-xs">
            {level.label}
          </div>
        ))}
      </div>

      {/* Mô tả */}
      {currentLevel && (
        <div className="mt-4 bg-indigo-100 border border-indigo-400 text-indigo-700 p-3 rounded-md text-sm text-center">
          <strong>{currentLevel.label}:</strong> {currentLevel.description}
        </div>
      )}
    </div>
  );
};

export default RainLevelChart;
