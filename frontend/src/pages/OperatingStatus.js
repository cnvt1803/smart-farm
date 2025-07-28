import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'; 
import data from '../data/data.json';

import SearchInput from '../components/SearchInput';
import FilterSection from '../components/FilterSection';
import Table from '../components/Table';
import Pagination from '../components/Pagination';

const findLocationNameByLocationId = (locationId) => {
  const location = data.locations.find(item => item.locationID === locationId);
  return location.locationName || 'Unknown Location';
}

const operationalStatusData = {
  columns: [
    { header: "Device Name", value: "deviceName" },
    { header: "Device ID", value: "deviceID" },
    { header: "Location", value: "location" },
    { header: "Connectivity", value: "connectivity" },
    { header: "Status", value: "status" }
  ],
  colspan: {
    deviceName: 1,
    deviceID: 1,
    location: 1,
    connectivity: 1,
    status: 1, 
  }
}

operationalStatusData.data = [];
data.sensors.forEach((item) => {
  operationalStatusData.data.push({
    deviceName: item.deviceName,
    deviceID: item.deviceID,
    location: findLocationNameByLocationId(item.locationID),
    connectivity: item.connectivity,
    status: item.status
  });
});

const filterName = {
  "Connectivity": [
    { title: "Online", name: "online", id: "connected" },
    { title: "Offline", name: "offline", id: "disconnected" }
  ],
  "Status": [
    { title: "Normal", name: "normal", id: "normalStatus" },
    { title: "Error", name: "error", id: "errorStatus" }
  ]
}

const OperatingStatus = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({ connectivity: '', status: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const itemsPerPage = 10; // Set items per page

  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return navigate("/login");

      try {
        const res = await fetch(`${API_BASE_URL}/api/check-auth`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          localStorage.removeItem("access_token");
          navigate("/login");
        }
      } catch {
        navigate("/login");
      }
    };
    checkLogin();
  }, [navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    // Map filter name to field name
    const fieldName = name === "Connectivity" ? "connectivity" : 
                     name === "Status" ? "status" : name;
    setFilter(prev => ({ ...prev, [fieldName]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  }

  const compareFilterValue = (item) => {
    return item === "Connectivity" ? "connectivity" : "status";
  }

  const dataFormat = (title, value) => {
    return (
      <span className={`text-base font-semibold ${
        title === "status" 
          ? (value === "Normal" ? "text-green-500" : "text-red-500") 
          : title === "connectivity" 
            ? (value === "Online" ? "text-green-500" : "text-red-500") 
            : ""
      }`}>
        {value}
      </span>
    );
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  }

  const getFilteredData = () => {
    let filteredData = operationalStatusData.data;

    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(item => 
        item.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply connectivity filter
    if (filter.connectivity) {
      filteredData = filteredData.filter(item => 
        item.connectivity === (filter.connectivity === 'connected' ? 'Online' : 'Offline')
      );
    }

    // Apply status filter
    if (filter.status) {
      filteredData = filteredData.filter(item => 
        item.status === (filter.status === 'normalStatus' ? 'Normal' : 'Error')
      );
    }

    return filteredData;
  }

  // Get current page data
  const getCurrentPageData = () => {
    const filteredData = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }

  const filteredData = getFilteredData();

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-white'>
      <div className='flex justify-center items-center p-5 font-bold text-center text-2xl bg-slate-100 border-b-2'>
        <SearchInput searchTerm={searchTerm} onSearchChange={handleSearchChange} />
      </div>
      <div className='flex flex-col gap-4 min-h-screen py-3 px-4'>
        <div className="flex items-center justify-center">
          <h1 className="text-3xl font-bold text-center">OPERATING STATUS</h1>
        </div>
        
        <div className="flex flex-row justify-center items-center gap-4">
          <FilterSection filterName={filterName} filterValue={filter} onFilterChange={handleFilterChange} compareFilterValue={compareFilterValue} />
        </div>
        
        <div className="flex justify-center items-center">
          <Table 
            columns={operationalStatusData.columns} 
            data={getCurrentPageData()} 
            colspan={operationalStatusData.colspan} 
            dataFormat={dataFormat}
          />
        </div>
        
        {filteredData.length > 0 ? (
          <div className="flex justify-center">
            <Pagination 
              totalItems={filteredData.length} 
              itemsPerPage={itemsPerPage} 
              currentPage={currentPage} 
              onPageChange={handlePageChange} 
            />
          </div>
        ) : (
          <div className="flex justify-center items-center py-8">
            <p className="text-xl text-gray-500">Không tìm thấy dữ liệu phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OperatingStatus;