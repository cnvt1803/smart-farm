import { useState, useEffect, } from "react";
import { supabase } from "../components/supabaseClient";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import image from "../assets/farm.webp"; 

const DashboardOverview = () => {
  const navigate = useNavigate();


  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [soilPercent, setSoilPercent] = useState(null);
  const [lux, setLux] = useState(null);
  const [rainValue, setRainValue] = useState(null);

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  useEffect(() => {
    const checkLogin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkLogin();
  }, [navigate]);


  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/latest");
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
    <div className="bg-blue-50">
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>


      <div className="flex bg-blue-50 flex-grow relative">
        {/* Sidebar */}
        <div className={`transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-0"}`}>
          <div className={`h-full bg-blue-100 text-blue-800 border-r-4 border-blue-200 ${isSidebarOpen ? "p-4" : "p-0"}`}>
            {isSidebarOpen && <Sidebar activeItem="monitor" />}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-[10vh] z-30 bg-blue-50 px-2 py-1 rounded-r shadow hover:bg-blue-100 transition
            ${isSidebarOpen ? "left-[256px]" : "left-2"}`}
        >
          {isSidebarOpen ? "◀" : "▶"}
        </button>

        {/* Main content */}
        <div className="flex-1 p-6 pt-[12vh] flex flex-col gap-6">
          {/* Welcome card */}
          <div className="bg-gradient-to-r from-blue-100 to-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="ml-16 flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-blue-700">Hello, Truong 👋</h2>
            <p className="text-gray-700">Always be meticulous when taking care of your smart garden.</p>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-blue-800 text-lg">
                <span>🌡️</span>
                <span>{temperature}°C Outdoor Temperature</span>
              </div>
              <div className="flex items-center gap-2 text-blue-800 text-lg">
                <span>☁️</span>
                <span>Fuzzy cloudy weather</span>
              </div>
            </div>
          </div>
        <div className="mr-10 flex-shrink-0">
          <img
            src={image}
            alt="Garden"
            className="w-80 h-auto rounded-2xl shadow-xl object-contain"
          />
        </div>
        
      </div>

          {/* Sensor feature cards */}
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
                  : selectedFeature === "Rain"
                  ? `${rainValue.toFixed(1)} mm`
                  : ""}
              </span>
            </div>
          </div>
        )}


        </div>

      </div>

      <Footer />
    </div>
  );
};

export default DashboardOverview;
