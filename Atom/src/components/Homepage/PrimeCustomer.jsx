import React from 'react';
import Customer from '../../assets/customer.png'

const PrimeCustomer = () => {
  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Our Prime Customers
          </h1>
        </div>

        {/* Customer Logos - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {/* Customer Logo 1 */}
          <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center">
            <img src={Customer} alt="Legis" />
          </div>

          {/* Customer Logo 2 */}
          <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center">
            <img src={Customer} alt="Legis" />
          </div>

          {/* Customer Logo 3 */}
          <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center">
            <img src={Customer} alt="Legis" />
          </div>

          {/* Customer Logo 4 */}
          <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center">
            <img src={Customer} alt="Legis" />
          </div>

          {/* Customer Logo 5 */}
          <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center">
            <img src={Customer} alt="Legis" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimeCustomer;