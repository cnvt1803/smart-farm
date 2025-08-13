import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaClock, FaBug, FaCheckCircle } from 'react-icons/fa';
import { getInfo } from '../../data/data.js';

const ErrorLogs = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getInfo();
        setData(result);
        console.log("Error logs data:", result);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTimeAgo = (timestamp) => {
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-60">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <FaExclamationTriangle className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Error Logs</h2>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-60">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <FaExclamationTriangle className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Error Logs</h2>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <FaBug className="text-red-500 text-2xl mb-2 mx-auto" />
            <p className="text-red-600 font-medium">Failed to load error logs</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.sensors) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-60">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <FaExclamationTriangle className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Error Logs</h2>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="text-center">
            <FaBug className="text-gray-300 text-3xl mb-3 mx-auto" />
            <p className="text-gray-500 font-medium">No data available</p>
            <p className="text-gray-400 text-sm">Check your connection and try again</p>
          </div>
        </div>
      </div>
    );
  }

  const errorData = data.sensors.filter(item => item.status === 'error');
  const filteredErrorLogs = errorData
    .sort((a, b) => new Date(b.latest_updated) - new Date(a.latest_updated))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-60">
      {/* Header with modern styling */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <FaExclamationTriangle className="text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Error Logs</h2>
            <p className="text-sm text-gray-500">Recent system alerts</p>
          </div>
        </div>
        <div className="bg-red-50 px-3 py-1 rounded-full">
          <span className="text-red-700 text-sm font-medium">
            {filteredErrorLogs.length} active
          </span>
        </div>
      </div>

      {/* Error logs content */}
      <div className="space-y-3">
        {filteredErrorLogs.length > 0 ? (
          filteredErrorLogs.map((errorLog, index) => (
            <div 
              key={`error-${errorLog.sensor_id || index}`}
              className="group bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-red-300"
            >
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {errorLog.sensor_name || 'Unknown Sensor'}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FaClock />
                      {formatTimeAgo(errorLog.latest_updated)}
                    </div>
                  </div>
                  <p className="text-sm text-red-700 line-clamp-2 leading-relaxed">
                    {errorLog.logs || 'No error message available'}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Critical
                    </span>
                    <span className="text-xs text-gray-500">
                      Sensor ID: {errorLog.sensor_id?.slice(0, 8)}...
                    </span>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-100 rounded-lg">
                  <FaExclamationTriangle className="text-red-500 text-sm" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All systems operational</h3>
            <p className="text-gray-500">No error logs found - your farm is running smoothly!</p>
          </div>
        )}
      </div>

      {/* Footer with action */}
      {filteredErrorLogs.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium text-sm">
            View All Error Logs
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorLogs;