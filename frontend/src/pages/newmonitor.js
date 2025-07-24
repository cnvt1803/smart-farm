// Modern Smart Garden Dashboard UI
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import soil from "../assets/soil.jpeg";
import illustration from "../assets/farm.webp";
import SensorCard from '../components/SensorCard'
const NMonitor = () => {
    const navigate = useNavigate();
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


    useEffect(() => {
        const fetchProfile = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setProvince(data.province || "");
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
            setWindKph(res.data.wind_kph);
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
                    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-semibold text-blue-700">Hello 👋</h3>
                            <p className="text-gray-600">Always be meticulous when taking care of your smart garden.</p>
                            <div className="flex items-center gap-2 text-blue-600">
                            {iconUrl && <img src={iconUrl} className="w-6 h-6" alt="weather" />} 
                            {condition} | Wind: {windKph ?? "--"} km/h
                            </div>
                            <div className="text-blue-700">🌡️ {pTemperature ?? "--"}°C Outdoor</div>
                        </div>
                        <img src={illustration} alt="Garden" className="w-64 h-auto rounded-xl" />
                    </div>
                    {/* Sensor Cards */}
                    <div className="bg-white rounded-2xl shadow-md p-6 w-full">
                        <h3 className="text-lg font-semibold text-gray-700">Sensor Data</h3>
                        <div className="mt-4 px-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                            <SensorCard
                                label="Temperature"
                                value={temperature ?? "--"}
                                unit="°C"
                                rawValue={temperature}
                                color="#f97316"
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
                </div>

                {/* Đường kẻ giữa */}
                <div className="w-px bg-gray-300 mx-2" />
                
                {/* Cột phải  */}
                <div className="w-1/3 space-y-6 pl-4">
                    <div className="bg-white rounded-2xl shadow-md p-6 w-full">
                        {/* Current Weather */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-4xl font-bold text-blue-600">22°C</div>
                                <div className="text-gray-600 text-lg">Mostly sunny</div>
                            </div>

                            {/* Date List */}
                            {/* <ul className="space-y-2 text-sm mb-3">
                                <li className="flex justify-between text-gray-700">
                                    <span>September 13</span>
                                    <span className="font-medium">22°C Sunny</span>
                                </li>
                                <li className="flex justify-between text-gray-700">
                                    <span>September 14</span>
                                    <span className="font-medium">19°C Cloudy</span>
                                </li>
                                <li className="flex justify-between text-gray-700">
                                    <span>September 15</span>
                                    <span className="font-medium">22°C Clear</span>
                                </li>
                            </ul> */}
                            {/* Date List */}
                            <ul className="space-y-2 text-sm mb-3">
                            {forecastList.map((item) => {
                                const date = new Date(item.date);
                                const formattedDate = date.toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                });

                                return (
                                <li key={item.date} className="flex justify-between text-gray-700">
                                    <span>{formattedDate}</span>
                                    <span className="font-medium">
                                    {Math.round(item.avg_temp_c)}°C {item.condition}
                                    </span>
                                </li>
                                );
                            })}
                            </ul>

                            { /* Rain Information */}
                            <div className="border-t pt-2">
                                <h3 className="text-lg font-semibold mb-2">Rain Information</h3>
                                <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 mb-2">
                                    <p className="text-3xl font-bold text-blue-700">
                                        Rain: {rainValue?.toFixed(1) ?? "--"} mm
                                    </p>
                                </div>
                            </div>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NMonitor;
