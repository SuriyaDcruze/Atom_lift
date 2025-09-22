import React, { useState } from 'react';
import { 
  Search, Printer, Copy, FileText, 
  File, MoreVertical, Calendar 
} from 'lucide-react';

const ExpiringReport = () => {
  const primaryColor = '#243158';
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Sample expiring AMC data
  const expiringAMCs = [
    {
      sno: '1',
      ltma: 'LTMA-001',
      siteName: 'T-Nagar Complex',
      city: 'Chennai',
      state: 'Tamil Nadu',
      mobileNo: '9876543210',
      amcReference: 'AMC-2025-001',
      amcType: 'Comprehensive',
      contractAmount: '₹50,000',
      startDate: '15.07.2024',
      expiringOn: '15.07.2025'
    },
    {
      sno: '2',
      ltma: 'LTMA-002',
      siteName: 'Gachibowli Tech Park',
      city: 'Hyderabad',
      state: 'Telangana',
      mobileNo: '8765432109',
      amcReference: 'AMC-2025-002',
      amcType: 'Basic',
      contractAmount: '₹35,000',
      startDate: '20.07.2024',
      expiringOn: '20.07.2025'
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
    provinceState: '',
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
          <h1 className="text-2xl font-bold text-gray-800">Expiring AMC</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
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
              <label className="text-gray-500 mb-1 block">Province/State</label>
              <select 
                name="provinceState"
                className="w-full border border-gray-300 rounded p-2"
                value={filters.provinceState}
                onChange={handleFilterChange}
              >
                <option value="">SELECT</option>
                <option>Tamil Nadu</option>
                <option>Telangana</option>
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

            <div className="md:col-start-5 flex items-end">
              <button 
                className="flex items-center justify-center text-white rounded p-2 w-full transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Expiring AMC Table - Improved Alignment */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-200">
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[50px]">S.NO</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[100px]">LTMA NO</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap min-w-[150px]">SITE NAME</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[100px]">CITY</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[100px]">STATE</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[120px]">MOBILE NO</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[120px]">AMC REFERENCE</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[100px]">AMC TYPE</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap w-[150px]">CONTRACT AMOUNT</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[120px]">START DATE</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap w-[120px]">EXPIRING ON</th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody>
                {expiringAMCs.length > 0 ? (
                  expiringAMCs.map((amc, index) => (
                    <tr key={index} className="border-b border-gray-200 text-sm">
                      <td className="px-4 py-3">{amc.sno}</td>
                      <td className="px-4 py-3 font-medium">{amc.ltma}</td>
                      <td className="px-4 py-3">{amc.siteName}</td>
                      <td className="px-4 py-3">{amc.city}</td>
                      <td className="px-4 py-3">{amc.state}</td>
                      <td className="px-4 py-3">{amc.mobileNo}</td>
                      <td className="px-4 py-3">{amc.amcReference}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          amc.amcType === 'Comprehensive' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {amc.amcType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{amc.contractAmount}</td>
                      <td className="px-4 py-3">{amc.startDate}</td>
                      <td className="px-4 py-3">{amc.expiringOn}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="p-4 text-center text-gray-500">
                      No expiring AMCs found for the selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 text-sm text-gray-600 border-t border-gray-200">
            Showing 1-{expiringAMCs.length} of {expiringAMCs.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiringReport;