import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaWifi,
  FaTimes,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaThermometerHalf,
  FaTint,
  FaSun,
  FaLeaf,
  FaEye,
  FaCog,
  FaSignal,
  FaBuilding,
  FaIdCard,
  FaTag
} from 'react-icons/fa';
import { getSensorInfo, getFarmInfo } from '../data/data';

const Sensor = () => {
  const { farmId, sensorId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [sensorData, setSensorData] = useState(null);
  const [farmData, setFarmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon mapping for sensor types with larger icons for hero display
  const getSensorIcon = (type, size = "w-12 h-12") => {
    const iconMap = {
      'Temperature': <FaThermometerHalf className={size} />,
      'Humidity': <FaTint className={size} />,
      'Light': <FaSun className={size} />,
      'Lux': <FaSun className={size} />,
      'Soil Moisture': <FaLeaf className={size} />,
      'Soil': <FaLeaf className={size} />,
      'Rain': <FaEye className={size} />,
      'pH': <FaCog className={size} />,
      'Pressure': <FaSignal className={size} />,
      'Wind': <FaSignal className={size} />
    };
    return iconMap[type] || <FaCog className={size} />;
  };

  // Status configuration
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return {
          color: 'text-green-600 bg-green-100',
          icon: <FaCheckCircle className="w-4 h-4" />,
          text: 'Normal'
        };
      case 'warning':
        return {
          color: 'text-yellow-600 bg-yellow-100',
          icon: <FaExclamationTriangle className="w-4 h-4" />,
          text: 'Warning'
        };
      case 'error':
        return {
          color: 'text-red-600 bg-red-100',
          icon: <FaExclamationTriangle className="w-4 h-4" />,
          text: 'Error'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          icon: <FaInfoCircle className="w-4 h-4" />,
          text: 'Unknown'
        };
    }
  };

  // Connectivity configuration
  const getConnectivityConfig = (connectivity) => {
    return connectivity?.toLowerCase() === 'online' ? {
      color: 'text-green-600 bg-green-100',
      icon: <FaWifi className="w-3 h-3" />,
      text: 'Online'
    } : {
      color: 'text-red-600 bg-red-100',
      icon: <FaTimes className="w-3 h-3" />,
      text: 'Offline'
    };
  };

  // Format time helper
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      return new Date(timeString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timeString;
    }
  };

  // Get farm name from farm data or sensor data
  const getFarmName = () => {
    return farmData?.farm_name || farmData?.name || sensorData?.farm_name || 'Unknown Farm';
  };

  // Fetch sensor and farm data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch sensor data
        const sensorResult = await getSensorInfo(sensorId);
        if (sensorResult) {
          setSensorData(sensorResult.sensor);
          
          // Fetch farm data if farmId is available in URL or sensor data
          const farmIdToUse = farmId || sensorResult.farm_id;
          if (farmIdToUse) {
            try {
              const farmResult = await getFarmInfo(farmIdToUse);
              setFarmData(farmResult.farm);
            } catch (farmError) {
              console.warn('Could not fetch farm data:', farmError);
            }
          }
        }
        
      } catch (err) {
        setError('Failed to load sensor information');
        console.error('Error fetching sensor data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sensorId) {
      fetchData();
    }
  }, [sensorId, farmId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading sensor information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-xl font-medium">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(sensorData?.status);
  const connectivityConfig = getConnectivityConfig(sensorData?.connectivity);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="flex flex-col container mx-auto px-4 py-8 max-w-6xl gap-8">
        {/* Header Navigation */}
        <div className="flex flex-row p-2 gap-1 text-lg">
          <a href="/dashboard" className="text-black hover:text-blue-500">
            Dashboard 
          </a>
          /
          <a href={`/dashboard/${farmId}`} className="text-black hover:text-blue-500">
            {farmData?.farm_name || 'Unknown Farm'}
          </a>
          /
          <a href={`/dashboard/${farmId}/${sensorId}`} className="text-black hover:text-blue-500">
            {sensorData?.sensor_name || 'Unknown Sensor'}
          </a>
        </div>

        {/* Hero Section - Product Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="relative bg-gradient-to-r from-blue-600 to-green-600 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                  {getSensorIcon(sensorData?.sensor_type || sensorData?.type)}
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {sensorData?.sensor_name || sensorData?.name || 'Unknown Sensor'}
                  </h1>
                  <p className="text-xl text-blue-100 mb-1">
                    {sensorData?.sensor_type || sensorData?.type || 'Unknown Type'} Sensor
                  </p>
                  <p className="text-blue-100 flex items-center gap-2">
                    <FaMapMarkerAlt className="w-4 h-4" />
                    {sensorData?.location || 'Location not specified'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${connectivityConfig.color} bg-opacity-90 backdrop-blur-sm`}>
                  {connectivityConfig.icon}
                  {connectivityConfig.text}
                </span>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusConfig.color} bg-opacity-90 backdrop-blur-sm`}>
                  {statusConfig.icon}
                  {statusConfig.text}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sensor Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Technical Specifications */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <FaInfoCircle className="w-6 h-6 text-blue-600" />
              Technical Specifications
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaIdCard className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500">Sensor ID</label>
                  </div>
                  <p className="text-lg font-mono font-semibold text-gray-800">
                    {sensorData?.sensor_id || sensorData?.id || 'N/A'}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTag className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500">Type</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {sensorData?.sensor_type || sensorData?.type || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaBuilding className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-500">Farm</label>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {getFarmName()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-500">Location</label>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {sensorData?.location || 'Location not specified'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Status & Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <FaClock className="w-6 h-6 text-blue-600" />
              Status & Timeline
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaWifi className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500">Connectivity</label>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${connectivityConfig.color}`}>
                    {connectivityConfig.icon}
                    {connectivityConfig.text}
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheckCircle className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500">Status</label>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {statusConfig.text}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaClock className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {formatTime(sensorData?.latest_updated || sensorData?.lastUpdate)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-500">Created</label>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {formatTime(sensorData?.create_at || sensorData?.createAt)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaInfoCircle className="w-6 h-6 text-blue-600" />
            Additional Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaExternalLinkAlt className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500">Data Source</label>
              </div>
              {sensorData?.link ? (
                <a 
                  href={sensorData.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
                >
                  View External Data Source
                </a>
              ) : (
                <p className="text-gray-500 italic">No external data source configured</p>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaCog className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500">System Logs</label>
              </div>
              <p className="text-gray-800 text-sm leading-relaxed">
                {sensorData?.logs || sensorData?.log || 'No system logs available'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Sensor;