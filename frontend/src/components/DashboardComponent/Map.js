import React, { useState, useEffect } from 'react'
import { getInfo } from '../../data/data.js'
import { FaMapMarkerAlt, FaLeaf, FaExclamationTriangle } from 'react-icons/fa'

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

  // Generate random positions for farms on a blank map
  const generateRandomPosition = (index, farmId) => {
    // Use farm ID as seed for consistent positioning
    const seed = farmId ? farmId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0) : index;
    
    // Create pseudo-random but consistent positions
    const x = 15 + (Math.abs(seed * 1234567) % 70); // 15% to 85% from left
    const y = 15 + (Math.abs(seed * 987654) % 60); // 15% to 75% from top
    
    return {
      left: `${x}%`,
      top: `${y}%`
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
      <h2 className="text-2xl text-center font-bold text-gray-800">FARM LOCATIONS MAP</h2>
      
      {farms.length > 0 ? (
        <>
          {/* Blank Map Area with Random Farm Markers */}
          <div className="relative bg-gray-100 rounded-lg border-2 border-gray-300 min-h-64 overflow-hidden">
            {/* Map Background with subtle grid */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
            </div>
            
            {/* Farm Markers with Random Positions */}
            {farms.map((farm, index) => {
              const position = generateRandomPosition(index, farm.farm_id);
              const errorCount = getErrorSensorCount(farm.farm_id);
              const hasErrors = errorCount > 0;
              
              return (
                <div
                  key={farm.farm_id || index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={position}
                >
                  {/* Farm Marker */}
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 ${
                      hasErrors 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}>
                      {hasErrors ? (
                        <FaExclamationTriangle className="text-white text-sm" />
                      ) : (
                        <FaLeaf className="text-white text-sm" />
                      )}
                    </div>
                    
                    {/* Error Count Badge */}
                    {hasErrors && (
                      <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {errorCount}
                      </div>
                    )}
                    
                    {/* Farm Name Label */}
                    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-md border text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      {farm.farm_name}
                      {(hasErrors && (
                        <div className="text-red-600 text-xs">
                          {errorCount} error{errorCount !== 1 ? 's' : ''}
                        </div>
                      )) || <div className="text-green-600 text-xs">No Issues</div>}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Map Legend */}
            <div className="absolute top-3 right-3 bg-white bg-opacity-95 rounded-lg p-3 text-xs shadow-md">
              <div className="font-bold mb-2 text-gray-800">Legend</div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <FaLeaf className="text-white text-xs" />
                </div>
                <span>Healthy Farm</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-white text-xs" />
                </div>
                <span>Farm with Errors</span>
              </div>
              <div className="pt-1 border-t border-gray-200 text-gray-600">
                Total: {farms.length} farms
              </div>
            </div>
          </div>

          {/* Farm Status Summary */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {farms.filter(farm => getErrorSensorCount(farm.farm_id) === 0).length}
              </div>
              <div className="text-green-600 font-medium">Healthy Farms</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-700 mb-1">
                {farms.filter(farm => getErrorSensorCount(farm.farm_id) > 0).length}
              </div>
              <div className="text-red-600 font-medium">Farms with Issues</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {data?.sensors?.filter(sensor => sensor.status === 'error').length || 0}
              </div>
              <div className="text-blue-600 font-medium">Total Errors</div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col justify-center items-center h-32 text-center">
          <FaMapMarkerAlt className="text-4xl text-gray-300 mb-2" />
          <p className="text-gray-500 text-lg">No farms to display on map</p>
          <p className="text-gray-400 text-sm">Create your first farm to see it on the map</p>
        </div>
      )}
    </div>
  )
}

export default Map