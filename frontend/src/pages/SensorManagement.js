import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config';
import SearchInput from '../components/SearchInput';
import FilterSection from '../components/FilterSection'; 
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import { FaPlus } from 'react-icons/fa';

const sensorData = {
  columns: [
    { header: "Device ID", value: "deviceId", sorted: true},
    { header: "User ID", value: "userId", sorted: true},
    { header: "Device Name", value: "deviceName", sorted: true},
    { header: "Location", value: "location", sorted: true},
    { header: "Custom Actions", value: "customActions", sorted: false}
  ], 
  data: [
    { "deviceId": "device1", "userId": "123", "deviceName": "Sensor A", "location": "Greenhouse 1",},
  ],
  colspan: [
    { "deviceId": 1 },
    { "userId": 1 },
    { "deviceName": 1 },
    { "location": 2 },
    { "customActions": 5 },
  ]
}

const filterName = {
  "Vị trí": [
    { value: "Tất cả", label: "Tất cả" },
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
    let filteredData = sensorData.data;

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
          <h1 className="text-3xl font-bold text-center">QUẢN LÝ THIẾT BỊ</h1>
        </div>
        
        <div className="flex flex-row justify-center items-center gap-4">
          <FilterSection filterName={filterName} filterValue={filter} onFilterChange={handleFilterChange} compareFilterValue={compareFilterValue} />
          <div className="">
            <button>
              <span className="font-semibold text-blue-500 hover:text-blue-700 ">
                <FaPlus className="inline-block mr-1" />
                Thêm thiết bị
              </span>
            </button>
          </div>
        </div>
        
        <div className="flex justify-center items-center">
          <Table 
            columns={sensorData.columns} 
            data={getCurrentPageData()} 
            colspan={sensorData.colspan} 
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