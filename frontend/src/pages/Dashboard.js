import React from 'react'

import HeaderDashboard from '../components/DashboardComponent/HeaderDashboard'
import StatusBar from '../components/DashboardComponent/StatusBar.js'
import ErrorLogs from '../components/DashboardComponent/ErrorLogs.js'
import Map from '../components/DashboardComponent/Map.js'
import FarmsTable from '../components/DashboardComponent/FarmsTable.js'
import Logs from '../components/DashboardComponent/Logs.js'

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-8 p-4">
      <HeaderDashboard directoryLink="Dashboard" />
      <StatusBar numberOfFarms={5} onlineDevices={10} warningDevices={2} offlineDevices={1} />
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-[700px_auto] gap-8">
          <ErrorLogs />
          <Map />
        </div>
        <div className="grid grid-cols-[auto_500px] gap-8">
          <FarmsTable />
          <Logs />
        </div>
      </div>
    </div>
  )
}

export default Dashboard