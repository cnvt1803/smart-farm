import React from 'react'
import { BsSearch } from 'react-icons/bs';

const HeaderDashboard = ({directoryLink}) => {
  return (
    <div className='flex flex-row items-center justify-between'>
      <DirectoryView directoryLink={directoryLink} />
      <SearchBar />
    </div>
  )
}

const DirectoryView = ({directoryLink}) => {
  return (
    <div className="p-2">
      {directoryLink}
    </div>
  )
}

const SearchBar = () => {
  return (
    <div className="flex flex-row items-center justify-between gap-3 p-2 bg-white border border-gray-300 rounded-lg">
      <BsSearch className="text-gray-500" />
      <input 
        type="text" 
        placeholder="Search..." 
        className="min-w-72 outline-none"
      />
    </div>
  )
}

export default HeaderDashboard