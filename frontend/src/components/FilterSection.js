import React from 'react'

const FilterSection = ({ filterName, filterValue, onFilterChange, compareFilterValue }) => {
  return (
    <>
      {Object.entries(filterName).map(([filterItem, options]) => (
        <div className="flex flex-row items-center gap-2 py-1 px-3 border-2 border-zinc-600 rounded-lg" key={filterItem}>
          <label className="text-lg font-semibold text-zinc-600">{filterItem}</label>
          <select 
            name={filterItem}
            className="p-2 text-lg bg-inherit border-none focus:outline-none rounded-lg" 
            onChange={onFilterChange}
            value={filterValue[compareFilterValue(filterItem)]}
          >
            {options.map((item) => (
              <option key={item.id} value={item.id} className="text-lg font-semibold">
                {item.title}
              </option> 
            ))} 
          </select>
        </div>
      ))}
    </>
  );
}

export default FilterSection