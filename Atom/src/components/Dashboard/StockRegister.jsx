import React, { useState } from 'react';
import { 
  Search, ChevronDown, ChevronUp, 
  Download, Package 
} from 'lucide-react';

const StockRegister = () => {
  const [expandedFilters, setExpandedFilters] = useState(true);
  const primaryColor = '#243158';

  // Sample stock data - replace with your actual data
  const stockItems = [
    {
      no: '1',
      item: 'Lubricant Oil',
      unit: 'Liter',
      description: 'High-grade elevator lubricant',
      type: 'Consumable',
      value: '₹1,200',
      inwardStock: '50',
      outwardStock: '25',
      availableStock: '25'
    },
    {
      no: '2',
      item: 'Brake Pads',
      unit: 'Pair',
      description: 'Elevator brake system component',
      type: 'Spare',
      value: '₹3,500',
      inwardStock: '20',
      outwardStock: '12',
      availableStock: '8'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-0">Stock Register</h1>
          <div className="flex flex-wrap gap-2">
            <button 
              className="flex items-center bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-700 flex items-center text-sm sm:text-base">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" style={{ color: primaryColor }} />
              Filters
            </h2>
            <button onClick={() => setExpandedFilters(!expandedFilters)}>
              {expandedFilters ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>

          {expandedFilters && (
            <div className="space-y-3 sm:space-y-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 mb-1 text-xs sm:text-sm">Item</div>
                  <select className="w-full border border-gray-300 rounded p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]">
                    <option>ALL ITEMS</option>
                  </select>
                </div>
                <div>
                  <div className="text-gray-500 mb-1 text-xs sm:text-sm">Type</div>
                  <select className="w-full border border-gray-300 rounded p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]">
                    <option>ALL TYPES</option>
                    <option>Consumable</option>
                    <option>Spare</option>
                    <option>Equipment</option>
                  </select>
                </div>
                <div>
                  <div className="text-gray-500 mb-1 text-xs sm:text-sm">Stock Status</div>
                  <select className="w-full border border-gray-300 rounded p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]">
                    <option>ALL</option>
                    <option>In Stock</option>
                    <option>Low Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-center sm:justify-end">
                <button 
                  className="flex items-center justify-center text-white rounded p-2 sm:p-3 w-full sm:w-auto transition-colors text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stock Table/Cards */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table Header - Hidden on mobile */}
          <div className="hidden lg:grid grid-cols-9 bg-gray-100 p-3 font-medium text-gray-700 text-sm border-b border-gray-200">
            <div className="px-2">NO</div>
            <div className="px-2">ITEM</div>
            <div className="px-2">UNIT</div>
            <div className="px-2">DESCRIPTION</div>
            <div className="px-2">TYPE</div>
            <div className="px-2">VALUE</div>
            <div className="px-2">INWARD STOCK</div>
            <div className="px-2">OUTWARD STOCK</div>
            <div className="px-2">AVAILABLE STOCK</div>
          </div>
          
          {/* Table Rows */}
          {stockItems.length > 0 ? (
            stockItems.map((item, index) => (
              <div key={index}>
                {/* Desktop Table Row */}
                <div className="hidden lg:grid grid-cols-9 p-3 border-b border-gray-200 text-sm items-center">
                  <div className="px-2">{item.no}</div>
                  <div className="px-2 font-medium">{item.item}</div>
                  <div className="px-2">{item.unit}</div>
                  <div className="px-2">{item.description}</div>
                  <div className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.type === 'Consumable' ? 'bg-blue-100 text-blue-800' : 
                      item.type === 'Spare' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <div className="px-2">{item.value}</div>
                  <div className="px-2">{item.inwardStock}</div>
                  <div className="px-2">{item.outwardStock}</div>
                  <div className="px-2 font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      parseInt(item.availableStock) < 10 ? 'bg-red-100 text-red-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.availableStock}
                    </span>
                  </div>
                </div>

                {/* Mobile Card Layout */}
                <div className="lg:hidden p-4 border-b border-gray-200">
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">#{item.no}</h3>
                        <p className="text-sm font-medium text-gray-900">{item.item}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.type === 'Consumable' ? 'bg-blue-100 text-blue-800' : 
                        item.type === 'Spare' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.type}
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Description:</p>
                      <p className="text-sm text-gray-900">{item.description}</p>
                    </div>

                    {/* Stock Information Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Unit:</p>
                        <p className="text-sm font-medium text-gray-900">{item.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Value:</p>
                        <p className="text-sm font-medium text-gray-900">{item.value}</p>
                      </div>
                    </div>

                    {/* Stock Movement */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Inward</p>
                        <p className="text-sm font-medium text-gray-900">{item.inwardStock}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Outward</p>
                        <p className="text-sm font-medium text-gray-900">{item.outwardStock}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Available</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          parseInt(item.availableStock) < 10 ? 'bg-red-100 text-red-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.availableStock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No data to show
            </div>
          )}

          {/* Pagination */}
          <div className="p-3 text-xs sm:text-sm text-gray-600 border-t border-gray-200">
            Showing 1-{stockItems.length} of {stockItems.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockRegister;