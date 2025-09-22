import React, { useState } from 'react';
import { 
  Search, Printer, Check, Copy,
  FileText, File, MoreVertical, Calendar
} from 'lucide-react';

const LifeWiseComplaint = () => {
  const primaryColor = '#243158';
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Sample data
  const complaints = [
    {
      complaintNo: 'CMP-2025-001',
      date: '15.07.2025',
      amcId: 'AMC-1024',
      siteId: 'SITE-5678',
      customer: 'Mr. Rajesh - Chennai',
      type: 'Electrical',
      problem: 'Lift not working',
      resolution: 'Fuse replaced',
      doneBy: 'Technician 1',
      status: 'Closed',
      lift: 'LIFT-001'
    },
    // Add more complaints as needed
  ];

  const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();

  const [filters, setFilters] = useState({
    customer: '',
    lifts: '',
    routes: '',
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
          <h1 className="text-2xl font-bold text-gray-800">Life Wise Complaints Report</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
              <label className="text-gray-500 mb-1 block">Lifts</label>
              <select 
                name="lifts"
                className="w-full border border-gray-300 rounded p-2"
                value={filters.lifts}
                onChange={handleFilterChange}
              >
                <option value="">SELECT</option>
                <option>Lift 1</option>
                <option>Lift 2</option>
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

            {/* Row 2 */}
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

            <div className="md:col-start-3 flex items-end">
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

        {/* Complaints Table with Horizontal Scroll */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]"> {/* Set minimum width to accommodate all columns */}
              {/* Table Header */}
              <div className="grid grid-cols-12 bg-gray-100 p-3 font-medium text-gray-700 text-sm border-b border-gray-200">
                <div className="px-2">COMPLAINT NO</div>
                <div className="px-2">DATE</div>
                <div className="px-2">AMC ID</div>
                <div className="px-2">SITE ID</div>
                <div className="px-2">CUSTOMER</div>
                <div className="px-2">TYPE</div>
                <div className="px-2">PROBLEM</div>
                <div className="px-2">RESOLUTION</div>
                <div className="px-2">DONE BY</div>
                <div className="px-2">STATUS</div>
                <div className="px-2">CLOSE</div>
                <div className="px-2">PRINT</div>
              </div>
              
              {/* Table Rows */}
              {complaints.length > 0 ? (
                complaints.map((complaint, index) => (
                  <div key={index} className="grid grid-cols-12 p-3 border-b border-gray-200 text-sm items-center">
                    <div className="px-2 font-medium">{complaint.complaintNo}</div>
                    <div className="px-2">{complaint.date}</div>
                    <div className="px-2">{complaint.amcId}</div>
                    <div className="px-2">{complaint.siteId}</div>
                    <div className="px-2">{complaint.customer}</div>
                    <div className="px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        complaint.type === 'Electrical' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {complaint.type}
                      </span>
                    </div>
                    <div className="px-2">{complaint.problem}</div>
                    <div className="px-2">{complaint.resolution}</div>
                    <div className="px-2">{complaint.doneBy}</div>
                    <div className="px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        complaint.status === 'Closed' ? 'bg-green-100 text-green-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </div>
                    <div className="px-2">
                      {complaint.status !== 'Closed' && (
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="px-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 col-span-12">
                  No complaints found for the selected period
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="p-3 text-sm text-gray-600 border-t border-gray-200">
            Showing 1-{complaints.length} of {complaints.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeWiseComplaint;