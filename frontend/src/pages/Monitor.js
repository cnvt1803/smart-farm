import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import image from "../assets/farm.webp";
import axios from "axios";
const Monitor = () => {
  const navigate = useNavigate();
  const [province, setProvince] = useState("");
  const [pTemperature, setpTemperature] = useState(null);
  const [condition, setCondition] = useState(""); 
  const [iconUrl, setIconUrl] = useState("");
  const [windKph, setWindKph] = useState(null);

  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [soilPercent, setSoilPercent] = useState(null);
  const [lux, setLux] = useState(null);
  const [rainValue, setRainValue] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

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
        console.error("Lỗi xác thực:", err);
        navigate("/login");
      }
    };

    checkLogin();
  }, [navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data) {
          setProvince(data.province || "");
        }
      } catch (err) {
        console.error("Error loading user information:", err);
      } finally {
       
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!province) return;

    const fetchWeather = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/weather`, {
          params: { city: `${province}, Viet Nam` },
        });
        setpTemperature(res.data.temp_c);
        setCondition(res.data.condition);
        setIconUrl("https:" + res.data.icon); 
        setWindKph(res.data.wind_kph);
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };

    fetchWeather();
  }, [province]);
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/latest`);
        const data = await res.json();

        setTemperature(parseFloat(data.temperature));
        setHumidity(parseFloat(data.humidity));
        setSoilPercent(parseFloat(data.soilPercent) * 100);
        setLux(parseFloat(data.lux));
        setRainValue(parseFloat(data.rainValue));
      } catch (error) {
        console.error("Failed to fetch sensor data:", error);
      }
    };

    fetchSensorData();

    const interval = setInterval(fetchSensorData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6 ">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-100 to-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="ml-16 flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-blue-700">Hello 👋</h2>
          <p className="text-gray-700">Always be meticulous when taking care of your smart garden.</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-blue-800 text-lg">
              {iconUrl && <img src={iconUrl} alt="Weather icon" className="w-6 h-6" />}
              <span>
                {condition || "Loading weather..."} | Wind: {windKph !== null ? `${windKph} km/h` : "--"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-blue-800 text-lg">
              <span>🌡️</span>
              <span>
                {temperature !== null ? `${pTemperature}°C` : "--"} Outdoor Temperature
              </span>
            </div>
          </div>
        </div>

        <div className="mr-10 flex-shrink-0">
          <img src={image} alt="Garden" className="w-80 h-auto rounded-2xl shadow-xl object-contain" />
        </div>
      </div>

      {/* Sensor Controls */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Sensor Controls</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {["Temperature", "Humidity", "Soil", "Lux", "Rain"].map((label) => (
            <button
              key={label}
              onClick={() => setSelectedFeature(label)}
              className={`flex flex-col items-center justify-center rounded-lg p-4 border shadow hover:bg-blue-100 transition ${
                selectedFeature === label ? "bg-blue-500 text-white" : "bg-gray-50"
              }`}
            >
              <span className="text-3xl">
                {label === "Temperature" && "🌡️"}
                {label === "Humidity" && "💧"}
                {label === "Soil" && "🌱"}
                {label === "Lux" && "☀️"}
                {label === "Rain" && "🌧️"}
              </span>
              <p className="mt-2 text-sm">{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Sensor Detail */}
      {selectedFeature && (
        <div className="bg-white rounded-xl p-6 shadow flex flex-col items-center">
          <h4 className="text-lg font-semibold mb-4">{selectedFeature} Information</h4>

          <div className="w-60 h-60 rounded-full bg-gradient-to-br from-blue-100 to-white shadow-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-700">
              {(selectedFeature === "Temperature" && temperature === null) ||
              (selectedFeature === "Humidity" && humidity === null) ||
              (selectedFeature === "Soil" && soilPercent === null) ||
              (selectedFeature === "Lux" && lux === null) ||
              (selectedFeature === "Rain" && rainValue === null)
                ? "Loading..."
                : selectedFeature === "Temperature"
                ? `${temperature}°C`
                : selectedFeature === "Humidity"
                ? `${humidity}%`
                : selectedFeature === "Soil"
                ? `${soilPercent.toFixed(0)}%`
                : selectedFeature === "Lux"
                ? `${lux} lux`
                : `${rainValue.toFixed(1)} mm`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Monitor;
