import React from 'react'

const Table = ({ columns, data, colspan, dataFormat }) => {
  return (
    <>
      <table className='min-w-full bg-white border border-gray-200 rounded-lg table-auto'>
        <thead className="bg-slate-100 min-w-screen">
          <tr>
            {columns.map((col) => (
              <th key={col.value} className="text-zinc-400 py-6" colSpan={colspan[col.value]}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="h-auto">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
              {columns.map((col) => {
                return (
                  <td key={rowIndex + col.value} className="py-4 text-center" colSpan={colspan[col.value]}>
                    {dataFormat(col.value, row[col.value], rowIndex, row)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default Table