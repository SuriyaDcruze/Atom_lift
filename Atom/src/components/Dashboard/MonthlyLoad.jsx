import React, { useState } from 'react';
import { 
  Calendar, User, Search, ChevronDown, Download
} from 'lucide-react';

const MonthlyLoad = () => {
  const primaryColor = '#243158';
  const [fromMonth, setFromMonth] = useState('JULY, 2025');
  const [toMonth, setToMonth] = useState('JULY, 2025');
  const [employee, setEmployee] = useState('ALL');

  const employees = [
    {
      name: 'Sathya',
      completed: 0,
      due: 0,
      overdue: 0
    }
    // Add more employees as needed
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Routine Services Monthly Load</h1>

        {/* Filters Section - Added Export button next to Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* From Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <div className="flex items-center border border-gray-300 rounded-md p-2">
                <Calendar className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                <span className="font-semibold">{fromMonth}</span>
              </div>
            </div>

            {/* To Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <div className="flex items-center border border-gray-300 rounded-md p-2">
                <Calendar className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                <span className="font-semibold">{toMonth}</span>
              </div>
            </div>

            {/* Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <div className="flex items-center border border-gray-300 rounded-md p-2">
                <User className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                <span className="font-semibold">{employee}</span>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button 
                className="flex items-center justify-center text-white rounded-md p-2 w-full"
                style={{ backgroundColor: primaryColor }}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </button>
            </div>

            {/* Added Export Button */}
            <div className="flex items-end">
              <button 
                className="flex items-center justify-center bg-white border border-gray-300 rounded-md p-2 w-full hover:bg-gray-50"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Employee Load Table - Unchanged */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-2 bg-gray-100 p-4 font-medium text-gray-700 text-sm border-b border-gray-200">
            <div className="px-4">EMPLOYEE</div>
            <div className="px-4">JUNE</div>
          </div>
          
          {/* Table Rows */}
          {employees.map((emp, index) => (
            <div key={index} className="grid grid-cols-2 p-4 border-b border-gray-200 text-sm">
              <div className="px-4 font-medium">{emp.name}</div>
              <div className="px-4">
                <div className="flex space-x-4">
                  <span className="text-green-600">Completed: {emp.completed}</span>
                  <span className="text-yellow-600">Due: {emp.due}</span>
                  <span className="text-red-600">Overdue: {emp.overdue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State - Unchanged */}
        {employees.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No employee data found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyLoad;