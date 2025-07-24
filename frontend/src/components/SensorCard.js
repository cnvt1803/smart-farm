import React from 'react';

const SensorCard = ({ icon, label, value, unit, rawValue = 0, color }) => {
  const percentage = Math.min(Math.max((rawValue / 100) * 100, 0), 100);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  return (
    <div className="bg-blue-50 rounded-2xl shadow-md p-6 w-[240px] text-center">
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-lg font-semibold text-gray-800 mb-3">{label}</div>
      <div className="relative w-[140px] h-[140px] mx-auto">
        {/* Nền vòng tròn */}
        <svg className="absolute top-0 left-0 transform rotate-90" width="140" height="140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
        </svg>

        {/* Phần trăm vòng tròn */}
        <svg className="absolute top-0 left-0 transform rotate-90" width="140" height="140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Giá trị ở giữa */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {value} {unit}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SensorCard;
