import React from 'react'

import HeaderDashboard from '../components/Dashboard/HeaderDashboard'
import StatusBar from '../components/Dashboard/StatusBar'

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <HeaderDashboard directoryLink="Dashboard" />
      <StatusBar />
    </div>
  )
}

export default Dashboard