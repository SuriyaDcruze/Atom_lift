// Home.jsx
import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Welcome User</h1>
          <p className="text-gray-600 mt-1">Customer ID: 263567</p>
        </header>

        {/* Software Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* AMC Software Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="bg-[#243158] p-6 h-36">
              <h2 className="text-xl font-semibold text-white">AMC Software</h2>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <p className="text-gray-700 mb-6 flex-grow">
                Complete AMC management system for your maintenance contracts
              </p>
              <button className="w-full bg-[#243158] hover:bg-[#1a2442] text-white font-medium py-3 px-4 rounded-md transition-colors duration-300 mt-auto">
                Access AMC Software
              </button>
            </div>
          </div>

          {/* Lionsol HR Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="bg-[#243158] p-6 h-36">
              <h2 className="text-xl font-semibold text-white">Lionsol HR</h2>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <p className="text-gray-700 mb-6 flex-grow">
                Complete human resource management system for payroll, attendance, and employee management
              </p>
              <button className="w-full bg-[#243158] hover:bg-[#1a2442] text-white font-medium py-3 px-4 rounded-md transition-colors duration-300 mt-auto">
                Renew Subscription
              </button>
            </div>
          </div>

          {/* Lionsol CRM Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="bg-[#243158] p-6 h-36">
              <h2 className="text-xl font-semibold text-white">Lionsol CRM</h2>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <p className="text-gray-700 mb-6 flex-grow">
                CRM solution integrating all business processes into one system
              </p>
              <button className="w-full bg-[#243158] hover:bg-[#1a2442] text-white font-medium py-3 px-4 rounded-md transition-colors duration-300 mt-auto">
                Access Lionsol CRM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;