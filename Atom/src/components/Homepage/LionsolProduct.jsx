import React from 'react';
import LionsolProduct from '../../assets/lionsolproduct.png';

const Lionsol = () => {
  return (
    <div className="bg-[#FEF4EA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Lionsol Products
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive solutions for every business need
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Field Service */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <img 
              src={LionsolProduct} 
              alt="Field Service" 
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Field Service</h2>
            <p className="text-gray-600 mb-4">
              Efficiently manage your field operations and service teams
            </p>
            <a 
              href="#" 
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              Learn more about Field Service
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Elevator AMC */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <img 
              src={LionsolProduct} 
              alt="Field Service" 
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Elevator AMC</h2>
            <p className="text-gray-600 mb-4">
              Specialized software for elevator maintenance
            </p>
            <a 
              href="#" 
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              Learn more about Elevator AMC
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Lionsol HR */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <img 
              src={LionsolProduct} 
              alt="Field Service" 
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Lionsol HR</h2>
            <p className="text-gray-600 mb-4">
              Complete HR management solution for your workforce
            </p>
            <a 
              href="#" 
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              Learn more about Lionsol HR
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Lionsol CRM */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <img 
              src={LionsolProduct} 
              alt="Field Service" 
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Lionsol CRM</h2>
            <p className="text-gray-600 mb-4">
              Build and maintain strong customer relationships
            </p>
            <a 
              href="#" 
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              Learn more about Lionsol CRM
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lionsol;