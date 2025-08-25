import { API_BASE_URL } from "../config"
// const API_BASE_URL = "http://localhost:8000"

// Get info about the farms and sensors of user
const getInfo = async () => {
  const res = await fetch(`${API_BASE_URL}/api/info`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch info')
  }

  const data = await res.json()
  return data
}

const createFarm = async (inputData) => {
  const res = await fetch(`${API_BASE_URL}/api/farm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: JSON.stringify(inputData)
  })

  if (!res.ok) {
    throw new Error('Failed to create farm')
  }

  return res;
}

const createSensor = async (inputData) => {
  const res = await fetch(`${API_BASE_URL}/api/sensor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: JSON.stringify(inputData)
  })

  if (!res.ok) {
    throw new Error('Failed to create sensor')
  }

  return res;
}

const getSensorInfo = async (sensorId) => {
  const res = await fetch(`${API_BASE_URL}/api/sensor/${sensorId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch sensor info')
  }

  const data = await res.json()
  return data
}

const getFarmInfo = async (farmId) => {
  const res = await fetch(`${API_BASE_URL}/api/farm/${farmId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch farm info')
  }

  const data = await res.json()
  return data
}

const updateFarmInfo = async (farmId, updatedData) => {
  const res = await fetch(`${API_BASE_URL}/api/farm/${farmId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: JSON.stringify(updatedData)
  })

  if (!res.ok) {
    throw new Error('Failed to update farm info')
  }

  return res;
}

const updateSensorInfo = async (sensorId, updatedInfo) => {
  const res = await fetch(`${API_BASE_URL}/api/sensor/${sensorId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: JSON.stringify(updatedInfo)
  })

  if (!res.ok) {
    throw new Error('Failed to update sensor info')
  }

  return res;
}

const updateSensorData = async (sensorId, updatedData) => {
  const res = await fetch(`${API_BASE_URL}/api/sensor/update-data/${sensorId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: JSON.stringify(updatedData)
  })

  if (!res.ok) {
    throw new Error('Failed to update sensor data')
  }

  return res;
}

const deleteFarm = async (farmId) => {
  const res = await fetch(`${API_BASE_URL}/api/farm/${farmId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: JSON.stringify({ farmId })
  })

  if (!res.ok) {
    throw new Error('Failed to delete farm')
  }

  return res;
}

const deleteSensor = async (sensorId) => {
  const res = await fetch(`${API_BASE_URL}/api/sensor/${sensorId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: JSON.stringify({ sensorId })
  })

  if (!res.ok) {
    throw new Error('Failed to delete farm')
  }

  return res;
}

const getAnalytics = async (farmId, period = '7d') => {
  const res = await fetch(`${API_BASE_URL}/api/analytics/${farmId}?period=${period}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch analytics')
  }

  const data = await res.json()
  return data
}

export {
  getInfo,
  createFarm,
  createSensor,
  getSensorInfo,
  getFarmInfo,
  updateFarmInfo,
  updateSensorInfo,
  updateSensorData,
  deleteFarm,
  deleteSensor,
  getAnalytics
}