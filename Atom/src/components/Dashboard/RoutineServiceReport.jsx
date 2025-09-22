import React, { useState } from 'react';
import { 
  Search, Printer, Copy, FileText, 
  File, MoreVertical, Calendar 
} from 'lucide-react';

const RoutineServiceReport = () => {
  const primaryColor = '#243158';
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Sample data
  const serviceReports = [
    {
      date: '15.07.2025',
      amcId: 'AMC-2025-001',
      startDate: '01.01.2025',
      endDate: '31.12.2025',
      amcType: 'Comprehensive',
      contractAmount: '₹50,000',
      paidAmount: '₹30,000',
      dueAmount: '₹20,000',
      customer: 'Mr. Rajesh - Chennai',
      siteAddress: '12, Main Road, T-Nagar, Chennai'
    },
    // Add more reports as needed
  ];

  const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();

  const [filters, setFilters] = useState({
    customer: '',
    by: 'DATE',
    routes: '',
    status: 'ALL',
    amcTypes: '',
    period: 'MONTH',
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
          <h1 className="text-2xl font-bold text-gray-800">Routine Services Reports</h1>
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
            {/* Row 1 */}
            <div>
              <label className="text-gray-500 mb-1 block">Customer</label>
              <select 
                name="customer"
                className="w-full border border-gray-300 rounded p-2"
                value={filters.customer}
                onChange={handleFilterChange}
              >
                <option value="">SELECT</option>
                <option>Customer 1</option>
                <option>Customer 2</option>
              </select>
            </div>

            <div>
              <label className="text-gray-500 mb-1 block">By</label>
              <select 
                name="by"
                className="w-full border border-gray-300 rounded p-2"
                value={filters.by}
                onChange={handleFilterChange}
              >
                <option>DATE</option>
                <option>AMC TYPE</option>
                <option>CUSTOMER</option>
              </select>
            </div>

            <div>
              <label className="text-gray-500 mb-1 block">Routes</label>
              <select 
                name="routes"
                className="w-full border border-gray-300 rounded p-2"
                value={filters.routes}
                onChange={handleFilterChange}
              >
                <option value="">SELECT</option>
                <option>Route 1</option>
                <option>Route 2</option>
              </select>
            </div>

            <div>
              <label className="text-gray-500 mb-1 block">Status</label>
              <select 
                name="status"
                className="w-full border border-gray-300 rounded p-2"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option>ALL</option>
                <option>Active</option>
                <option>Completed</option>
              </select>
            </div>

            {/* Row 2 */}
            <div>
              <label className="text-gray-500 mb-1 block">AMC Types</label>
              <select 
                name="amcTypes"
                className="w-full border border-gray-300 rounded p-2"
                value={filters.amcTypes}
                onChange={handleFilterChange}
              >
                <option value="">SELECT</option>
                <option>Comprehensive</option>
                <option>Basic</option>
              </select>
            </div>

            <div>
              <label className="text-gray-500 mb-1 block">Period</label>
              <select 
                name="period"
                className="w-full border border-gray-300 rounded p-2"
                value={filters.period}
                onChange={handleFilterChange}
              >
                <option>MONTH</option>
                <option>WEEK</option>
                <option>QUARTER</option>
              </select>
            </div>

            <div>
              <label className="text-gray-500 mb-1 block">Month+</label>
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
              <label className="text-gray-500 mb-1 block">Start Date+</label>
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

            {/* Row 3 */}
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

            <div className="md:col-start-4 flex items-end">
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

        {/* Service Reports Table with Horizontal Scroll */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Table Header */}
              <div className="grid grid-cols-10 bg-gray-100 p-3 font-medium text-gray-700 text-sm border-b border-gray-200">
                <div className="px-2">DATE</div>
                <div className="px-2">AMC ID</div>
                <div className="px-2">START DATE</div>
                <div className="px-2">END DATE</div>
                <div className="px-2">AMC TYPE</div>
                <div className="px-2">CONTRACT AMOUNT</div>
                <div className="px-2">PAID AMOUNT</div>
                <div className="px-2">DUE AMOUNT</div>
                <div className="px-2">CUSTOMER</div>
                <div className="px-2">SITE ADDRESS</div>
              </div>
              
              {/* Table Rows */}
              {serviceReports.length > 0 ? (
                serviceReports.map((report, index) => (
                  <div key={index} className="grid grid-cols-10 p-3 border-b border-gray-200 text-sm items-center">
                    <div className="px-2">{report.date}</div>
                    <div className="px-2 font-medium">{report.amcId}</div>
                    <div className="px-2">{report.startDate}</div>
                    <div className="px-2">{report.endDate}</div>
                    <div className="px-2">{report.amcType}</div>
                    <div className="px-2">{report.contractAmount}</div>
                    <div className="px-2">{report.paidAmount}</div>
                    <div className="px-2">{report.dueAmount}</div>
                    <div className="px-2">{report.customer}</div>
                    <div className="px-2">{report.siteAddress}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 col-span-10">
                  No service reports found for the selected filters
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="p-3 text-sm text-gray-600 border-t border-gray-200">
            Showing 1-{serviceReports.length} of {serviceReports.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineServiceReport;