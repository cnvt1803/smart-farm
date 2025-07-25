// Modern Smart Garden Dashboard UI
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import illustration from "../assets/farm.webp";
import SensorCard from "../components/SensorCard";
import DataChart from "../components/DataChart"; 
import RainLevelChart from "../components/RainChart";

const Monitor = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [province, setProvince] = useState("");
    const [pTemperature, setpTemperature] = useState(null);
    const [condition, setCondition] = useState("");
    const [iconUrl, setIconUrl] = useState("");
    const [forecastList, setForecastList] = useState([]);

    const [temperature, setTemperature] = useState(null);
    const [humidity, setHumidity] = useState(null);
    const [soilPercent, setSoilPercent] = useState(null);
    const [lux, setLux] = useState(null);
    const [rainValue, setRainValue] = useState(null);

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
        const fetchProfile = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok){
            setName(data.full_name || ""); 
            setProvince(data.province || "");
        } 
        };
        fetchProfile();
    }, []);

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


    useEffect(() => {
        const fetchSensor = async () => {
        const res = await fetch(`${API_BASE_URL}/api/latest`);
        const data = await res.json();
        setTemperature(parseFloat(data.temperature));
        setHumidity(parseFloat(data.humidity));
        setSoilPercent(parseFloat(data.soilPercent) * 100);
        setLux(parseFloat(data.lux));
        setRainValue(parseFloat(data.rainValue));
        };
        fetchSensor();
        const interval = setInterval(fetchSensor, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6 bg-[#F7FAFC] min-h-screen">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Smart Farm Dashboard</h2>
                    <p className="text-sm text-gray-500">Monitor your plants and environment.</p>
                </div>
            </div>
            <div className="flex gap-6">
                {/* Cột trái */}
                <div className="w-2/3 space-y-6 pr-4">
                    {/* Weather + Illustration */}
                    <div className="bg-blue-50 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-semibold text-blue-700">Hello, {name} 👋 </h3>
                            <p className="text-gray-600">Always be meticulous when taking care of your smart garden.</p>
                           <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
                                <div className="flex items-center gap-7 mb-3 text-gray-500 text-sm">
                                    <span>📅 {new Date().toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>📍{province}</span>
                                </div>
                                <div className="flex gap-4 text-sm text-gray-700">
                                    <span>🌱 Plants: 8</span>
                                    <span>•</span>
                                    <span>📡 Sensors: 5 active</span>
                                </div>
                            </div>
                        </div>
                        <img src={illustration} alt="Garden" className="w-64 h-auto rounded-xl" />
                    </div>
                    {/* Sensor Cards */}
                    <div className="bg-gray-50 rounded-2xl shadow-md p-6 w-full">
                        <h3 className="text-lg font-semibold text-gray-700">Sensor Data</h3>
                        <div className="mt-4 px-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                                <SensorCard
                                    label="Temperature"
                                    value={temperature ?? "--"}
                                    unit="°C"
                                    rawValue={temperature}
                                    color="#ef4444"
                                />
                                <SensorCard
                                    label="Humidity"
                                    value={humidity ?? "--"}
                                    unit="%"
                                    rawValue={humidity}
                                    color="#3b82f6"
                                />
                                <SensorCard
                                    label="Lux"
                                    value={lux ?? "--"}
                                    unit="lux"
                                    rawValue={lux / 1000}
                                    color="#a855f7"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <DataChart />
                    </div>
                </div>

                {/* Đường kẻ giữa */}
                <div className="w-px bg-gray-300 mx-2" />
                
                {/* Cột phải  */}
                <div className="w-1/3 space-y-6 pl-4">
                    <div className="bg-white rounded-2xlshadow-md p-6 w-full">
                        {/* Current Weather */}
                        <div className="mb-6">
                            <div className="bg-gray-100 rounded-2xl mb-4 shadow-md p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">Current Weather</h3>
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="text-4xl font-bold text-blue-600">{pTemperature}°C</div>
                                    <div className="flex items-center gap-2 text-gray-600 text-lg">
                                        <span>{condition}</span>
                                        {iconUrl && <img src={iconUrl} className="w-6 h-6" alt="weather" />}
                                    </div>
                                </div>
                            </div>

                           <ul className="divide-y divide-gray-200 rounded-xl overflow-hidden shadow-md border mb-4">
                                {forecastList.map((item) => {
                                    const date = new Date(item.date);
                                    const formattedDate = date.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    });

                                    return (
                                    <li
                                        key={item.date}
                                        className="flex items-center justify-between bg-white px-4 py-3 hover:bg-gray-50 transition-all"
                                    >
                                        {/* Left: Date */}
                                        <div className="text-gray-600 text-sm font-medium w-1/3">{formattedDate}</div>

                                        {/* Right: Icon + Temp + Condition */}
                                        <div className="flex items-center gap-2 w-2/3 justify-end">
                                        <img
                                            src={`https:${item.icon}`}
                                            alt={item.condition}
                                            className="w-7 h-7 shrink-0"
                                        />
                                        <span className="text-gray-800 font-semibold w-[48px] text-right">
                                            {Math.round(item.avg_temp_c)}°C
                                        </span>
                                        <span className="text-gray-500 text-sm hidden sm:inline w-[140px] truncate">
                                            {item.condition}
                                        </span>
                                        </div>
                                    </li>
                                );
                            })}
                            </ul> 
                        </div>

                        {/* Soil Information */}
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-2">Soil Information</h3>
                            {/* Hiển thị soilPercent nổi bật */}
                            <div className="bg-green-50 border border-green-300 rounded-lg p-3 mb-2">
                                <p className="text-3xl font-bold text-green-700">
                                    Soil Moisture: {soilPercent ?? "--"}%
                                </p>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-2">Rain Information</h3>
                            <RainLevelChart rainValue={rainValue} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Monitor;
