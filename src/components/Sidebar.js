import React from "react";
const Sidebar = ({ activeItem }) => {

  const menuGroups = [
    {
      title: "MENU",
      items: [
        { label: "Monitor", path: "/monitor", key: "monitor" },
        { label: "Pump Control", path: "/pump-control", key: "pump_control" },
      ],
    },
  ];


  return (
    <div className="w-64 h-[91vh] bg-white p-5 fixed top-[9vh] left-0 shadow-md border border-blue-400 flex flex-col z-50 text-blue-900 overflow-y-auto">
      
        <div className="flex flex-col items-center mb-5">
          <h2 className="text-xl font-bold text-blue-800">SmartFarm</h2>
        </div>

      {menuGroups.map((group) => (
        <div key={group.title} className="mb-5">
          <h3 className="text-[13px] text-gray-600 font-semibold uppercase border-b border-blue-400 pl-2 mb-2">
            {group.title}
          </h3>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <li key={item.key}>
                <a
                  href={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200
                    ${activeItem === item.key ? "bg-blue-400 text-white font-bold" : "text-gray-800 hover:bg-blue-100"}
                    ${item.isMain ? "text-base font-bold" : ""}
                  `}
                >
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
