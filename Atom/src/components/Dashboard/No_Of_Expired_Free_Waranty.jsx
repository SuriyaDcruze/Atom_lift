import React, { useState } from 'react';
import { 
  Search, Printer, Copy, FileText, 
  File, MoreVertical, Calendar 
} from 'lucide-react';

const No_Of_Expired_Free_Waranty = () => {
  const primaryColor = '#243158';
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Sample data
  const expiredWarranties = [
    {
      sno: '1',
      amcReference: 'AMC-2025-001',
      ltma: 'LTMA-001',
      siteName: 'T-Nagar Complex',
      route: 'Route A',
      expiringDate: '15.07.2025',
      routineServicesDone: '5',
      breakdownsDuringWarranty: '2'
    },
    {
      sno: '2',
      amcReference: 'AMC-2025-002',
      ltma: 'LTMA-002',
      siteName: 'Gachibowli Tech Park',
      route: 'Route B',
      expiringDate: '20.07.2025',
      routineServicesDone: '3',
      breakdownsDuringWarranty: '1'
    },
  ];

  const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();

  const [filters, setFilters] = useState({
    period: 'ALL',
    month: 'July',
    startDate: '01.07.2025',
    endDate: '31.07.2025'
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = (type) => {
    setShowExportMenu(false);
    console.log(`Exporting as ${type}`);
    // Implement export functionality here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">No. of Expired Free Warranty</h1>
          <div className="mt-4 md:mt-0 flex gap-2">
            {/* Export Menu */}
            <div className="relative">
              <button 
                className="flex items-center bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
                style={{ borderColor: primaryColor, color: primaryColor }}
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button 
                      onClick={() => handleExport('copy')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </button>
                    <button 
                      onClick={() => handleExport('csv')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      CSV
                    </button>
                    <button 
                      onClick={() => handleExport('print')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </button>
                    <button 
                      onClick={() => handleExport('pdf')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <File className="h-4 w-4 mr-2" />
                      PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="text-gray-500 mb-1 block">Period</label>
              <select 
                name="period"
                className="w-full border border-gray-300 rounded p-2"
                value={filters.period}
                onChange={handleFilterChange}
              >
                <option>ALL</option>
                <option>This Month</option>
                <option>Last Quarter</option>
              </select>
            </div>

            <div>
              <label className="text-gray-500 mb-1 block">Month*</label>
              <select 
                name="month"
                className="w-full border border-gray-300 rounded p-2"
                value={filters.month}
                onChange={handleFilterChange}
              >
                {months.map(month => (
                  <option key={month} value={month}>
                    {month.toUpperCase()}, {currentYear}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-500 mb-1 block">Start Date*</label>
              <div className="flex items-center border border-gray-300 rounded p-2">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <input 
                  type="text" 
                  name="startDate"
                  className="w-full outline-none" 
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div>
              <label className="text-gray-500 mb-1 block">End Date</label>
              <div className="flex items-center border border-gray-300 rounded p-2">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <input 
                  type="text" 
                  name="endDate"
                  className="w-full outline-none" 
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expired Warranties Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-200">
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[50px]">S.NO</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[120px]">AMC REFERENCE</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[100px]">LTMA NO</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap min-w-[150px]">SITE NAME</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[100px]">ROUTE</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[120px]">EXPIRING DATE</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[180px]">NO. OF ROUTINE SERVICES DONE</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[220px]">NO. OF BREAKDOWN DURING FREE WARRANTY PERIOD</th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody>
                {expiredWarranties.length > 0 ? (
                  expiredWarranties.map((warranty, index) => (
                    <tr key={index} className="border-b border-gray-200 text-sm">
                      <td className="px-4 py-3">{warranty.sno}</td>
                      <td className="px-4 py-3 font-medium">{warranty.amcReference}</td>
                      <td className="px-4 py-3">{warranty.ltma}</td>
                      <td className="px-4 py-3">{warranty.siteName}</td>
                      <td className="px-4 py-3">{warranty.route}</td>
                      <td className="px-4 py-3">{warranty.expiringDate}</td>
                      <td className="px-4 py-3">{warranty.routineServicesDone}</td>
                      <td className="px-4 py-3">{warranty.breakdownsDuringWarranty}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-500">
                      No expired warranties found for the selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 text-sm text-gray-600 border-t border-gray-200">
            Showing 1-{expiredWarranties.length} of {expiredWarranties.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default No_Of_Expired_Free_Waranty;