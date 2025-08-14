import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';
import { 
  getInfo, 
  createSensor, 
  updateFarmInfo, 
  updateSensorInfo, 
  updateSensorData, 
  deleteSensor, 
  getAnalytics 
} from '../data/data';
import FarmInfo from '../components/Farm/FarmInfo';
import FarmData from '../components/Farm/FarmData';

const Farm = () => {
  const { farmId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [farmData, setFarmData] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [chartData, setChartData] = useState([]);
  
  // Modal states
  const [showAddSensorModal, setShowAddSensorModal] = useState(false);
  const [showEditFarmModal, setShowEditFarmModal] = useState(false);
  const [showEditSensorModal, setShowEditSensorModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data states
  const [farmFormData, setFarmFormData] = useState({
    farm_name: '',
    location: ''
  });
  
  const [sensorFormData, setSensorFormData] = useState({
    sensor_name: '',
    sensor_type: '',
    location: '',
    connectivity: 'offline',
    status: 'normal',
    link: ''
  });

  // Fetch analytics data from API
  const fetchAnalyticsData = async (farmId, period) => {
    try {
      const analyticsResult = await getAnalytics(farmId, period);
      return analyticsResult?.analytics || [];
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return generateFallbackChartData(period);
    }
  };

  // Generate fallback chart data when API is not available
  const generateFallbackChartData = (period) => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const errorDevices = Math.floor(Math.random() * 3) + 1;
      const normalDevices = Math.floor(Math.random() * 10) + 5;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString().split('T')[0],
        error: errorDevices,
        normal: normalDevices,
        total: errorDevices + normalDevices
      });
    }
    
    return data;
  };

  // Function to refresh data without page reload
  const refreshData = async () => {
    try {
      const result = await getInfo();
      console.log("Refreshed API Data:", result);
      
      // Find the specific farm by ID
      let currentFarm = null;
      if (result.farms?.length > 0) {
        currentFarm = result.farms.find(farm => farm.farm_id === farmId) || result.farms[0];
      }
      
      if (currentFarm) {
        const farmInfo = {
          id: currentFarm.farm_id || currentFarm.id,
          name: currentFarm.farm_name || currentFarm.name || 'Unknown Farm',
          location: currentFarm.location || 'Unknown Location',
          sensors_count: currentFarm.sensors_count || 0,
          normal_sensors: currentFarm.normal_sensors || 0,
          error_sensors: currentFarm.error_sensors || 0
        };
        setFarmData(farmInfo);
      }
      
      // Filter sensors for this farm
      const farmSensors = result.sensors?.filter(sensor => 
        sensor.farm_id === farmId || sensor.farmId === farmId
      ) || [];
      
      // Sort sensors by latest update time (newest first)
      const sortedSensors = farmSensors.sort((a, b) => {
        const dateA = new Date(a.latest_updated || a.create_at || 0);
        const dateB = new Date(b.latest_updated || b.create_at || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      setSensors(sortedSensors);
      console.log("Refreshed sensors:", sortedSensors);
      
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        setLoading(true);
        
        const result = await getInfo();
        console.log("API Data:", result);
        
        // Find the specific farm by ID
        let currentFarm = null;
        if (result.farms?.length > 0) {
          currentFarm = result.farms.find(farm => farm.farm_id === farmId) || result.farms[0];
        }
        
        if (currentFarm) {
          const farmInfo = {
            id: currentFarm.farm_id || currentFarm.id,
            name: currentFarm.farm_name,
            location: currentFarm.location || 'Unknown Location',
            created: currentFarm.create_at 
              ? new Date(currentFarm.create_at).toLocaleDateString() 
              : '2024-01-01',
            sensors_count: 0,
            error_sensors: 0,
            normal_sensors: 0,
            warning_sensors: 0
          };
          
          setFarmData(farmInfo);
          setFarmFormData({
            farm_name: currentFarm.farm_name || '',
            location: currentFarm.location || ''
          });
        }
        
        // Process sensors for this farm
        if (result.sensors?.length > 0) {
          const farmSensors = result.sensors.filter(sensor => 
            sensor.farm_id?.toString() === (currentFarm?.farm_id?.toString() || currentFarm?.id?.toString())
          );
          
          const processedSensors = farmSensors.map(sensor => ({
            id: sensor.sensor_id || sensor.id,
            name: sensor.sensor_name || sensor.name,
            type: sensor.sensor_type || sensor.type || 'Unknown',
            farm_id: sensor.farm_id || currentFarm?.farm_id || currentFarm?.id,
            location: sensor.location || 'Unknown Location',
            connectivity: sensor.connectivity,
            status: sensor.status || (Math.random() > 0.7 ? 'error' : 'normal'),
            lastUpdate: sensor.latest_updated,
            log: sensor.logs,
            link: sensor.link,
            createAt: sensor.create_at
          })).sort((a, b) => {
            // Sort by latest update time (newest first)
            const dateA = new Date(a.lastUpdate || a.createAt || 0);
            const dateB = new Date(b.lastUpdate || b.createAt || 0);
            return dateB - dateA; // Descending order (newest first)
          });
          
          setSensors(processedSensors);
          
          // Update farm sensor counts
          if (currentFarm) {
            const errorCount = processedSensors.filter(s => s.status === 'error').length;
            const normalCount = processedSensors.filter(s => s.status === 'normal').length;
            const warningCount = processedSensors.filter(s => s.status === 'warning').length;
            
            setFarmData(prev => ({
              ...prev,
              sensors_count: processedSensors.length,
              error_sensors: errorCount,
              normal_sensors: normalCount,
              warning_sensors: warningCount
            }));
          }
          
          // Fetch analytics data
          if (currentFarm?.farm_id) {
            const analyticsData = await fetchAnalyticsData(currentFarm.farm_id, selectedPeriod);
            setChartData(analyticsData);
          } else {
            setChartData(generateFallbackChartData(selectedPeriod));
          }
        } else {
          setChartData(generateFallbackChartData(selectedPeriod));
        }
        
      } catch (err) {
        setError('Failed to load farm data');
        console.error('Error fetching farm data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmData();
  }, [farmId, selectedPeriod]);

  // Reset form data helper
  const resetSensorForm = () => {
    setSensorFormData({
      sensor_name: '',
      sensor_type: '',
      location: '',
      connectivity: 'offline',
      status: 'normal',
      link: ''
    });
  };

  // Modal handlers
  const handleAddSensor = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const sensorData = {
        ...sensorFormData,
        farm_id: farmData.id
      };
      
      await createSensor(sensorData);
      setShowAddSensorModal(false);
      resetSensorForm();
      window.location.reload();
    } catch (err) {
      console.error("Error creating sensor:", err);
      alert('Failed to create sensor: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFarm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateFarmInfo(farmData.id, farmFormData);
      setShowEditFarmModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Error updating farm:", err);
      alert('Failed to update farm: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSensor = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare original and updated sensor info
      const originalSensorInfo = {
        sensor_name: selectedSensor.sensor_name || selectedSensor.name || '',
        sensor_type: selectedSensor.sensor_type || selectedSensor.type || '',
        location: selectedSensor.location || '',
        link: selectedSensor.link || ''
      };

      const updatedSensorInfo = {
        sensor_name: sensorFormData.sensor_name,
        sensor_type: sensorFormData.sensor_type,
        location: sensorFormData.location,
        link: sensorFormData.link
      };

      // Prepare original and updated sensor data
      const originalSensorData = {
        connectivity: selectedSensor.connectivity || 'offline',
        status: selectedSensor.status || 'normal'
      };

      const updatedSensorData = {
        connectivity: sensorFormData.connectivity,
        status: sensorFormData.status
      };

      // Check for changes
      const sensorInfoChanged = JSON.stringify(originalSensorInfo) !== JSON.stringify(updatedSensorInfo);
      const sensorDataChanged = JSON.stringify(originalSensorData) !== JSON.stringify(updatedSensorData);

      // Update only if changes detected
      const sensorId = selectedSensor.sensor_id || selectedSensor.id;
      console.log('Using sensor ID for updates:', sensorId);
      console.log('Selected sensor:', selectedSensor);
      
      if (sensorInfoChanged) {
        console.log('Sensor info changed, updating...', updatedSensorInfo);
        const infoResult = await updateSensorInfo(sensorId, updatedSensorInfo);
        console.log('Info update result:', infoResult);
      }

      if (sensorDataChanged) {
        console.log('Sensor data changed, updating...', updatedSensorData);
        const dataResult = await updateSensorData(sensorId, updatedSensorData);
        console.log('Data update result:', dataResult);
      }

      if (!sensorInfoChanged && !sensorDataChanged) {
        alert('No changes detected. Sensor not updated.');
      }

      setShowEditSensorModal(false);
      setSelectedSensor(null);
      resetSensorForm();
      
      // Refresh data if changes were made
      if (sensorInfoChanged || sensorDataChanged) {
        console.log('Changes detected, refreshing data...');
        await refreshData();
        alert('Sensor updated successfully!');
      }
    } catch (err) {
      console.error("Error updating sensor:", err);
      alert('Failed to update sensor: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSensor = async (sensorId) => {
    if (!window.confirm('Are you sure you want to delete this sensor?')) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await deleteSensor(sensorId);
      window.location.reload();
    } catch (err) {
      console.error("Error deleting sensor:", err);
      alert('Failed to delete sensor: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal helper functions
  const openEditSensorModal = (sensor) => {
    setSelectedSensor(sensor);
    setSensorFormData({
      sensor_name: sensor.sensor_name || sensor.name || '',
      sensor_type: sensor.sensor_type || sensor.type || '',
      location: sensor.location || '',
      connectivity: sensor.connectivity || 'offline',
      status: sensor.status || 'normal',
      link: sensor.link || ''
    });
    setShowEditSensorModal(true);
  };

  const openEditFarmModal = () => {
    setFarmFormData({
      farm_name: farmData.name,
      location: farmData.location
    });
    setShowEditFarmModal(true);
  };

  const handlePeriodChange = async (period) => {
    setSelectedPeriod(period);
    
    if (farmData?.id) {
      try {
        const analyticsData = await fetchAnalyticsData(farmData.id, period);
        setChartData(analyticsData);
      } catch (error) {
        console.error('Error updating chart data:', error);
        setChartData(generateFallbackChartData(period));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading farm data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all duration-200"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Farm Info Component */}
        <FarmInfo 
          farmData={farmData}
          onEditFarm={() => setShowEditFarmModal(true)}
          onAddSensor={() => setShowAddSensorModal(true)}
        />

        {/* Farm Data Component */}
        <FarmData 
          sensors={sensors}
          chartData={chartData}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          onEditSensor={openEditSensorModal}
          onDeleteSensor={handleDeleteSensor}
          farmData={farmData}
        />
      </div>

      {/* Add Sensor Modal */}
      {showAddSensorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add New Sensor</h3>
              <button
                onClick={() => setShowAddSensorModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSensor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sensor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sensorFormData.sensor_name}
                  onChange={(e) => setSensorFormData({...sensorFormData, sensor_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sensor Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={sensorFormData.sensor_type}
                  onChange={(e) => setSensorFormData({...sensorFormData, sensor_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Temperature">Temperature</option>
                  <option value="Humidity">Humidity</option>
                  <option value="Soil Moisture">Soil Moisture</option>
                  <option value="Light">Light</option>
                  <option value="Rain">Rain</option>
                  <option value="pH">pH</option>
                  <option value="Pressure">Pressure</option>
                  <option value="Wind">Wind</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={sensorFormData.location}
                  onChange={(e) => setSensorFormData({...sensorFormData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Field A, Zone 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={sensorFormData.link}
                  onChange={(e) => setSensorFormData({...sensorFormData, link: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/sensor-data"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSensorModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Sensor'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Farm Modal */}
      {showEditFarmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Edit Farm</h3>
              <button
                onClick={() => setShowEditFarmModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditFarm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm Name
                </label>
                <input
                  type="text"
                  value={farmFormData.farm_name}
                  onChange={(e) => setFarmFormData({...farmFormData, farm_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={farmFormData.location}
                  onChange={(e) => setFarmFormData({...farmFormData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditFarmModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Farm'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Sensor Modal */}
      {showEditSensorModal && selectedSensor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Edit Sensor</h3>
              <button
                onClick={() => setShowEditSensorModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSensor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sensor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sensorFormData.sensor_name}
                  onChange={(e) => setSensorFormData({...sensorFormData, sensor_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sensor Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={sensorFormData.sensor_type}
                  onChange={(e) => setSensorFormData({...sensorFormData, sensor_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Temperature">Temperature</option>
                  <option value="Humidity">Humidity</option>
                  <option value="Soil Moisture">Soil Moisture</option>
                  <option value="Light">Light</option>
                  <option value="Rain">Rain</option>
                  <option value="pH">pH</option>
                  <option value="Pressure">Pressure</option>
                  <option value="Wind">Wind</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={sensorFormData.location}
                  onChange={(e) => setSensorFormData({...sensorFormData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Field A, Zone 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connectivity
                </label>
                <select
                  value={sensorFormData.connectivity}
                  onChange={(e) => setSensorFormData({...sensorFormData, connectivity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={sensorFormData.status}
                  onChange={(e) => setSensorFormData({...sensorFormData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="normal">Normal</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={sensorFormData.link}
                  onChange={(e) => setSensorFormData({...sensorFormData, link: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/sensor-data"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditSensorModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Sensor'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Farm;