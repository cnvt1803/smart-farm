import React from 'react'
import { BsSearch } from 'react-icons/bs'

const SearchInput = ({ searchTerm, onSearchChange }) => {
  return (
    <div className='flex items-center w-3/5 px-4 py-1 bg-white rounded-lg ring-2 ring-stone-300'>
      <BsSearch className='inline mr-3'/>
      <input 
        type="text" 
        placeholder="Search device name, ID, or location" 
        value={searchTerm}
        onChange={onSearchChange}
        className='w-full p-2 text-lg bg-inherit border-none focus:outline-none'
      />
    </div>
  )
}

export default SearchInput