import React, { useState } from 'react';
import { 
  Search, User, Clock, Calendar, 
  MapPin, Filter, Download, List, 
  Map, MoreVertical, Wrench, Check 
} from 'lucide-react';

const PendingAssignServices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('DUE');

  const services = [
    {
      custRefNo: 'T Nagar 10',
      liftCode: 'Chennai',
      routes: '',
      blockWing: '',
      customer: 'AL056 # Sithalapakkam 2 Mr.Manivannan - Chennai',
      serviceDate: '01.06.2026 June ✅',
      gmap: 'Click to open GMAP',
      employee: '',
      numServices: '12',
      status: 'DUE',
      location: ''
    }
    // Add more services as needed
  ];

  const statusColors = {
    DUE: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
            <Clock className="h-6 w-6 mr-2 text-yellow-600" />
            Pending Assign Services
          </h1>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button className="flex items-center bg-[#243158] text-white rounded-md px-3 py-2 text-sm">
              <List className="h-4 w-4 mr-2" />
              List View
            </button>
            <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm">
              <Map className="h-4 w-4 mr-2" />
              Map View
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="DUE">Pending Assign</option>
                <option value="OVERDUE">Overdue</option>
              </select>
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <User className="h-4 w-4 mr-2 text-orange-600" />
                Assign To
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              >
                <option>ALL</option>
                <option>Employee 1</option>
                <option>Employee 2</option>
                <option>Employee 3</option>
              </select>
            </div>
            <div className="relative md:col-span-2">
              <input
                type="text"
                placeholder="Search pending services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button className="flex items-center bg-[#243158] text-white rounded-md px-3 py-2 text-sm">
            <User className="h-4 w-4 mr-2" />
            Bulk Assign
          </button>
          <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm">
            <MoreVertical className="h-4 w-4 mr-2" />
            Bulk Actions
          </button>
          <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>

        {/* Services Table - Desktop */}
        <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">CUST REF NO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">LIFT CODE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ROUTES</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">BLOCK/WING</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">CUSTOMER</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">SERVICE DATE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">GMAP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">EMPLOYEE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">NO.OF SERVICES</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">STATUS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">LOCATION</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{service.custRefNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.liftCode}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.routes}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.blockWing}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.customer}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.serviceDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-orange-600 hover:text-orange-800 cursor-pointer">
                      {service.gmap}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {service.employee === '✅' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        service.employee
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.numServices}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[service.status]}`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {service.location === '✅' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        service.location
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Services Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {services.map((service, index) => (
            <div key={`mobile-${index}`} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{service.custRefNo}</h3>
                  <p className="text-sm text-gray-500">{service.liftCode}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${statusColors[service.status]}`}>
                  {service.status}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span>{service.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service Date:</span>
                  <span>{service.serviceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">No. of Services:</span>
                  <span>{service.numServices}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                <button className="flex items-center text-orange-600 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  View Map
                </button>
                <button className="flex items-center bg-[#243158] text-white rounded-md px-3 py-1 text-sm">
                  <User className="h-4 w-4 mr-1" />
                  Assign
                </button>
                <button className="flex items-center text-gray-600 text-sm">
                  <Wrench className="h-4 w-4 mr-1" />
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {services.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No pending services to assign</h3>
            <p className="text-gray-500 mt-1">All services have been assigned to employees</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingAssignServices;