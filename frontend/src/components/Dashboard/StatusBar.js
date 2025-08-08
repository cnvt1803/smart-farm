import React from 'react'

const StatusBar = ({numberOfFarms, onlineDevices, warningDevices, offlineDevices}) => {
  const dataToView = [
    { icon: "🏡", label: "Number of Farms", value: numberOfFarms, style: "blue"},
    { icon: "💻", label: "Online Devices", value: onlineDevices, style: "green"},
    { icon: "⚠️", label: "Warning Devices", value: warningDevices, style: "yellow"},
    { icon: "🔌", label: "Offline Devices", value: offlineDevices, style: "red"},
  ];
  return (
    <div className="p-2 border border-gray-300 rounded-lg">
      <div className="flex flex-row justify-between">
        {dataToView.map((item, index) => (
          <div className="flex flex-col" key={index}>
            <span className="font-semibold">{item.label}:</span>
            <span>{item.value}</span>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}

export default StatusBar