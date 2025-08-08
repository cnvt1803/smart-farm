import React, { useState } from "react";
const Sidebar = ({ activeItem }) => {

  const menuGroups = [
    {
      title: "MENU",
      items: [
        { label: "Monitor", path: "/monitor", key: "monitor" },
        { label: "Dashboard", path: "/dashboard", key: "dashboard" },
        { label: "Pump Control", path: "/pump-control", key: "pump_control" },
      ],
    },
  ];

  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (key) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };


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
                { item.subItems ? (
                  <div className="">
                    <div 
                      onClick={() => toggleExpanded(item.key)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200
                        ${activeItem === item.key ? "bg-blue-400 text-white font-bold" : "text-gray-800 hover:bg-blue-100"}
                      `}
                    >
                      <span>{item.label}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${expandedItems[item.key] ? 'rotate-180' : ''}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {expandedItems[item.key] && (
                      <ul className="pl-4 mt-2 space-y-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.key}>
                            <a
                              href={subItem.path}
                              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${activeItem === subItem.key ? "bg-blue-400 text-white font-bold" : "text-gray-800 hover:bg-blue-100"}
                              `}
                            >
                              {subItem.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200
                      ${activeItem === item.key ? "bg-blue-400 text-white font-bold" : "text-gray-800 hover:bg-blue-100"}
                      ${item.isMain ? "text-base font-bold" : ""}
                    `}
                  >
                    <span>{item.label}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
