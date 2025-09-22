import React, { useState } from 'react';
import { 
  Search, MapPin, ChevronDown, Filter, 
  List, Map, Check, Calendar, User,
  UserPlus, ClipboardList, Download, Upload
} from 'lucide-react';

const RouteWiseServices = () => {
  const primaryColor = '#243158';
  const [selectedRoute, setSelectedRoute] = useState('ALL TIME');

  const services = [
    {
      custRefNo: 'T Nagar 10',
      liftCode: 'Chennai',
      routes: 'AL056 # Sithalapakkam',
      blockWing: '2',
      customer: 'Mr.Manivannan - Chennai',
      serviceDate: '01.06.2026',
      gmap: 'Click to open',
      employee: '12',
      numServices: '✅',
      status: 'DUE',
      location: 'GMAP',
      month: 'June'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Action Buttons - Keeping all buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Route wise Services</h1>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {/* <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button> */}
            {/* <button className="flex items-center bg-orange-600 text-white rounded-md px-3 py-2 text-sm">
              <List className="h-4 w-4 mr-2" />
              List View
            </button> */}
            {/* <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm">
              <Map className="h-4 w-4 mr-2" />
              Map View
            </button> */}
            <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Bulk Assign
            </button>
            <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm">
              <ClipboardList className="h-4 w-4 mr-2" />
              Bulk Action
            </button>
            {/* <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </button> */}
            <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Route Filter */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <MapPin className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                Routes
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              >
                <option>ALL TIME</option>
                <option>Route 1</option>
                <option>Route 2</option>
                <option>Route 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Table - Fixed Alignment */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">CUST REF NO</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">LIFT CODE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">ROUTES</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">BLOCK/WING</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">CUSTOMER</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">SERVICE DATE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">GMAP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">EMPLOYEE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">NO.OF SERVICES</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">STATUS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">LOCATION</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{service.custRefNo}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.liftCode}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.routes}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.blockWing}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.customer}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <div>{service.serviceDate}</div>
                    <div className="text-gray-500">{service.month}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: primaryColor }}>
                    <span className="hover:underline cursor-pointer">{service.gmap}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.employee}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      service.status === 'DUE' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
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

export default RouteWiseServices;