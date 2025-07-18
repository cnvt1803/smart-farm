import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const ControlPump = () => {
  const [pumpStatus, setPumpStatus] = useState(null);
  const [mode, setMode] = useState("manual");
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

  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return navigate("/login");

      try {
        const res = await fetch(`${API_BASE_URL}/api/check-auth`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          localStorage.removeItem("access_token");
          navigate("/login");
        }
      } catch {
        navigate("/login");
      }
    };
    checkLogin();
  }, [navigate]);

  const handleManualToggle = async (status) => {
    if (pumpStatus === null) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/pump`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setPumpStatus(status);
    } catch (err) {
      console.error("Error toggling pump:", err);
    }
  };

  useEffect(() => {
    const fetchPumpStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/latest`);
        const data = await res.json();
        if (typeof data.pump !== "undefined")
          setPumpStatus(data.pump === 1 ? "ON" : "OFF");
      } catch (err) {
        console.error("Error fetching pump status:", err);
      }
    };
    fetchPumpStatus();
    const interval = setInterval(fetchPumpStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleThresholdChange = (e, key) => {
    setThresholds({ ...thresholds, [key]: e.target.value });
  };

  const handleAddSchedule = () => {
    if (newSchedule.from && newSchedule.to) {
      setSchedules([...schedules, newSchedule]);
      setNewSchedule({ from: "", to: "" });
      setShowModal(false);
    }
  };

  const handleDeleteSchedule = (idx) => {
    setSchedules(schedules.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-gradient-to-br from-blue-50  to-white min-h-screen ">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">🚰 Smart Pump Control</h2>

      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
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

        {mode === "manual" && (
          <div>
            <h3 className="text-xl font-semibold text-blue-700 mb-4">🔘 Manual Pump Control</h3>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Control the pump manually using the switch below.</span>
              <span className="text-blue-600 font-medium">
                Status: {pumpStatus === "ON" ? "Running 🟢" : "Stopped 🔴"}
              </span>
            </div>

            <div className="w-full flex justify-center mt-4">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-100 to-white shadow-xl flex flex-col justify-center items-center">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={pumpStatus === "ON"}
                      onChange={(e) => handleManualToggle(e.target.checked ? "ON" : "OFF")}
                      className="sr-only"
                    />
                    <div className={`mt-7 w-20 h-11 rounded-full shadow-inner ${pumpStatus === "ON" ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gray-300"}`}></div>
                    <div className={`mt-7 absolute top-[2px] left-[2px] w-10 h-10 bg-white rounded-full shadow-md transform transition-transform duration-300 ${pumpStatus === "ON" ? "translate-x-9" : ""}`}></div>
                  </div>
                </label>
                <span className={`mt-4 text-lg font-bold ${pumpStatus === "ON" ? "text-green-600" : "text-gray-500"}`}>{pumpStatus === "ON" ? "ON" : "OFF"}</span>
              </div>
            </div>
          </div>
        )}

        {mode === "automatic" && (
          <div>
            <h3 className="text-xl font-semibold text-blue-700 mb-4">🤖 Auto Mode Thresholds</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(thresholds).map(([key, value]) => (
                <div key={key}>
                  <label className="capitalize font-medium text-blue-800">{key}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleThresholdChange(e, key)}
                    className="mt-1 px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 w-full"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => console.log("✅ Thresholds saved:", thresholds)}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700"
              >
                Save Thresholds
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-blue-700">⏰ Schedule</h3>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600">
            + Add Schedule
          </button>
        </div>
        <ul className="divide-y divide-blue-100">
          {schedules.map((sch, idx) => (
            <li key={idx} className="py-2 flex justify-between items-center text-blue-800">
              <span>🔁 {sch.from} → {sch.to}</span>
              <button onClick={() => handleDeleteSchedule(idx)} className="text-red-500 hover:underline text-sm">Delete</button>
            </li>
          ))}
        </ul>
      </div>

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
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">Cancel</button>
                <button onClick={handleAddSchedule} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPump;
