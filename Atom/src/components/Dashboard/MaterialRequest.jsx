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
          {/* Table Header */}
          <div className="grid grid-cols-8 bg-gray-100 p-3 font-medium text-gray-700 text-sm border-b border-gray-200">
            <div className="px-2">DATE</div>
            <div className="px-2">NAME</div>
            <div className="px-2">DESCRIPTION</div>
            <div className="px-2">ITEM</div>
            <div className="px-2">BRAND</div>
            <div className="px-2">FILE</div>
            <div className="px-2">ADDED BY</div>
            <div className="px-2">REQUESTED BY</div>
          </div>
          
          {/* Table Rows */}
          {requests.length > 0 ? (
            requests.map((request, index) => (
              <div key={index} className="grid grid-cols-8 p-3 border-b border-gray-200 text-sm items-center">
                <div className="px-2">{request.date}</div>
                <div className="px-2 font-medium">{request.name}</div>
                <div className="px-2">{request.description}</div>
                <div className="px-2">{request.item}</div>
                <div className="px-2">{request.brand || '-'}</div>
                <div className="px-2">{request.file}</div>
                <div className="px-2">{request.addedBy}</div>
                <div className="px-2">{request.requestedBy}</div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No data to show
            </div>
          )}

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