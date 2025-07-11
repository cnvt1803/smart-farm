import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { supabase } from "../components/supabaseClient";
const ControlPump = () => {
  const [pumpStatus, setPumpStatus] = useState(null);
  const [mode, setMode] = useState("manual");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate(); 
  const [thresholds, setThresholds] = useState({
    temperature: 30,
    humidity: 60,
    soilPercent: 40,
    lux: 500,
    rainValue: 2,
  });
  const [schedules, setSchedules] = useState([
    { from: "06:00", to: "06:05" },
    { from: "12:00", to: "12:10" },
    { from: "18:00", to: "18:03" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ from: "", to: "" });

  const handleThresholdChange = (e, key) => {
    setThresholds({ ...thresholds, [key]: e.target.value });
  };
    useEffect(() => {
    const checkLogin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkLogin();
  }, [navigate]);
  

  const handleManualToggle = (status) => {
    setPumpStatus(status);
    // TODO
  };

  const handleAddSchedule = () => {
    if (newSchedule.from && newSchedule.to) {
      setSchedules([...schedules, newSchedule]);
      setNewSchedule({ from: "", to: "" });
      setShowModal(false);
    }
  };

  const handleDeleteSchedule = (index) => {
    const updated = [...schedules];
    updated.splice(index, 1);
    setSchedules(updated);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      <div className="flex flex-grow relative">
        {/* Sidebar */}
        <div className={`transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-0"}`}>
          <div className={`h-full bg-blue-100 text-blue-800 border-r-4 border-blue-200 ${isSidebarOpen ? "p-4" : "p-0"}`}>
            {isSidebarOpen && <Sidebar activeItem="pump_control" />}
          </div>
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-[10vh] z-30 bg-white/70 px-3 py-1 rounded-r-full shadow-md hover:bg-white transition
            ${isSidebarOpen ? "left-[256px]" : "left-2"}`}
        >
          {isSidebarOpen ? "◀" : "▶"}
        </button>

        {/* Main content */}
        <main className="ml-10 mr-10 flex-1 p-6 pt-[12vh] space-y-8">
          <h2 className="text-3xl font-bold text-blue-800">🚰 Smart Pump Control</h2>

          {/* Pump Control Block */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 space-y-6 min-h-[280px]">
            {/* Mode Select */}
            <div className="flex items-center gap-4">
              <label className="text-lg font-semibold text-blue-700">Mode:</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="px-4 py-2 border border-blue-200 rounded-lg text-blue-700 bg-blue-50"
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
            <div className="border-t border-gray-200 my-4"></div>
            {/* === Manual === */}
            {mode === "manual" && (
              <>
                <h3 className="text-xl font-semibold text-blue-700">🔘 Manual Pump Control</h3>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-500 gap-2">
                  <span>You can manually turn the pump on or off using the switch below.</span>
                  <span className="text-blue-600 font-medium">
                    Status: {pumpStatus === "ON" ? "Running 🟢" : "Stopped 🔴"}
                  </span>
                </div>

                <div className="w-full flex justify-center">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-100 to-white shadow-xl flex flex-col justify-center items-center">
                    <label className="flex items-center cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={pumpStatus === "ON"}
                          onChange={(e) => handleManualToggle(e.target.checked ? "ON" : "OFF")}
                          className="sr-only"
                        />
                        {/* Track */}
                        <div
                          className={`mt-7 w-20 h-11 rounded-full transition-colors duration-300 shadow-inner
                            ${pumpStatus === "ON" ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gray-300"}
                          `}
                        ></div>
                        {/* Thumb */}
                        <div
                          className={`mt-7 absolute top-[2px] left-[2px] w-10 h-10 bg-white rounded-full shadow-md transform transition-transform duration-300
                            ${pumpStatus === "ON" ? "translate-x-9" : ""}
                          `}
                        ></div>
                      </div>
                    </label>

                    <span
                      className={`mt-4 text-lg font-bold ${
                        pumpStatus === "ON" ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {pumpStatus === "ON" ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* === Automatic === */}
            {mode === "automatic" && (
              <>
                <h3 className="text-xl font-semibold text-blue-700">🤖 Auto Mode Thresholds</h3>
                <p className="text-gray-500">
                  Pump will activate based on sensor values and these thresholds.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(thresholds).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <label className="capitalize font-medium text-blue-800">{key}</label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleThresholdChange(e, key)}
                        className="mt-1 px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-900"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => console.log("✅ Thresholds saved:", thresholds)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
                  >
                    Save Thresholds
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Schedule Section */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-700">⏰ Schedule</h3>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow"
              >
                + Add Schedule
              </button>
            </div>
            <p className="text-gray-500 mb-2">The pump will run automatically at the following times:</p>
            <ul className="divide-y divide-blue-100">
              {schedules.map((sch, idx) => (
                <li key={idx} className="py-2 flex justify-between items-center text-blue-800">
                  <span>🔁 {sch.from} → {sch.to}</span>
                  <button
                    onClick={() => handleDeleteSchedule(idx)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">➕ New Schedule</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-blue-600">Start Time</label>
                <input
                  type="time"
                  value={newSchedule.from}
                  onChange={(e) => setNewSchedule({ ...newSchedule, from: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-blue-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-blue-600">End Time</label>
                <input
                  type="time"
                  value={newSchedule.to}
                  onChange={(e) => setNewSchedule({ ...newSchedule, to: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-blue-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSchedule}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ControlPump;
