import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiAlertTriangle,
  FiClock,
  FiDroplet,
  FiPlus,
  FiSave,
  FiSettings,
  FiTrash2,
} from "react-icons/fi";
import { API_BASE_URL } from "../config";

/* -------------------- Helpers -------------------- */
const cx = (...s) => s.filter(Boolean).join(" ");
const toMin = (hhmm) => {
  const [h, m] = (hhmm || "0:0").split(":").map(Number);
  return h * 60 + m;
};
const isOverlap = (a, b) =>
  Math.max(toMin(a.from), toMin(b.from)) < Math.min(toMin(a.to), toMin(b.to));
const fmtStatus = (on) => (on ? "ON" : "OFF");

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* -------------------- Component -------------------- */
const ControlPump = () => {
  const navigate = useNavigate();

  /* mode & config */
  const [mode, setMode] = useState(
    () => localStorage.getItem("pump_mode") || "manual"
  );

  const [thresholds, setThresholds] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("pump_thresholds")) || {
          temperature: 30,
          humidity: 60,
          soilPercent: 40,
          lux: 500,
          rainValue: 2,
        }
      );
    } catch {
      return { temperature: 30, humidity: 60, soilPercent: 40, lux: 500, rainValue: 2 };
    }
  });

  const [schedules, setSchedules] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("pump_schedules")) || [
          { from: "06:00", to: "06:05" },
          { from: "12:00", to: "12:10" },
          { from: "18:00", to: "18:03" },
        ]
      );
    } catch {
      return [
        { from: "06:00", to: "06:05" },
        { from: "12:00", to: "12:10" },
        { from: "18:00", to: "18:03" },
      ];
    }
  });

  /* runtime state */
  const [pumpOn, setPumpOn] = useState(null); // null while loading
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // NEW: thời lượng bật bơm (giây) cho /api/pump-on
  const [durationSec, setDurationSec] = useState(10);

  /* modal add schedule */
  const [showModal, setShowModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ from: "", to: "" });

  /* -------------------- Auth check -------------------- */
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return navigate("/login");
      try {
        const res = await fetch(`${API_BASE_URL}/api/check-auth`, {
          headers: { ...authHeaders() },
        });
        if (!res.ok) throw new Error("auth failed");
      } catch {
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    })();
  }, [navigate]);

  const fetchPumpStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/latest`, {
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error("latest failed");
      const data = await res.json();
      if (typeof data.pump !== "undefined") setPumpOn(data.pump === 1);
      setError("");
    } catch (err) {
      console.error("Error fetching pump status:", err);
      setError("Không lấy được trạng thái bơm");
    }
  };

  useEffect(() => {
    fetchPumpStatus();
    const id = setInterval(fetchPumpStatus, 5000);
    return () => clearInterval(id);
  }, []);

  //! Bật/tắt thủ công tức thời (gọi /api/pump với {status: "ON"|"OFF"}) Chưa có api
  const togglePump = async (next) => {
    if (pumpOn === null || busy || mode !== "manual") return;
    setBusy(true);
    setError("");
    const prev = pumpOn;
    setPumpOn(next); // optimistic

    try {
      const res = await fetch(`${API_BASE_URL}/api/pump`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status: fmtStatus(next) }),
      });
      if (!res.ok) throw new Error("toggle failed");
      setTimeout(fetchPumpStatus, 1200);
    } catch (err) {
      console.error("Error toggling pump:", err);
      setPumpOn(prev); // rollback
      setError("Không gửi được lệnh bật/tắt bơm");
    } finally {
      setBusy(false);
    }
  };

  //Bật bơm trong N giây (gọi /api/pump-on với {command, duration})
  const pumpOnce = async () => {
    if (mode !== "manual" || busy) return;

    const sec = Math.max(1, Math.min(600, Number(durationSec) || 0)); 
    setBusy(true);
    setError("");

    try {
      setPumpOn(true);

      const res = await fetch(`${API_BASE_URL}/api/pump-on`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ command: "PUMP_ON", duration: sec * 1000 }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "pump-on failed");
      }

      setTimeout(fetchPumpStatus, 1500);
    } catch (e) {
      console.error("PUMP_ON error:", e);
      setError("Không gửi được lệnh PUMP_ON");
      // rollback về trạng thái thực tế
      fetchPumpStatus();
    } finally {
      setBusy(false);
    }
  };

  const saveThresholds = async () => {
    localStorage.setItem("pump_thresholds", JSON.stringify(thresholds));
    try {
      await fetch(`${API_BASE_URL}/api/pump/thresholds`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(thresholds),
      });
    } catch {
    }
  };

  const saveSchedules = async (arr) => {
    localStorage.setItem("pump_schedules", JSON.stringify(arr));
    setSchedules(arr);
    try {
      await fetch(`${API_BASE_URL}/api/pump/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(arr),
      });
    } catch {
      /* optional */
    }
  };

  const scheduleHint = useMemo(() => {
    const sorted = [...schedules].sort((a, b) => toMin(a.from) - toMin(b.from));
    let ok = true;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (isOverlap(sorted[i], sorted[i + 1])) {
        ok = false;
        break;
      }
    }
    return {
      sorted,
      valid: ok,
      message: ok ? "Schedule hợp lệ" : "Lịch bị chồng lấn thời gian",
    };
  }, [schedules]);

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-[radial-gradient(900px_500px_at_-10%_-10%,#EDEBFF_30%,transparent_60%),radial-gradient(900px_500px_at_110%_10%,#E4E8FF_25%,transparent_55%),linear-gradient(#F8FAFF,#FFFFFF)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-sky-400 text-white shadow-sm">
              <FiDroplet />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Smart Pump Control
              </h2>
              <p className="text-sm text-slate-500">
                Theo dõi & điều khiển bơm nước theo thời gian thực
              </p>
            </div>
          </div>

          {/* Mode switch (segmented) */}
          <div className="bg-white/70 backdrop-blur border border-[#C3C9FF] rounded-xl shadow-sm p-1 inline-flex text-sm">
            {[
              { k: "manual", label: "Manual" },
              { k: "automatic", label: "Automatic" },
            ].map((m) => (
              <button
                key={m.k}
                onClick={() => {
                  setMode(m.k);
                  localStorage.setItem("pump_mode", m.k);
                }}
                className={cx(
                  "px-3 sm:px-4 py-2 rounded-lg transition",
                  mode === m.k
                    ? "bg-indigo-500 text-white shadow"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status + Manual control */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/80 backdrop-blur border border-[#E0E4FF] rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Trạng thái bơm
              </h3>
              <span
                className={cx(
                  "inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full",
                  pumpOn ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                )}
              >
                <FiActivity /> {pumpOn === null ? "Đang tải…" : fmtStatus(pumpOn)}
              </span>
            </div>

            {/* Big toggle */}
            <div className="flex justify-center py-4">
              <button
                disabled={pumpOn === null || busy || mode !== "manual"}
                onClick={() => togglePump(!pumpOn)}
                className={cx(
                  "relative select-none w-64 h-28 rounded-full transition border shadow-lg",
                  pumpOn
                    ? "bg-gradient-to-r from-green-400 to-green-600 border-green-500"
                    : "bg-gradient-to-r from-slate-200 to-slate-300 border-slate-300",
                  "focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed"
                )}
                aria-pressed={!!pumpOn}
              >
                <div
                  className={cx(
                    "absolute top-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full shadow-md transition-transform duration-300",
                    pumpOn ? "translate-x-36" : "translate-x-2"
                  )}
                />
              </button>
            </div>

            {/* Quick pulse by duration (call /api/pump-on) */}
            <div className="mt-6 flex items-end justify-center gap-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  Thời lượng bật (giây)
                </span>
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={durationSec}
                  onChange={(e) => setDurationSec(e.target.value)}
                  className="mt-1 w-36 px-3 py-2 rounded-lg border border-[#C3C9FF] bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </label>
              <button
                disabled={mode !== "manual" || busy}
                onClick={pumpOnce}
                className={cx(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow",
                  "bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
                )}
                title="/api/pump-on"
              >
                <FiActivity /> Bật trong{" "}
                {Math.max(1, Math.min(600, Number(durationSec) || 0))}s
              </button>
            </div>

            <p className="mt-2 text-center text-xs text-slate-500">
              {mode === "manual"
                ? "Bật/tắt bơm bằng công tắc ở trên, hoặc bật theo thời lượng."
                : "Chế độ tự động đang bật – công tắc thủ công bị khóa"}
            </p>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
                <FiAlertTriangle /> {error}
              </div>
            )}
          </div>

          {/* Quick info card */}
          <div className="bg-white/80 backdrop-blur border border-[#E0E4FF] rounded-2xl shadow-sm p-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Tóm tắt</h4>
            <ul className="text-sm space-y-1 text-slate-600">
              <li>
                Chế độ:{" "}
                <span className="font-medium text-slate-800">{mode}</span>
              </li>
              <li>
                Lịch:{" "}
                <span className="font-medium text-slate-800">
                  {schedules.length} khung
                </span>
              </li>
              <li>
                Ngưỡng:{" "}
                <span className="font-medium text-slate-800">
                  {Object.keys(thresholds).length} tham số
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Automatic config */}
        <div
          className={cx(
            "grid grid-cols-1 lg:grid-cols-2 gap-6 transition",
            mode === "automatic" ? "opacity-100" : "opacity-50 pointer-events-none"
          )}
        >
          {/* Thresholds */}
          <div className="bg-white/80 backdrop-blur border border-[#E0E4FF] rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FiSettings /> Ngưỡng tự động
              </h3>
              <button
                onClick={saveThresholds}
                disabled={busy}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm shadow hover:bg-indigo-600 disabled:opacity-60"
              >
                <FiSave /> Lưu
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {Object.entries(thresholds).map(([key, value]) => (
                <label key={key} className="block">
                  <span className="capitalize text-xs font-medium text-slate-600">
                    {key}
                  </span>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      setThresholds((t) => ({
                        ...t,
                        [key]: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-[#C3C9FF] bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Schedules */}
          <div className="bg-white/80 backdrop-blur border border-[#E0E4FF] rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FiClock /> Lịch tưới
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-sm hover:bg-slate-200"
                >
                  <FiPlus /> Thêm
                </button>
                <button
                  onClick={() => saveSchedules(scheduleHint.sorted)}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm shadow hover:bg-indigo-600 disabled:opacity-60"
                >
                  <FiSave /> Lưu
                </button>
              </div>
            </div>

            <ul className="mt-4 divide-y divide-[#E9ECFF]">
              {scheduleHint.sorted.map((sch, idx) => (
                <li
                  key={`${sch.from}-${sch.to}-${idx}`}
                  className="py-2 flex items-center justify-between"
                >
                  <span className="text-slate-800">🔁 {sch.from} → {sch.to}</span>
                  <button
                    onClick={() =>
                      saveSchedules(
                        scheduleHint.sorted.filter((_, i) => i !== idx)
                      )
                    }
                    className="inline-flex items-center gap-2 text-red-600 hover:underline text-sm"
                  >
                    <FiTrash2 /> Xoá
                  </button>
                </li>
              ))}
            </ul>

            <div
              className={cx(
                "mt-3 text-xs flex items-center gap-2",
                scheduleHint.valid ? "text-green-700" : "text-amber-700"
              )}
            >
              <FiAlertTriangle className={scheduleHint.valid ? "opacity-40" : ""} />
              {scheduleHint.message}
            </div>
          </div>
        </div>

        {/* Modal Add schedule */}
        {showModal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E0E4FF] p-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">
                Thêm lịch mới
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    Bắt đầu
                  </span>
                  <input
                    type="time"
                    value={newSchedule.from}
                    onChange={(e) =>
                      setNewSchedule((s) => ({ ...s, from: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-[#C3C9FF] bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    Kết thúc
                  </span>
                  <input
                    type="time"
                    value={newSchedule.to}
                    onChange={(e) =>
                      setNewSchedule((s) => ({ ...s, to: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-[#C3C9FF] bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </label>
              </div>

              {/* validation tips */}
              <div className="mt-3 text-xs text-slate-600">
                - Khoảng thời gian không được rỗng, và From{" "}
                <span className="font-semibold">nhỏ hơn</span> To.<br />
                - Không trùng lặp với các khung hiện có.
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (!newSchedule.from || !newSchedule.to) return;
                    if (toMin(newSchedule.from) >= toMin(newSchedule.to)) return;
                    const conflict = schedules.some((s) =>
                      isOverlap(s, newSchedule)
                    );
                    if (conflict) return;
                    const arr = [...schedules, newSchedule].sort(
                      (a, b) => toMin(a.from) - toMin(b.from)
                    );
                    saveSchedules(arr);
                    setNewSchedule({ from: "", to: "" });
                    setShowModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPump;
