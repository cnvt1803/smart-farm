import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiActivity,
  FiBarChart2,
  FiChevronDown,
  FiDroplet,
  FiHome,
  FiLayers,
  FiPlayCircle,
} from "react-icons/fi";

const cx = (...s) => s.filter(Boolean).join(" ");

const Sidebar = ({ activeItem }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  // --- Define your menu here (icons optional) ---
  const menuGroups = useMemo(
    () => [
      {
        title: "Menu",
        items: [
          { label: "Monitor", path: "/monitor", key: "monitor", icon: <FiActivity /> },
          { label: "Dashboard", path: "/dashboard", key: "dashboard", icon: <FiBarChart2 /> },
          { label: "Pump Control", path: "/pump-control", key: "pump_control", icon: <FiDroplet /> },
        ],
      },
      // Example with submenu (uncomment to use)
      // {
      //   title: "Automation",
      //   items: [
      //     {
      //       label: "Scenes",
      //       key: "scenes",
      //       icon: <FiLayers />,
      //       subItems: [
      //         { label: "Irrigation", path: "/scenes/irrigation", key: "scene_irrigation" },
      //         { label: "Lighting", path: "/scenes/lighting", key: "scene_lighting" },
      //       ],
      //     },
      //   ],
      // },
    ],
    []
  );

  const toggleExpanded = (key) =>
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));

  // Auto-expand parent if current path matches any of its subItems
  useEffect(() => {
    menuGroups.forEach((g) => {
      g.items?.forEach((it) => {
        if (it.subItems?.some((s) => location.pathname.startsWith(s.path))) {
          setExpandedItems((p) => ({ ...p, [it.key]: true }));
        }
      });
    });
  }, [location.pathname, menuGroups]);

  const ItemWrapper = ({ children, isActive }) => (
    <div className={cx(
      "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
      "border border-transparent hover:bg-white/70 hover:shadow-sm",
      isActive ? "bg-white shadow-sm border-[#C3C9FF]" : "",
      "dark:hover:bg-white/10 dark:border-white/10 dark:bg-transparent"
    )}>
      {/* Accent bar when active */}
      <span
        className={cx(
          "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3px] rounded-full",
          isActive ? "bg-gradient-to-b from-indigo-400 to-sky-400" : "opacity-0"
        )}
      />
      {children}
    </div>
  );

  return (
    <aside
      className={cx(
        "w-64 fixed left-0 z-40",
        // align with your header height. If you use h-16 header, change to top-16 and the calc below accordingly
        "top-[8vh] h-[calc(100vh-9vh)]",
        // background & borders
        "bg-gradient-to-b from-[#F0F5FF] to-[#E7ECFF] dark:from-[#0F2236] dark:to-[#0B1B2B]",
        "border-r border-[#D7E3F7] dark:border-white/10",
        "shadow-xl text-slate-700 dark:text-white/90",
        "p-4 overflow-y-auto"
      )}
    >
      {/* Brand (optional) */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="inline-grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-sky-400 text-white shadow-sm">
          <FiHome />
        </div>
        <h2 className="text-base font-semibold tracking-tight">SmartFarm</h2>
      </div>

      {menuGroups.map((group) => (
        <div key={group.title} className="mb-6">
          <h3 className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80 dark:text-white/60">
            {group.title}
          </h3>
          <ul className="space-y-2">
            {group.items.map((item) => {
              const isActiveManual = activeItem && activeItem === item.key;

              if (item.subItems) {
                return (
                  <li key={item.key}>
                    <button
                      onClick={() => toggleExpanded(item.key)}
                      className={cx(
                        "w-full",
                        "group relative flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
                        "border border-transparent hover:bg-white/70 hover:shadow-sm dark:hover:bg-white/10"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg opacity-80">{item.icon ?? <FiLayers />}</span>
                        {item.label}
                      </span>
                      <FiChevronDown
                        className={cx(
                          "transition-transform duration-200",
                          expandedItems[item.key] ? "rotate-180" : ""
                        )}
                      />
                    </button>
                    {expandedItems[item.key] && (
                      <ul className="mt-2 pl-2 space-y-1">
                        {item.subItems.map((sub) => (
                          <li key={sub.key}>
                            <NavLink to={sub.path} end>
                              {({ isActive }) => (
                                <ItemWrapper isActive={isActive || isActiveManual}>
                                  <span className="w-5" />
                                  <span>{sub.label}</span>
                                </ItemWrapper>
                              )}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.key}>
                  <NavLink to={item.path} end>
                    {({ isActive }) => (
                      <ItemWrapper isActive={isActive || isActiveManual}>
                        <span className="text-lg opacity-80">
                          {item.icon ?? <FiPlayCircle />}
                        </span>
                        <span>{item.label}</span>
                      </ItemWrapper>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Mini footer inside sidebar */}
      <div className="mt-auto pt-4 border-t border-white/60 dark:border-white/10 text-[11px] opacity-80 px-2">
        v{import.meta?.env?.VITE_APP_VERSION || "1.0.0"}
      </div>
    </aside>
  );
};

export default Sidebar;