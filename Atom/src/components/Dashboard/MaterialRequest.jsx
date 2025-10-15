import React, { useState } from 'react';
import { 
  Search, ChevronDown, ChevronUp, 
  Download, Upload, Package, Plus 
} from 'lucide-react';

const MaterialRequest = () => {
  const [expandedFilters, setExpandedFilters] = useState(true);
  const primaryColor = '#243158';

  // Sample material request data
  const requests = [
    {
      date: '27.11.2024',
      name: 'Landing Button',
      description: 'Button not working',
      item: 'Button',
      brand: '',
      file: 'Saravanan S',
      addedBy: 'Complaint # 381',
      requestedBy: 'KORATTUR 1 - BALA GOPAL'
    },
    // Add more requests as needed
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Routine Services Monthly Load</h1>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <button 
              className="flex items-center bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Request
            </button>
            <button 
              className="flex items-center bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-700 flex items-center">
              <Package className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
              Filters
            </h2>
            <button onClick={() => setExpandedFilters(!expandedFilters)}>
              {expandedFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {expandedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Date Range</div>
                <select className="w-full border border-gray-300 rounded p-2">
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                  <option>Custom Range</option>
                </select>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Item</div>
                <select className="w-full border border-gray-300 rounded p-2">
                  <option>All Items</option>
                </select>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Status</div>
                <select className="w-full border border-gray-300 rounded p-2">
                  <option>All Statuses</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  className="flex items-center justify-center text-white rounded p-2 w-full transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile View - Card Layout */}
          <div className="block md:hidden">
            {requests.length > 0 ? (
              requests.map((request, index) => (
                <div key={index} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-gray-900">{request.name}</div>
                      <div className="text-xs text-gray-500">{request.date}</div>
                    </div>
                    <div className="text-sm text-gray-600">{request.description}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Item:</span>
                        <span className="ml-1">{request.item}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Brand:</span>
                        <span className="ml-1">{request.brand || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">File:</span>
                        <span className="ml-1">{request.file}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Added By:</span>
                        <span className="ml-1">{request.addedBy}</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Requested By:</span>
                      <span className="ml-1">{request.requestedBy}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No data to show
              </div>
            )}
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="grid grid-cols-8 bg-gray-100 p-3 font-medium text-gray-700 text-sm border-b border-gray-200 min-w-[800px]">
                <div className="px-2 min-w-[80px]">DATE</div>
                <div className="px-2 min-w-[120px]">NAME</div>
                <div className="px-2 min-w-[150px]">DESCRIPTION</div>
                <div className="px-2 min-w-[100px]">ITEM</div>
                <div className="px-2 min-w-[100px]">BRAND</div>
                <div className="px-2 min-w-[100px]">FILE</div>
                <div className="px-2 min-w-[120px]">ADDED BY</div>
                <div className="px-2 min-w-[150px]">REQUESTED BY</div>
              </div>
              
              {/* Table Rows */}
              {requests.length > 0 ? (
                requests.map((request, index) => (
                  <div key={index} className="grid grid-cols-8 p-3 border-b border-gray-200 text-sm items-center min-w-[800px]">
                    <div className="px-2 min-w-[80px]">{request.date}</div>
                    <div className="px-2 min-w-[120px] font-medium">{request.name}</div>
                    <div className="px-2 min-w-[150px]">{request.description}</div>
                    <div className="px-2 min-w-[100px]">{request.item}</div>
                    <div className="px-2 min-w-[100px]">{request.brand || '-'}</div>
                    <div className="px-2 min-w-[100px]">{request.file}</div>
                    <div className="px-2 min-w-[120px]">{request.addedBy}</div>
                    <div className="px-2 min-w-[150px]">{request.requestedBy}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No data to show
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="p-3 text-sm text-gray-600 border-t border-gray-200">
            Showing 1-{requests.length} of {requests.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialRequest;