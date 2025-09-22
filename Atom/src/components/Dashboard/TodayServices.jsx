import React, { useState } from 'react';
import { 
  Search, Calendar, MapPin, Wrench, 
  ChevronDown, ChevronUp, Filter, 
  List, Map, User, CheckCircle, 
  Clock, AlertCircle, MoreVertical, Check,
  Download, UserPlus, ClipboardList
} from 'lucide-react';

const TodayServices = () => {
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Action Buttons - unchanged */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Today Services
          </h1>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <button 
              className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-50"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Bulk Assign
            </button>
            <button 
              className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-50"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Bulk Action
            </button>
            <button 
              className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-50"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Services Table - Alignment Fixed */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
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
                    <div className="flex items-center text-gray-500">
                      {service.month} {service.plannedDate === '✅' && <Check className="h-4 w-4 ml-1 text-green-500" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: primaryColor }}>
                    <span className="hover:underline cursor-pointer">{service.gmap}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.employee}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service.numServices}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      service.status === 'DUE' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: primaryColor }}>
                    <span className="hover:underline cursor-pointer">{service.location}</span>
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

        {/* Empty State - unchanged */}
        {services.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No services scheduled for today</h3>
            <p className="text-gray-500 mt-1">Check back later or schedule new services</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayServices;