import React, { useState } from 'react';
import { 
  Calendar, Download, ChevronDown, Search 
} from 'lucide-react';

const RoutineServiceSchedule = () => {
  const primaryColor = '#243158';
  
  const services = [
    {
      siteName: 'T.Nagar 10',
      route: 'AL999 test 2',
      amc: 'Chennai',
      status: 'Active',
      contractStart: '21.06.2024',
      contractEnd: '20.06.2024',
      contractType: 'ATOM- FREE AMC',
      service1: '01.07.2025 Overdue',
      service2: '01.07.2025 Overdue',
      count: '15'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Export Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Routine Service Schedule</h1>
          <button 
            className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm mt-4 md:mt-0"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>

        {/* All Filters in One Line with Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 overflow-x-auto">
          <div className="flex flex-nowrap items-center space-x-2 min-w-max">
            {/* Period */}
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <Calendar className="h-4 w-4 mr-1" style={{ color: primaryColor }} />
              <span className="text-sm font-medium">Period:</span>
              <span className="text-sm ml-1">ALL TIME</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </div>

            {/* By */}
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <span className="text-sm font-medium">By:</span>
              <span className="text-sm ml-1">Customer</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </div>

            {/* Customer */}
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <span className="text-sm font-medium">Customer:</span>
              <span className="text-sm ml-1">ALL</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </div>

            {/* Routes */}
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <span className="text-sm font-medium">Routes:</span>
              <span className="text-sm ml-1">ALL</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </div>

            {/* Employee */}
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <span className="text-sm font-medium">Employee:</span>
              <span className="text-sm ml-1">ALL</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </div>

            {/* AMC */}
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <span className="text-sm font-medium">AMC:</span>
              <span className="text-sm ml-1">ALL</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </div>

            {/* Status */}
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <span className="text-sm font-medium">Status:</span>
              <span className="text-sm ml-1">ALL</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </div>

            {/* Search Button */}
            <button 
              className="flex items-center justify-center text-white rounded-md p-2 px-4 ml-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">SITE NAME</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ROUTE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">AMC</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">STATUS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">CONTRACT START</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">CONTRACT END</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">CONTRACT TYPE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">SERVICE 1</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">SERVICE 2</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{service.siteName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.route}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <div>{service.amc}</div>
                    <div className="text-xs text-gray-400">{service.count}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      service.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.contractStart}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.contractEnd}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.contractType}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">{service.service1}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">{service.service2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 text-sm text-gray-600 border-t border-gray-200">
          Showing 1-09 of 78
        </div>
      </div>
    </div>
  );
};

export default RoutineServiceSchedule;