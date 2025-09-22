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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Routine Services</h1>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <button 
              className="flex items-center bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Bulk Assign
            </button>
            <button 
              className="flex items-center bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Bulk Action
            </button>
            <button 
              className="flex items-center bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
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

        {/* Period Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-700 flex items-center">
              <Calendar className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
              Period
            </h2>
            <button onClick={() => setExpandedPeriod(!expandedPeriod)}>
              {expandedPeriod ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {expandedPeriod && (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Period</div>
                <select className="w-full border border-gray-300 rounded p-2">
                  <option>ALL TIME</option>
                </select>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Month</div>
                <select className="w-full border border-gray-300 rounded p-2">
                  <option>ALL</option>
                </select>
              </div>
              <div>
                <div className="text-gray-500 mb-1">By Date</div>
                <select className="w-full border border-gray-300 rounded p-2">
                  <option>PLANNED DATE</option>
                </select>
              </div>
              <div>
                <div className="text-gray-500 mb-1">AMC</div>
                <select className="w-full border border-gray-300 rounded p-2">
                  <option>NONE</option>
                </select>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Status</div>
                <select className="w-full border border-gray-300 rounded p-2">
                  <option>ALL</option>
                </select>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Employee</div>
                <select className="w-full border border-gray-300 rounded p-2">
                  <option>ALL</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Route Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-700 flex items-center">
              <MapPin className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
              CLUST REF NO / LIFT CODE
            </h2>
            <button onClick={() => setExpandedRoute(!expandedRoute)}>
              {expandedRoute ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {expandedRoute && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-gray-500 mb-1">By</div>
                <select className="w-full border border-gray-300 rounded p-2">
                  <option>ALL</option>
                </select>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Routes</div>
                <select className="w-full border border-gray-300 rounded p-2">
                  <option>ALL ROUTE</option>
                </select>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Lift</div>
                <select className="w-full border border-gray-300 rounded p-2">
                  <option>ALL LIFT</option>
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

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-gray-100 p-3 font-medium text-gray-700 text-sm border-b border-gray-200">
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
          
          {/* Table Row */}
          {services.map((service, index) => (
            <div key={index} className="grid grid-cols-12 p-3 border-b border-gray-200 text-sm items-center">
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
                <span className={`px-2 py-1 rounded-full text-xs ${
                  service.status === 'DUE' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {service.status}
                </span>
              </div>
              <div className="col-span-1 px-2" style={{ color: primaryColor }}>
                <span className="hover:underline cursor-pointer">{service.location}</span>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="p-3 text-sm text-gray-600 border-t border-gray-200">
            Showing 1-09 of 78
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineServices;