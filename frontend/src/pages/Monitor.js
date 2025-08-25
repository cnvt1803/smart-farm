import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import SensorCard from "../components/SensorCard";
import DataChart from "../components/DataChart";
import RainLevelChart from "../components/RainChart";
import HarvestSchedule from "../components/right";

const Monitor = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [province, setProvince] = useState("");
  const [pTemperature, setpTemperature] = useState(null);
  const [condition, setCondition] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [windKph, setWindKph] = useState(null);
  const [forecastList, setForecastList] = useState([]);

  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [soilPercent, setSoilPercent] = useState(null);
  const [lux, setLux] = useState(null);
  const [rainValue, setRainValue] = useState(null);

  // Auth check
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/check-auth`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          localStorage.removeItem("access_token");
          navigate("/login");
        }
      } catch (err) {
        console.error("Auth error:", err);
        navigate("/login");
      }
    };
    checkLogin();
  }, [navigate]);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setName(data.full_name || "");
        setProvince(data.province || "");
      }
    };
    fetchProfile();
  }, []);

  // Current weather
  useEffect(() => {
    if (!province) return;
    axios
      .get(`${API_BASE_URL}/api/weather`, {
        params: { city: `${province}, Viet Nam` },
      })
      .then((res) => {
        setpTemperature(res.data.temp_c);
        setCondition(res.data.condition);
        setIconUrl("https:" + res.data.icon);
      })
      .catch(console.error);
  }, [province]);

  // Forecast
  useEffect(() => {
    if (!province) return;
    axios
      .get(`${API_BASE_URL}/api/weather/forecast`, {
        params: { city: `${province}, Viet Nam` },
      })
      .then((res) => {
        setForecastList(res.data.forecast);
      })
      .catch(console.error);
  }, [province]);

  // Sensor data
  useEffect(() => {
    const fetchSensor = async () => {
      const res = await fetch(`${API_BASE_URL}/api/latest`);
      const data = await res.json();
      setTemperature(parseFloat(data.temperature));
      setHumidity(parseFloat(data.humidity));
      setSoilPercent(parseFloat(data.soilPercent) );
      setLux(parseFloat(data.lux));
      setRainValue(parseFloat(data.rainValue));
      setWindKph(parseFloat(data.windKph));

    };
    fetchSensor();
    const interval = setInterval(fetchSensor, 5000);
    return () => clearInterval(interval);
  }, []);

return (
  <div className="min-h-screen bg-slate-50">
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* Header: greeting + search + avatar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col leading-tight">
          <span className="text-slate-500 text-sm">Chào,</span>
          <span className="font-bold text-2xl text-slate-900">{name || "Trường"}</span>
        </div>
 {/* Search */}
       {/* <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 bg-white h-12 px-4 shadow-sm
                          rounded-xl border border-slate-200
                          focus-within:ring-2 focus-within:ring-slate-300
                          w-[21rem] lg:w-[27rem]">
            <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M21 20.29L16.65 15.94A7.92 7.92 0 0018 11a8 8 0 10-8 8a7.92 7.92 0 004.94-1.35L20.29 21zM4 11a7 7 0 117 7a7 7 0 01-7-7z"/>
            </svg>
            <input
              type="search"
              aria-label="Search plant"
              className="w-full bg-transparent outline-none text-base placeholder-slate-400"
              placeholder="Search plant here"
            />
          </div>
        </div> */}

      </div>

      {/* Grid main: center (8 cols) + right (4 cols) */}
      <div className="grid grid-cols-12 gap-6">
        {/* CENTER 8/12 */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Hàng trên: chart lớn + 3/4 thẻ nhỏ */}
          <div className="grid grid-cols-12 gap-6">
          {/* Trái: Weather + Rain */}
            <div className="col-span-12 lg:col-span-8">
              <div className="flex flex-col gap-6">

                {/* Weather card – standout */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-sm">
                  <div className="pointer-events-none absolute -top-12 -left-12 h-44 w-44 rounded-full bg-sky-200/40 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-14 -right-14 h-48 w-48 rounded-full bg-indigo-200/40 blur-3xl" />

                  {/* Header mỏng */}
                  <div className="px-5 py-3 flex items-center justify-between border-b border-white/60">
                    <h3 className="text-base font-semibold text-slate-900">Thời tiết hiện tại</h3>
                    <div className="text-xs text-slate-600">
                      {province || "—"} • {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  {/* Body */}
                  {/* Body – center temperature */}
                  <div className="px-5 py-8 grid place-items-center text-center">
                    <div className="flex items-center gap-3">
                      {iconUrl ? (
                        <img src={iconUrl} alt="weather" className="w-12 h-12" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-200" />
                      )}
                      <div className="text-5xl font-extrabold leading-none text-slate-900">
                        {Number.isFinite(pTemperature) ? `${Math.round(pTemperature)}°C` : "—"}
                      </div>
                    </div>
                    <div className="mt-2 text-slate-700 text-lg">{condition || "—"}</div>
                  </div>
                </div>

                {/* Rain level chart */}
                <RainLevelChart rainValue={rainValue} />
              </div>
            </div>


            {/* Phải: 4 thẻ cảm biến */}
            <div className="col-span-12 mt-6 lg:col-span-4 flex flex-col gap-4">
              <SensorCard
                label="Nhiệt độ"
                value={Number.isFinite(Number(temperature)) ? Number(temperature).toFixed(1) : "--"}
                unit="°C"
                rawValue={temperature}
                color="#ef4444"
                className="rounded-2xl overflow-hidden"
              />
              <SensorCard
                label="Độ ẩm"
                value={Number.isFinite(humidity) ? humidity.toFixed(1) : "--"}
                unit="%"
                rawValue={humidity}
                color="#3b82f6"
                className="rounded-2xl overflow-hidden"
              />
              <SensorCard
                label="Đất"
                value={Number.isFinite(soilPercent) ? soilPercent.toFixed(1) : "--"}
                unit="%"
                rawValue={soilPercent}
                color="#10b981"
                className="rounded-2xl overflow-hidden"
              />
              <SensorCard
                label="Ánh sáng"
                value={Number.isFinite(lux) ? lux.toFixed(0) : "--"}
                unit="lux"
                rawValue={lux}
                color="#a855f7"
                className="rounded-2xl overflow-hidden"
              />
            </div>
          </div>

          {/* Hàng dưới: DataChart */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <div className="rounded-none">
                <DataChart />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 4/12: Illustration + harvest schedule */}
        {/* RIGHT 4/12 */}
       <div className="col-span-12 lg:col-span-4">
          <HarvestSchedule
            province={province}
            humidity={humidity}
            soilPercent={soilPercent}
            lux= {lux}
          />
        </div>

      </div>
    </div>
  </div>
);


};

export default Monitor;
