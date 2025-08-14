import React, { useState, useEffect } from 'react'
import { getInfo } from '../../data/data.js'
import { FaClock, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'

const Logs = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getInfo();
        setData(result);
        console.log("Logs data:", result);
        
        // Process sensor logs
        if (result?.sensors && result?.farms) {
          const processedLogs = result.sensors
            .filter(sensor => sensor.logs && sensor.logs.trim() !== '') // Only sensors with logs
            .map(sensor => {
              // Find the farm name for this sensor
              const farm = result.farms.find(f => f.farm_id === sensor.farm_id);
              return {
                sensor_id: sensor.sensor_id,
                sensor_name: sensor.sensor_name,
                farm_name: farm ? farm.farm_name : 'Unknown Farm',
                farm_id: sensor.farm_id,
                logs: sensor.logs,
                latest_updated: sensor.latest_updated,
                status: sensor.status,
                connectivity: sensor.connectivity
              };
            })
            .sort((a, b) => new Date(b.latest_updated) - new Date(a.latest_updated)); // Sort by latest first
          
          setLogs(processedLogs);
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-refresh every 30 seconds to get latest logs
  useEffect(() => {
    const fetchDataForRefresh = async () => {
      try {
        const result = await getInfo();
        setData(result);
        
        // Process sensor logs
        if (result?.sensors && result?.farms) {
          const processedLogs = result.sensors
            .filter(sensor => sensor.logs && sensor.logs.trim() !== '') // Only sensors with logs
            .map(sensor => {
              // Find the farm name for this sensor
              const farm = result.farms.find(f => f.farm_id === sensor.farm_id);
              return {
                sensor_id: sensor.sensor_id,
                sensor_name: sensor.sensor_name,
                farm_name: farm ? farm.farm_name : 'Unknown Farm',
                farm_id: sensor.farm_id,
                logs: sensor.logs,
                latest_updated: sensor.latest_updated,
                status: sensor.status,
                connectivity: sensor.connectivity
              };
            })
            .sort((a, b) => new Date(b.latest_updated) - new Date(a.latest_updated)); // Sort by latest first
          
          setLogs(processedLogs);
        }
      } catch (err) {
        console.error("Error refreshing logs:", err);
      }
    };

    const interval = setInterval(() => {
      fetchDataForRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getLogIcon = (status) => {
    switch (status) {
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'normal':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatLogTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2 min-h-60 p-3 border border-gray-200 rounded-lg bg-white shadow-xl">
        <h2 className="text-2xl text-center font-bold">SENSOR LOGS</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2 min-h-60 p-3 border rounded-lg bg-white shadow-xl">
        <h2 className="text-2xl text-center font-bold">SENSOR LOGS</h2>
        <div className="flex justify-center items-center h-32">
          <p className="text-red-500">Error loading logs: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 min-h-60 p-3 border rounded-lg bg-white shadow-xl ">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">SENSOR LOGS</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaClock className="animate-spin" />
          <span>Auto-refreshing</span>
        </div>
      </div>
      
      {logs.length > 0 ? (
        <>
          {/* Logs Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider w-1/4">
                    Sensor Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider w-1/4">
                    Farm
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider w-1/2">
                    Logs
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {logs.map((log, index) => (
                  <tr 
                    key={log.sensor_id || index} 
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      index === 0 ? 'bg-blue-50' : '' // Highlight the most recent log
                    }`}
                  >
                    {/* Sensor Name Column */}
                    <td className="px-4 py-3 whitespace-nowrap w-1/4">
                      <div className="flex items-center gap-2">
                        {getLogIcon(log.status)}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {log.sensor_name}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatLogTime(log.latest_updated)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Farm Column */}
                    <td className="px-4 py-3 whitespace-nowrap w-1/4">
                      <div className="text-sm text-gray-900 font-medium truncate">
                        {log.farm_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        ID: {log.farm_id?.slice(0, 8)}...
                      </div>
                    </td>
                    
                    {/* Logs Column */}
                    <td className="px-4 py-3 w-1/2">
                      <div className="text-sm text-gray-900">
                        <div className="break-words line-clamp-2" title={log.logs}>
                          {log.logs}
                        </div>
                        {log.logs.length > 50 && (
                          <button className="text-blue-600 hover:text-blue-800 text-xs mt-1">
                            Read more...
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex flex-col justify-center items-center h-32 text-center">
          <FaInfoCircle className="text-4xl text-gray-300 mb-2" />
          <p className="text-gray-500 text-lg">No sensor logs available</p>
          <p className="text-gray-400 text-sm">Logs will appear here when sensors report activity</p>
        </div>
      )}
    </div>
  )
}

export default Logs