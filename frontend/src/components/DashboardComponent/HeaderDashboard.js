import React from 'react'

const HeaderDashboard = ({directoryLink}) => {
  return (
    <div className='flex flex-row items-center justify-between'>
      <DirectoryView directoryLink={directoryLink} />
      <PageDecorators />
    </div>
  )
}

const DirectoryView = ({directoryLink}) => {
  return (
    <div className="p-2">
      <a href={directoryLink} className="text-black hover:text-blue-500">
        {directoryLink}
      </a>
    </div>
  )
}

const PageDecorators = () => {
  return (
    <div className="flex items-center space-x-6">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg px-4 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🌱</span>
          <div>
            <h1 className="text-lg font-bold text-green-700">Smart Farm</h1>
            <p className="text-xs text-green-600">IoT Dashboard</p>
          </div>
        </div>
      </div>
      
      {/* Page Status */}
      <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-blue-700">Active</span>
      </div>
      
      {/* Current Time */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <div className="text-center">
          <div className="text-xs text-gray-500 font-medium">Current Time</div>
          <div className="text-sm font-bold text-gray-700">
            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderDashboard