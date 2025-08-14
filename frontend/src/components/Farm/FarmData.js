import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  FaCog,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
  FaChartLine,
  FaTable,
  FaTrash,
  FaWifi,
  FaTimes
} from 'react-icons/fa';

const FarmData = ({ 
  sensors, 
  chartData, 
  selectedPeriod, 
  onPeriodChange, 
  onEditSensor, 
  onDeleteSensor,
  farmData 
}) => {
  const [activeTab, setActiveTab] = useState('sensors');
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal': return <FaCheckCircle className="w-4 h-4" />;
      case 'error': return <FaExclamationTriangle className="w-4 h-4" />;
      case 'warning': return <FaExclamationTriangle className="w-4 h-4" />;
      default: return <FaInfoCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      return new Date(timeString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timeString;
    }
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm mb-6 w-full">
        <button
          onClick={() => setActiveTab('sensors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
            activeTab === 'sensors'
              ? 'bg-blue-100 text-blue-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FaTable className="w-4 h-4" />
          Sensor Management
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
            activeTab === 'analytics'
              ? 'bg-blue-100 text-blue-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FaChartLine className="w-4 h-4" />
          Analytics
        </button>
      </div>

      {/* Sensors Management Tab */}
      {activeTab === 'sensors' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden w-full"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaTable className="w-5 h-5 text-blue-600" />
              Sensor List
            </h2>
            <p className="text-gray-600 mt-1">Manage and monitor all sensors in this farm</p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[1800px] table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] w-32">
                    Sensor ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] w-48">
                    Sensor Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    Sensor Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
                    Farm Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    Section
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                    Connectivity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
                    Latest Updated
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Logs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Link
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    Action Menu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sensors && sensors.length > 0 ? (
                  sensors.map((sensor, index) => {
                    const sensorKey = sensor.sensor_id || sensor.id || `sensor-${index}`;
                    return (
                      <motion.tr
                        key={sensorKey}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                      {/* Sensor ID */}
                      <td className="px-4 py-4 whitespace-nowrap min-w-[120px] w-32">
                        <div className="text-sm font-medium text-gray-900">
                          {sensor.sensor_id || sensor.id}
                        </div>
                      </td>

                      {/* Sensor Name */}
                      <td className="px-4 py-4 whitespace-nowrap min-w-[180px] w-48">
                        <div className="text-sm font-medium text-gray-900">
                          {sensor.sensor_name || sensor.name}
                        </div>
                      </td>

                      {/* Sensor Type */}
                      <td className="px-4 py-4 whitespace-nowrap w-40">
                        <div className="text-sm text-gray-900">
                          {sensor.sensor_type || sensor.type}
                        </div>
                      </td>

                      {/* Farm Name */}
                      <td className="px-4 py-4 whitespace-nowrap w-44">
                        <div className="text-sm text-gray-900">
                          {sensor.farm_name || farmData?.name || 'Unknown Farm'}
                        </div>
                      </td>

                      {/* Section */}
                      <td className="px-4 py-4 whitespace-nowrap w-40">
                        <div className="text-sm text-gray-900">
                          {sensor.location || sensor.section || 'N/A'}
                        </div>
                      </td>

                      {/* Connectivity */}
                      <td className="px-4 py-4 whitespace-nowrap w-36">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          (sensor.connectivity && sensor.connectivity.toLowerCase() === 'online')
                            ? 'text-green-600 bg-green-100' 
                            : 'text-red-600 bg-red-100'
                        }`}>
                          {(sensor.connectivity && sensor.connectivity.toLowerCase() === 'online') ? (
                            <FaWifi className="w-3 h-3" />
                          ) : (
                            <FaTimes className="w-3 h-3" />
                          )}
                          {sensor.connectivity || 'offline'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap w-32">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sensor.status)}`}>
                          {getStatusIcon(sensor.status)}
                          {sensor.status ? sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1) : 'Unknown'}
                        </span>
                      </td>

                      {/* Latest Updated */}
                      <td className="px-4 py-4 whitespace-nowrap w-44">
                        <div className="text-sm text-gray-500">
                          {sensor.latest_updated ? formatTime(sensor.latest_updated) : 
                           sensor.lastUpdate ? formatTime(sensor.lastUpdate) : 'N/A'}
                        </div>
                      </td>

                      {/* Logs */}
                      <td className="px-4 py-4 w-64">
                        <div className="text-sm text-gray-500 break-words" title={sensor.logs || 'No logs available'}>
                          {sensor.log || 'No logs available'}
                        </div>
                      </td>

                      {/* Link */}
                      <td className="px-4 py-4 whitespace-nowrap w-32">
                        {sensor.link ? (
                          <a 
                            href={sensor.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            View Link
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-4 whitespace-nowrap w-44">
                        <div className="text-sm text-gray-500">
                          {sensor.createAt ? formatTime(sensor.createAt) : 'N/A'}
                        </div>
                      </td>

                      {/* Action Menu */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium w-40">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/dashboard/${sensor.farm_id}/${sensor.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <FaInfoCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onEditSensor(sensor)}
                            className="text-yellow-600 hover:text-yellow-900 p-2 rounded-md hover:bg-yellow-50 transition-colors"
                            title="Edit Sensor"
                          >
                            <FaCog className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onDeleteSensor(sensor.sensor_id || sensor.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete Sensor"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="12" className="px-6 py-8 text-center">
                      <div className="text-gray-500">
                        <FaTable className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No sensors found</p>
                        <p className="text-sm">Add sensors to start monitoring your farm</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Chart Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaChartLine className="w-5 h-5 text-blue-600" />
                  Device Status Analytics
                </h2>
                <p className="text-gray-600 mt-1">Track error and normal devices over time</p>
              </div>
              
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => onPeriodChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>

            {/* Chart */}
            <div className="h-80">
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="errorGradientChart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="normalGradientChart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      fontSize={12}
                      tick={{ fill: '#6b7280' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tick={{ fill: '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="error"
                      stackId="1"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#errorGradientChart)"
                      name="Error Devices"
                    />
                    <Area
                      type="monotone"
                      dataKey="normal"
                      stackId="1"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fill="url(#normalGradientChart)"
                      name="Normal Devices"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <FaChartLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No chart data available</p>
                    <p className="text-sm text-gray-400">Chart data will appear here when available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Devices</p>
                  <p className="text-2xl font-bold text-gray-800">{farmData?.sensors_count || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaTable className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Devices</p>
                  <p className="text-2xl font-bold text-green-600">{farmData?.normal_sensors || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaCheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Issues Detected</p>
                  <p className="text-2xl font-bold text-red-600">{farmData?.error_sensors || 0}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FarmData;
