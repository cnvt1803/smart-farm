import React from 'react'

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="flex justify-center mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="py-2 px-4 font-semibold bg-white border-2 border-white rounded-sm transition-colors duration-300 ease-in-out cursor-pointer hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Prev
      </button>
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`py-2 px-4 font-semibold bg-white border-2 border-white rounded-sm transition-colors duration-300 ease-in-out cursor-pointer hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60 ${currentPage === page ? ' text-red-500' : ''}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`py-2 px-4 font-semibold bg-white border-2 border-white rounded-sm transition-colors duration-300 ease-in-out cursor-pointer hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination