import React, { useState, useEffect } from 'react';
import { getInfo } from '../../data/data';

const StatusBar = () => {
  const [statusData, setStatusData] = useState({
    numberOfFarms: 0,
    totalSensors: 0,
    onlineDevices: 0,
    offlineDevices: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        setLoading(true);
        const data = await getInfo();
        
        const numberOfFarms = data.farms?.length || 0;
        const totalSensors = data.sensors?.length || 0;

        let onlineDevices = 0;
        let offlineDevices = 0;
        
        data.sensors?.forEach(sensor => {
          const connectivity = sensor.connectivity?.toLowerCase();
          
          if (connectivity === 'online') {
            onlineDevices++;
          } else {
            offlineDevices++;
          }
        });
        
        setStatusData({
          numberOfFarms,
          totalSensors,
          onlineDevices,
          offlineDevices
        });
        
      } catch (err) {
        console.error('Error fetching status data:', err);
        setError('Failed to load status data');
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();
  }, []);

  // Status card configuration
  const statusCards = [
    {
      id: 'farms',
      icon: 'https://img.icons8.com/?size=100&id=Fp7HDz8kOMLL&format=png&color=000000',
      label: 'Farms',
      value: statusData.numberOfFarms,
      color: 'blue'
    },
    {
      id: 'total',
      icon: 'https://img.icons8.com/?size=100&id=l2X2nfxSMxgE&format=png&color=000000',
      label: 'Total Sensors',
      value: statusData.totalSensors,
      color: 'purple'
    },
    {
      id: 'online',
      icon: 'https://img.icons8.com/?size=100&id=70yRC8npwT3d&format=png&color=000000',
      label: 'Online',
      value: statusData.onlineDevices,
      color: 'green'
    },
    {
      id: 'offline',
      icon: 'https://img.icons8.com/?size=100&id=gIRdEt-vwQeM&format=png&color=ff0000',
      label: 'Offline',
      value: statusData.offlineDevices,
      color: 'red'
    }
  ];

  // Color theme configuration
  const getTheme = (color) => {
    const themes = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
    };
    return themes[color] || themes.blue;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500"></div>
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center items-center h-16">
          <div className="flex items-center space-x-3 text-red-600">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">System Status</h2>
        <p className="text-sm text-gray-500">Real-time overview</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card) => {
          const theme = getTheme(card.color);
          return (
            <div 
              key={card.id}
              className={`${theme.bg} ${theme.border} border rounded-lg p-4 hover:shadow-sm transition-shadow duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {card.label}
                  </p>
                  <p className={`text-2xl font-bold ${theme.text}`}>
                    {card.value}
                  </p>
                </div>
                <span className="text-2xl opacity-80">
                  <img src={card.icon} alt={card.label} className="w-10 h-10" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span>Live</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;