import React from 'react'
import { AiOutlineInfoCircle } from 'react-icons/ai';

const ErrorLogs = () => {

  const errorLogs = [
    { message: "Error 1", link: "https://example.com/error1" },
    { message: "Error 2", link: "https://example.com/error2" },
    { message: "Error 3", link: "https://example.com/error3" },
    { message: "Error 4", link: "https://example.com/error4" },
    { message: "Error 5", link: "https://example.com/error5" },
    { message: "Error 6", link: "https://example.com/error6" },
]

  const filteredErrorLogs = errorLogs.slice(0, 5);

  const errorName = 'dashboardError';

  return (
    <div className="flex flex-col gap-2 min-h-60 p-3 border border-black ">
      <h2 className="text-2xl text-center">ERROR LOGS</h2>
      <div className="flex flex-col gap-2">
        {filteredErrorLogs.map((error, index) => (
          <div key={errorName + index} className="flex flex-row justify-between items-center">
            <div className="text-xl">
              {error.message}
            </div>
            <div className="text-2xl text-red-500 hover:text-blue-700 text-center justify-center">
              {error.link && 
                <a href={error.link} className="flex items-center">
                  <AiOutlineInfoCircle className='inline-block' />
                </a>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ErrorLogs