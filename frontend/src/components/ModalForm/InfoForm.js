import React from 'react'

const InfoForm = ({ item, onClose }) => {
  if (!item) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="border-b pb-3">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Device ID
          </label>
          <p className="text-lg font-semibold text-gray-900">{item.deviceId}</p>
        </div>
        
        <div className="border-b pb-3">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            User ID
          </label>
          <p className="text-lg font-semibold text-gray-900">{item.userId}</p>
        </div>
        
        <div className="border-b pb-3">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Device Name
          </label>
          <p className="text-lg font-semibold text-gray-900">{item.deviceName}</p>
        </div>
        
        <div className="border-b pb-3">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Location
          </label>
          <p className="text-lg font-semibold text-gray-900">{item.location}</p>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  )
}

export default InfoForm