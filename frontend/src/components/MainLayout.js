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
      {/* Fixed Header */}
      <Header onOpenSettings={() => setShowAccountSettings(true)} />

      <div className="flex relative pt-[9vh]">
        {/* Sidebar */}
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

        {/* Main Content */}
        <div className="flex-1 p-6">{children}</div>
      </div>

      {/* Footer */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
        <Footer />
      </div>

      {/* Modal Account Settings (Outside layout, fixed position) */}
      {showAccountSettings && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl">
            <button
              onClick={() => setShowAccountSettings(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✕
            </button>
            <AccountSettings onClose={() => setShowAccountSettings(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
