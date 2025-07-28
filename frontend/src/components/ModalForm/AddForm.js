import React, { useState } from 'react'
import data from '../../data/data.json';

const AddForm = ({ onAddItem, onClose }) => {
  const [formData, setFormData] = useState({
    deviceId: '',
    deviceName: '',
    userId: '',
    location: '',
  });

  const userIdList = data.users.map(item => item.userID);
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
    if (!formData.deviceName || !formData.userId || !formData.location) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    // Generate unique deviceId if not provided
    const newDeviceId = formData.deviceId || `device_${Date.now()}`;
    onAddItem({
      ...formData,
      deviceId: newDeviceId,
      customActions: "true"
    })
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
          placeholder="Nhập tên thiết bị"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User ID
        </label>
        <select 
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select user ID</option>
          {userIdList.map(userID => (
            <option key={userID} value={userID}>
              {userID}
            </option>
          ))}
        </select>
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
          disabled={!formData.userId}
        >
          <option value="">Select location</option>
          {getLocationList(formData.userId).map(location => (
            <option key={location.locationID} value={location.locationName}>
              {location.locationName}
            </option>
          ))}
        </select>
        {!formData.userId && (
          <p className="text-sm text-gray-500 mt-1">Vui lòng chọn User ID trước</p>
        )}
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
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Thêm
        </button>
      </div>
    </form>
  )
}

export default AddForm