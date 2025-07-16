import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import AccountSettings from "./AccountSettings";

const MainLayout = ({ children, activeItem }) => {
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="bg-blue-50 min-h-screen">
      <Header onOpenSettings={() => setShowAccountSettings(true)} />

      {showAccountSettings && (
        <AccountSettings onClose={() => setShowAccountSettings(false)} />
      )}

      <div className="flex relative">
        <div className={`transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-0"}`}>
          <div className={`${isSidebarOpen ? "p-4" : "p-0"} h-[91vh]`}>
            {isSidebarOpen && <Sidebar activeItem={activeItem} />}
          </div>
        </div>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-[10vh] z-30 bg-blue-50 px-2 py-1 rounded-r shadow hover:bg-blue-100 transition
          ${isSidebarOpen ? "left-[256px]" : "left-2"}`}
        >
          {isSidebarOpen ? "◀" : "▶"}
        </button>

        <div className="flex-1 p-6 ">{children}</div>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
