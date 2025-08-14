import React from 'react';
import { motion } from 'framer-motion';
import {
  FaEdit,
  FaPlus,
  FaSeedling,
  FaMapMarkerAlt
} from 'react-icons/fa';

const FarmInfo = ({ 
  farmData, 
  onEditFarm, 
  onAddSensor 
}) => {
  if (!farmData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button 
            onClick={onEditFarm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaEdit className="w-4 h-4" />
            Edit Farm
          </button>
          <button 
            onClick={onAddSensor}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Add Sensor
          </button>
        </div>
      </div>

      {/* Farm Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
              <FaSeedling className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">{farmData?.name}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FaMapMarkerAlt className="w-4 h-4" />
                <span>{farmData?.location}</span>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>Since: {farmData?.created }</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{farmData?.normal_sensors}</div>
              <div className="text-sm text-gray-500">Normal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{farmData?.warning_sensors}</div>
              <div className="text-sm text-gray-500">Warning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{farmData?.error_sensors}</div>
              <div className="text-sm text-gray-500">Error</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FarmInfo;
