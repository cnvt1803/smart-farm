import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'; 

import SearchInput from '../components/SearchInput';
import FilterSection from '../components/FilterSection';
import Table from '../components/Table';
import Pagination from '../components/Pagination';

const operationalStatusData = {
  columns: [
    { header: "Device ID", value: "deviceId", sorted: true},
    { header: "User ID", value: "userId", sorted: true},
    { header: "Device Name", value: "deviceName", sorted: true},
    { header: "Location", value: "location", sorted: true},
    { header: "Connectivity", value: "connectivity", sorted: true},
    { header: "Status", value: "status", sorted: true}
  ], 
  data: [
    { "deviceId": "device1", "userId": "123", "deviceName": "Sensor A", "location": "Greenhouse 1", "connectivity": "Online", "status": "Normal" },
    { "deviceId": "device2", "userId": "124", "deviceName": "Sensor B", "location": "Greenhouse 2", "connectivity": "Offline", "status": "Error" },
    { "deviceId": "device3", "userId": "125", "deviceName": "Sensor C", "location": "Greenhouse 3", "connectivity": "Online", "status": "Normal" },
    { "deviceId": "device4", "userId": "126", "deviceName": "Sensor D", "location": "Greenhouse 4", "connectivity": "Offline", "status": "Error" },
    { "deviceId": "device5", "userId": "127", "deviceName": "Sensor E", "location": "Greenhouse 5", "connectivity": "Online", "status": "Normal" },
    { "deviceId": "device6", "userId": "128", "deviceName": "Sensor F", "location": "Greenhouse 6", "connectivity": "Offline", "status": "Error" },
    { "deviceId": "device7", "userId": "129", "deviceName": "Sensor G", "location": "Greenhouse 7", "connectivity": "Online", "status": "Normal" },
    { "deviceId": "device8", "userId": "130", "deviceName": "Sensor H", "location": "Greenhouse 8", "connectivity": "Offline", "status": "Error" },
    { "deviceId": "device9", "userId": "131", "deviceName": "Sensor I", "location": "Greenhouse 9", "connectivity": "Online", "status": "Normal" },
    { "deviceId": "device10", "userId": "132", "deviceName": "Sensor J", "location": "Greenhouse 10", "connectivity": "Offline", "status": "Error" },
    { "deviceId": "device11", "userId": "133", "deviceName": "Sensor K", "location": "Greenhouse 11", "connectivity": "Online", "status": "Normal" },
    { "deviceId": "device12", "userId": "134", "deviceName": "Sensor L", "location": "Greenhouse 12", "connectivity": "Offline", "status": "Error" }
  ],
  colspan: [
    { "deviceId": 1 },
    { "userId": 1 },
    { "deviceName": 1 },
    { "location": 2 },
    { "connectivity": 1 },
    { "status": 1 }
  ]
}

const filterName = {
  "Tình trạng kết nối": [
    { title: "Online", name: "online", id: "connected" },
    { title: "Offline", name: "offline", id: "disconnected" }
  ],
  "Trạng thái": [
    { title: "Bình thường", name: "normal", id: "normalStatus" },
    { title: "Lỗi", name: "error", id: "errorStatus" }
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
    setFilter(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  }

  const compareFilterValue = (item) => {
    return item === "Tình trạng kết nối" ? "connectivity" : "status";
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
          <h1 className="text-3xl font-bold text-center">TÌNH TRẠNG HOẠT ĐỘNG</h1>
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