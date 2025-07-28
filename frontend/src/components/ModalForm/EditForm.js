import React, { useState, useEffect } from 'react'
import data from '../../data/data.json';

const EditForm = ({ item, onEditItem, onClose }) => {
  const [formData, setFormData] = useState({
    deviceName: '',
    location: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        deviceName: item.deviceName || '',
        location: item.location || '',
      });
    }
  }, [item]);

  const getLocationList = (userID) => {
    return data.locations.filter(location => location.userID === userID);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.deviceName || !formData.location) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    const updatedItem = {
      ...item,
      ...formData
    };
    
    console.log('EditForm submitting:', updatedItem);
    onEditItem(item.deviceId, updatedItem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Device Name
        </label>
        <input
          type="text"
          name="deviceName"
          value={formData.deviceName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Chọn vị trí</option>
          {getLocationList(item.userId).map(location => (
            <option key={location.locationID} value={location.locationName}>
              {location.locationName}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
        >
          Cập nhật
        </button>
      </div>
    </form>
  )
}

export default EditForm