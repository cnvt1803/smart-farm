import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config';
import data from '../data/data.json';

import SearchInput from '../components/SearchInput';
import FilterSection from '../components/FilterSection'; 
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import EditForm from '../components/ModalForm/EditForm';
import AddForm from '../components/ModalForm/AddForm';
import InfoForm from '../components/ModalForm/InfoForm';

import { FaPlus } from 'react-icons/fa';
import { FiEye } from 'react-icons/fi';
import { TbEdit } from 'react-icons/tb';
import { RiDeleteBin2Line } from 'react-icons/ri';

const findLocationNameByLocationId = (locationId) => {
  const location = data.locations.find(item => item.locationID === locationId);
  return location.locationName || 'Unknown Location';
}

const getUniqueLocations = () => {
  const uniqueLocations = [...new Set(sensorData.data.map(item => item.location))];

  return [
    { title: "All", name: "all", id: "all" }, // Empty string for "All" option
    ...uniqueLocations.sort().map(location => ({
      title: location,
      name: location.toLowerCase().replace(/\s+/g, ''),
      id: location // Use actual location name as id
    }))
  ]
}

const sensorData = {
  columns: [
    { header: "Device ID", value: "deviceId" },
    { header: "Device Name", value: "deviceName" },
    { header: "User ID", value: "userId" },
    { header: "Location", value: "location" },
    { header: "Actions", value: "customActions" }
  ],
  colspan: {
    deviceId: 1,
    deviceName: 1,
    userId: 1,
    location: 1,
    customActions: 1 // Adjusted to match the number of action buttons 
  }
};

sensorData.data = [];
data.sensors.forEach(sensorItem => {
  sensorData.data.push({
    deviceId: sensorItem.deviceID,
    deviceName: sensorItem.deviceName,
    userId: sensorItem.userID,
    location: findLocationNameByLocationId(sensorItem.locationID),
    customActions: "true"
  });
})

const filterName = {
  "Location": getUniqueLocations()
}

const SensorManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({ location: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentData, setCurrentData] = useState(sensorData);
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    currentAction: null,
    selectedItem: null,
  })

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

  const openModal = (action, item) => {
    setModalState({
      isOpen: true,
      currentAction: action,
      selectedItem: item
    })
  }
  
  const closeModal = () => {
    setModalState({
      isOpen: false,
      currentAction: null,
      selectedItem: null
    });
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name === "Location" ? "location" : name.toLowerCase();
    setFilter(prev => ({ ...prev, [fieldName]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  }

  const compareFilterValue = (item) => {
    return item === "Location" ? "location" : "location";
  }

  const dataFormat = (title, value, index, rowData) => {
    if (title === "customActions") 
      return (
        <div className="flex flex-row justify-center items-center gap-4">
          <button 
            className="flex items-center border-2 border-blue-600 rounded-md p-2 bg-blue-500 hover:bg-blue-600" 
            onClick={() => openModal('view', rowData)}
            title="Xem chi tiết"
          >
            <FiEye className="inline-block text-xl text-white" />
          </button>
          <button 
            className="flex items-center border-2 border-yellow-600 rounded-md p-2 bg-yellow-500 hover:bg-yellow-600" 
            onClick={() => openModal('edit', rowData)}
            title="Chỉnh sửa"
          >
            <TbEdit className="inline-block text-xl text-white" />
          </button>
          <button 
            className="flex items-center border-2 border-red-600 rounded-md p-2 bg-red-500 hover:bg-red-600" 
            onClick={() => handleDeleteItem(rowData)} 
            title="Xóa"
          >
            <RiDeleteBin2Line className="inline-block text-xl text-white" />
          </button>
        </div>
      );
    else return (
      <span className="font-semibold">
        {value}
      </span>
    );
  }

  const handleAddItem = (newItem) => {
    setCurrentData(prevData => ({
      ...prevData,
      data: [...prevData.data, newItem]
    }));
    closeModal();
  }

  const handleEditItem = (deviceID, updatedItem) => {
    console.log('handleEditItem called with:', updatedItem);
    setCurrentData(prevData => {
      const newData = {
        ...prevData,
        data: prevData.data.map(item => 
          item.deviceId === deviceID ? updatedItem : item
        )
      };
      console.log('Updated data:', newData);
      return newData;
    });
    closeModal();
  }

  const handleDeleteItem = (itemToDelete) => {
    setCurrentData(prevData => ({
      ...prevData,
      data: prevData.data.filter(item => item.deviceId !== itemToDelete.deviceId)
    }));
    closeModal();
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
    let filteredData = currentData.data;

    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(item => 
        item.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply location filter
    if (filter.location && filter.location !== "") {
      filteredData = filteredData.filter(item => 
        item.location === filter.location
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
  console.log('Filtered data:', filteredData);

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-white'>
        <div className='flex justify-center items-center p-5 font-bold text-center text-2xl bg-slate-100 border-b-2'>
          <SearchInput searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        </div>
        
        <div className='flex flex-col gap-4 min-h-screen py-3 px-4'>
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold text-center">SENSORS MANAGEMENT</h1>
          </div>
          
          <div className="flex flex-row justify-center items-center gap-4">
            <FilterSection filterName={filterName} filterValue={filter} onFilterChange={handleFilterChange} compareFilterValue={compareFilterValue} />
            <div className="">
              <button className="flex flex-row items-center text-white border-2 border-blue-600 rounded-md py-3 px-4 bg-blue-500 hover:bg-blue-600" onClick={() => openModal('add')}>
                  <FaPlus className="inline-block mr-1" />
                  Add new device
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

      {modalState.isOpen && (
        <Modal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title={
            modalState.currentAction === 'add' ? 'Thêm thiết bị mới' :
            modalState.currentAction === 'edit' ? 'Chỉnh sửa thiết bị' :
            modalState.currentAction === 'view' ? 'Chi tiết thiết bị' : ''
          }
        >
          {modalState.currentAction === 'add' && (
            <AddForm 
              onAddItem={handleAddItem} 
              onClose={closeModal}
            />
          )}
          
          {modalState.currentAction === 'edit' && (
            <EditForm 
              item={modalState.selectedItem} 
              onEditItem={handleEditItem}
              onClose={closeModal}
            />
          )}
          
          {modalState.currentAction === 'view' && (
            <InfoForm 
              item={modalState.selectedItem}
              onClose={closeModal}
            />
          )}
        </Modal>
      )}
    </>
  );
}

export default SensorManagement;