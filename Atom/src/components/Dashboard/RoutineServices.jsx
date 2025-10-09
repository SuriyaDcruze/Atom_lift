import React, { useState } from 'react';
import {
  Search, Calendar, MapPin, ChevronDown,
  ChevronUp, Check, UserPlus, ClipboardList,
  Download, Upload
} from 'lucide-react';

const RoutineServices = () => {
  const [expandedPeriod, setExpandedPeriod] = useState(true);
  const [expandedRoute, setExpandedRoute] = useState(true);
  const primaryColor = '#243158';

  const services = [
    {
      custRefNo: 'T Nagar 10',
      liftCode: 'Chennai',
      routes: 'AL056 # Sithalapakkam',
      blockWing: '2',
      customer: 'Mr.Manivannan - - Chennai',
      serviceDate: '01.06.2026',
      gmap: 'Click to open',
      employee: '',
      numServices: '12',
      status: 'DUE',
      location: 'GMAP',
      month: 'June',
      plannedDate: '✅'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-0">Routine Services</h1>
          <div className="flex flex-wrap gap-2">
            <button
              className="flex items-center bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Bulk Assign</span>
            </button>
            <button
              className="flex items-center bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Bulk Action</span>
            </button>
            <button
              className="flex items-center bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>
            <button
              className="flex items-center bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Period Section */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-700 flex items-center text-sm sm:text-base">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" style={{ color: primaryColor }} />
              Period
            </h2>
            <button onClick={() => setExpandedPeriod(!expandedPeriod)}>
              {expandedPeriod ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>

          {expandedPeriod && (
            <div className="space-y-3 sm:space-y-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 mb-1 text-xs sm:text-sm">Period</div>
                  <select className="w-full border border-gray-300 rounded p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]">
                    <option>ALL TIME</option>
                    <option>LAST MONTH</option>
                    <option>THIS MONTH</option>
                    <option>LAST YEAR</option>
                    <option>THIS YEAR</option>
                    <option>LAST 3 MONTHS</option>
                    <option>LAST 6 MONTHS</option>
                    <option>LAST 12 MONTHS</option>
                    <option>CUSTOM</option>
                  </select>
                </div>
                <div>
                  <div className="text-gray-500 mb-1 text-xs sm:text-sm">Month</div>
                  <select className="w-full border border-gray-300 rounded p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]">
                    <option>ALL</option>
                    <option>JANUARY</option>
                    <option>FEBRUARY</option>
                    <option>MARCH</option>
                    <option>APRIL</option>
                    <option>MAY</option>
                    <option>JUNE</option>
                    <option>JULY</option>
                    <option>AUGUST</option>
                    <option>SEPTEMBER</option>
                    <option>OCTOBER</option>
                    <option>NOVEMBER</option>
                    <option>DECEMBER</option>
                  </select>
                </div>
                <div>
                  <div className="text-gray-500 mb-1 text-xs sm:text-sm">By Date</div>
                  <select className="w-full border border-gray-300 rounded p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]">
                    <option>PLANNED DATE</option>
                    <option>ATTEND DATE</option>
                  </select>
                </div>
                <div>
                  <div className="text-gray-500 mb-1 text-xs sm:text-sm">AMC</div>
                  <select className="w-full border border-gray-300 rounded p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]">
                    <option>NONE</option>
                  </select>
                </div>
                <div>
                  <div className="text-gray-500 mb-1 text-xs sm:text-sm">Status</div>
                  <select className="w-full border border-gray-300 rounded p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]">
                    <option>ALL</option>
                    <option>DUE</option>
                    <option>OVER DUE</option>
                    <option>IN PROGRESS</option>
                    <option>COMPLETED</option>
                  </select>
                </div>
                <div>
                  <div className="text-gray-500 mb-1 text-xs sm:text-sm">Employee</div>
                  <select className="w-full border border-gray-300 rounded p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]">
                    <option>ALL</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Route Section */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-700 flex items-center text-sm sm:text-base">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" style={{ color: primaryColor }} />
              <span className="hidden sm:inline">CLUST REF NO / LIFT CODE</span>
              <span className="sm:hidden">ROUTES</span>
            </h2>
            <button onClick={() => setExpandedRoute(!expandedRoute)}>
              {expandedRoute ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>

          {expandedRoute && (
            <div className="space-y-3 sm:space-y-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 mb-1 text-xs sm:text-sm">By</div>
                  <select className="w-full border border-gray-300 rounded p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]">
                    <option>ALL</option>
                    <option>ASSIGNED</option>
                    <option>NON ASSIGNED</option>
                  </select>
                </div>
                <div>
                  <div className="text-gray-500 mb-1 text-xs sm:text-sm">Routes</div>
                  <select className="w-full border border-gray-300 rounded p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]">
                    <option>ALL ROUTE</option>
                  </select>
                </div>
                <div>
                  <div className="text-gray-500 mb-1 text-xs sm:text-sm">Lift</div>
                  <select className="w-full border border-gray-300 rounded p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]">
                    <option>ALL LIFT</option>
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

        {/* Services Table/Cards */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table Header - Hidden on mobile */}
          <div className="hidden lg:grid grid-cols-12 bg-gray-100 p-3 font-medium text-gray-700 text-sm border-b border-gray-200">
            <div className="col-span-1 px-2">CUST REF NO</div>
            <div className="col-span-1 px-2">LIFT CODE</div>
            <div className="col-span-1 px-2">ROUTES</div>
            <div className="col-span-1 px-2">BLOCK/WING</div>
            <div className="col-span-2 px-2">CUSTOMER</div>
            <div className="col-span-1 px-2">SERVICE DATE</div>
            <div className="col-span-1 px-2">GMAP</div>
            <div className="col-span-1 px-2">EMPLOYEE</div>
            <div className="col-span-1 px-2">NO.OF SERVICES</div>
            <div className="col-span-1 px-2">STATUS</div>
            <div className="col-span-1 px-2">LOCATION</div>
          </div>

          {/* Table Rows */}
          {services.map((service, index) => (
            <div key={index}>
              {/* Desktop Table Row */}
              <div className="hidden lg:grid grid-cols-12 p-3 border-b border-gray-200 text-sm items-center">
                <div className="col-span-1 px-2">{service.custRefNo}</div>
                <div className="col-span-1 px-2">{service.liftCode}</div>
                <div className="col-span-1 px-2">{service.routes}</div>
                <div className="col-span-1 px-2">{service.blockWing}</div>
                <div className="col-span-2 px-2">{service.customer}</div>
                <div className="col-span-1 px-2">
                  <div>{service.serviceDate}</div>
                  <div className="flex items-center">
                    {service.month} {service.plannedDate === '✅' && <Check className="h-4 w-4 ml-1 text-green-500" />}
                  </div>
                </div>
                <div className="col-span-1 px-2" style={{ color: primaryColor }}>
                  <span className="hover:underline cursor-pointer">{service.gmap}</span>
                </div>
                <div className="col-span-1 px-2">{service.employee}</div>
                <div className="col-span-1 px-2">{service.numServices}</div>
                <div className="col-span-1 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${service.status === 'DUE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {service.status}
                  </span>
                </div>
                <div className="col-span-1 px-2" style={{ color: primaryColor }}>
                  <span className="hover:underline cursor-pointer">{service.location}</span>
                </div>
              </div>

              {/* Mobile Card Layout */}
              <div className="lg:hidden p-4 border-b border-gray-200">
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">#{service.custRefNo}</h3>
                      <p className="text-sm text-gray-600">{service.liftCode}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      service.status === 'DUE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {service.status}
                    </span>
                  </div>

                  {/* Customer & Route Info */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer:</p>
                    <p className="text-sm text-gray-900">{service.customer}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Route:</p>
                    <p className="text-sm text-gray-900">{service.routes}</p>
                  </div>

                  {/* Service Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Block/Wing:</p>
                      <p className="text-sm font-medium text-gray-900">{service.blockWing}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">No. of Services:</p>
                      <p className="text-sm font-medium text-gray-900">{service.numServices}</p>
                    </div>
                  </div>

                  {/* Service Date */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Service Date:</p>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{service.serviceDate}</span>
                      <span className="ml-2 text-sm text-gray-600">{service.month}</span>
                      {service.plannedDate === '✅' && <Check className="h-4 w-4 ml-1 text-green-500" />}
                    </div>
                  </div>

                  {/* Employee */}
                  {service.employee && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Employee:</p>
                      <p className="text-sm text-gray-900">{service.employee}</p>
                    </div>
                  )}

                  {/* Action Links */}
                  <div className="flex gap-4 pt-2">
                    <span 
                      className="text-sm hover:underline cursor-pointer"
                      style={{ color: primaryColor }}
                    >
                      {service.gmap}
                    </span>
                    <span 
                      className="text-sm hover:underline cursor-pointer"
                      style={{ color: primaryColor }}
                    >
                      {service.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="p-3 text-xs sm:text-sm text-gray-600 border-t border-gray-200">
            Showing 1-09 of 78
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineServices;