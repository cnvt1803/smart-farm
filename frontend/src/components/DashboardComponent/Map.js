import React, { useState, useEffect } from 'react'
import { getInfo } from '../../data/data.js'
import { FaMapMarkerAlt, FaLeaf, FaExclamationTriangle, FaMapPin, FaGlobeAsia } from 'react-icons/fa'

const Map = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getInfo();
        setData(result);
        console.log("Map data:", result);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Parse location to coordinates if possible, otherwise generate consistent position
  const getPositionForFarm = (farm, index) => {
    // Check if location contains coordinates (lat, lng format)
    const coordinateMatch = farm.location?.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    
    if (coordinateMatch) {
      // Convert real coordinates to map position (simplified conversion)
      const lat = parseFloat(coordinateMatch[1]);
      const lng = parseFloat(coordinateMatch[2]);
      
      // Simple conversion for Vietnam region (approximate)
      // Vietnam latitude: ~8° to 23°N, longitude: ~102° to 110°E
      const x = Math.max(10, Math.min(90, ((lng - 102) / 8) * 80 + 10));
      const y = Math.max(10, Math.min(80, ((23 - lat) / 15) * 70 + 10));
      
      return {
        left: `${x}%`,
        top: `${y}%`,
        isReal: true
      };
    }
    
    // Generate consistent position based on farm name and location
    const farmSeed = farm.farm_name + (farm.location || '');
    const seed = farmSeed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Use location name to influence position
    let regionSeed = 0;
    if (farm.location) {
      const location = farm.location.toLowerCase();
      // Different regions of Vietnam get different quadrants
      if (location.includes('hà nội') || location.includes('hanoi') || location.includes('bắc')) {
        regionSeed = 1; // North
      } else if (location.includes('hồ chí minh') || location.includes('saigon') || location.includes('nam')) {
        regionSeed = 2; // South
      } else if (location.includes('đà nẵng') || location.includes('huế') || location.includes('trung')) {
        regionSeed = 3; // Central
      }
    }
    
    // Generate position based on region
    let baseX, baseY;
    switch (regionSeed) {
      case 1: // North
        baseX = 30; baseY = 20;
        break;
      case 2: // South
        baseX = 25; baseY = 70;
        break;
      case 3: // Central
        baseX = 35; baseY = 45;
        break;
      default: // Random region
        baseX = 40; baseY = 40;
    }
    
    // Add variation around the base position
    const x = baseX + (Math.abs(seed * 1234567) % 30) - 15;
    const y = baseY + (Math.abs(seed * 987654) % 25) - 12.5;
    
    return {
      left: `${Math.max(10, Math.min(85, x))}%`,
      top: `${Math.max(10, Math.min(75, y))}%`,
      isReal: false
    };
  };

  // Count error sensors for a farm
  const getErrorSensorCount = (farmId) => {
    if (!data?.sensors) return 0;
    return data.sensors.filter(sensor => 
      sensor.farm_id === farmId && sensor.status === 'error'
    ).length;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2 min-h-60 p-4 border-gray-200 border bg-stone-100 shadow-lg rounded-xl">
        <h2 className="text-2xl text-center font-bold text-gray-800">FARM LOCATIONS MAP</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2 min-h-60 p-4 border-gray-200 border bg-stone-100 shadow-lg rounded-xl">
        <h2 className="text-2xl text-center font-bold text-gray-800">FARM LOCATIONS MAP</h2>
        <div className="flex justify-center items-center h-32">
          <p className="text-red-500">Error loading map: {error}</p>
        </div>
      </div>
    );
  }

  const farms = data?.farms || [];

  return (
    <div className="flex flex-col gap-2 min-h-60 p-4 border-gray-200 border bg-stone-100 shadow-lg rounded-xl">
      <h2 className="text-2xl text-center font-bold text-gray-800 flex items-center justify-center gap-2">
        <FaGlobeAsia className="text-blue-600" />
        FARM LOCATIONS MAP
      </h2>
      
      {farms.length > 0 ? (
        <>
          {/* Enhanced Map Area with Vietnam-like layout */}
          <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-gray-300 min-h-80 overflow-hidden">
            {/* Map Background with geographic feel */}
            <div className="absolute inset-0">
              {/* Subtle geographic features */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-green-100 to-green-200 opacity-30"></div>
              
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
              
              {/* Regional indicators */}
              <div className="absolute top-4 left-4 text-xs text-gray-500 font-medium bg-white bg-opacity-70 rounded px-2 py-1">
                Northern Region
              </div>
              <div className="absolute top-1/2 left-8 text-xs text-gray-500 font-medium bg-white bg-opacity-70 rounded px-2 py-1">
                Central Region
              </div>
              <div className="absolute bottom-8 left-4 text-xs text-gray-500 font-medium bg-white bg-opacity-70 rounded px-2 py-1">
                Southern Region
              </div>
            </div>
            
            {/* Farm Markers with Enhanced Positioning */}
            {farms.map((farm, index) => {
              const position = getPositionForFarm(farm, index);
              const errorCount = getErrorSensorCount(farm.farm_id);
              const hasErrors = errorCount > 0;
              
              return (
                <div
                  key={farm.farm_id || index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={position}
                >
                  {/* Farm Marker with enhanced styling */}
                  <div className="relative">
                    {/* Glow effect for active farms */}
                    <div className={`absolute inset-0 rounded-full ${
                      hasErrors ? 'bg-red-400' : 'bg-green-400'
                    } opacity-30 scale-150 animate-pulse`}></div>
                    
                    {/* Main marker */}
                    <div className={`relative w-12 h-12 rounded-full border-3 border-white shadow-xl flex items-center justify-center hover:scale-125 transition-all duration-300 ${
                      hasErrors 
                        ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                        : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    }`}>
                      {position.isReal && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <FaMapPin className="text-white text-xs" />
                        </div>
                      )}
                      
                      {hasErrors ? (
                        <FaExclamationTriangle className="text-white text-lg drop-shadow-md" />
                      ) : (
                        <FaLeaf className="text-white text-lg drop-shadow-md" />
                      )}
                    </div>
                    
                    {/* Error Count Badge */}
                    {hasErrors && (
                      <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white shadow-md">
                        {errorCount}
                      </div>
                    )}
                    
                    {/* Enhanced Farm Info Card */}
                    <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 p-3 min-w-48">
                      <div className="font-bold text-gray-800 text-sm mb-1">
                        {farm.farm_name}
                      </div>
                      <div className="text-gray-600 mb-2 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-gray-400" />
                        {farm.location || 'Location not specified'}
                        {position.isReal && (
                          <span className="ml-1 text-blue-600 text-xs font-bold">(GPS)</span>
                        )}
                      </div>
                      
                      {hasErrors ? (
                        <div className="text-red-600 font-medium">
                          ⚠️ {errorCount} sensor error{errorCount !== 1 ? 's' : ''}
                        </div>
                      ) : (
                        <div className="text-green-600 font-medium">
                          ✅ All systems operational
                        </div>
                      )}
                      
                      {/* Arrow pointing to marker */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Enhanced Map Legend */}
            <div className="absolute top-3 right-3 bg-white bg-opacity-95 rounded-xl p-4 text-xs shadow-xl border border-gray-200 backdrop-blur-sm">
              <div className="font-bold mb-3 text-gray-800 text-sm flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-600" />
                Map Legend
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <FaLeaf className="text-white text-xs" />
                    </div>
                  </div>
                  <span>Healthy Farm</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <FaExclamationTriangle className="text-white text-xs" />
                    </div>
                  </div>
                  <span>Farm with Issues</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <FaMapPin className="text-white text-xs" />
                    </div>
                  </div>
                  <span>GPS Location</span>
                </div>
              </div>
              
              <div className="pt-2 mt-3 border-t border-gray-200 text-gray-600">
                <div className="font-medium">Farm Count: {farms.length}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Hover over markers for details
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Farm Status Summary */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-green-700 mb-2">
                {farms.filter(farm => getErrorSensorCount(farm.farm_id) === 0).length}
              </div>
              <div className="text-green-600 font-semibold flex items-center justify-center gap-1">
                <FaLeaf className="text-sm" />
                Healthy Farms
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-red-700 mb-2">
                {farms.filter(farm => getErrorSensorCount(farm.farm_id) > 0).length}
              </div>
              <div className="text-red-600 font-semibold flex items-center justify-center gap-1">
                <FaExclamationTriangle className="text-sm" />
                Farms with Issues
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-blue-700 mb-2">
                {data?.sensors?.filter(sensor => sensor.status === 'error').length || 0}
              </div>
              <div className="text-blue-600 font-semibold flex items-center justify-center gap-1">
                <FaMapMarkerAlt className="text-sm" />
                Total Errors
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col justify-center items-center h-64 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <FaGlobeAsia className="text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-xl font-medium mb-2">No farms to display on map</p>
          <p className="text-gray-400 text-sm">Create your first farm to see it on the map</p>
        </div>
      )}
    </div>
  )
}

export default Map