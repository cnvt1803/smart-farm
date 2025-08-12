import React from 'react'

const StatusBar = ({numberOfFarms, onlineDevices, warningDevices, offlineDevices}) => {

  const dataToView = [
    { icon: "🏡", label: "Number of Farms", value: numberOfFarms, style: "blue"},
    { icon: "💻", label: "Online Sensors", value: onlineDevices, style: "green"},
    { icon: "⚠️", label: "Warning Sensors", value: warningDevices, style: "yellow"},
    { icon: "🔌", label: "Offline Sensors", value: offlineDevices, style: "red"},
  ];
  
  return (
    <div className="p-2 border border-gray-300 rounded-lg">
      <div className="flex flex-row justify-between">
        {dataToView.map((item, index) => (
          <div className={`flex flex-row items-center ${item.style}`} key={index}>
            <div className="text-2xl">{item.icon}</div>
            <div className={`text-${item.style}-200`}>
              <span className="font-semibold">{item.label}:</span>
              <span>{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatusBar