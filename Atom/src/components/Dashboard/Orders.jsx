import React from 'react';
import { 
  Search, 
  Printer, 
  Download, 
  Plus, 
  FileText,
  User,
  Calendar,
  CheckCircle,
  Clock,
  List,
  ChevronDown
} from 'lucide-react';

const Orders = () => {
  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex flex-row flex-wrap gap-2">
          <button className="px-4 py-2 bg-white border rounded-lg shadow-md flex items-center gap-2">
            <List className="h-4 w-4" />
            Bulk Actions
          </button>
          <button className="px-4 py-2 bg-[#243158] text-white rounded-lg shadow-md flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="px-4 py-2 bg-[#243158] text-white rounded-lg shadow-md flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Complaint
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[150px]">
          <select className="w-full p-2 pl-10 border rounded-lg shadow-md appearance-none bg-white">
            <option>ALL TIME</option>
            <option>THIS WEEK</option>
            <option>THIS MONTH</option>
          </select>
          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        </div>
        
        <div className="relative flex-1 min-w-[150px]">
          <select className="w-full p-2 pl-10 border rounded-lg shadow-md appearance-none bg-white">
            <option>ALL STATUS</option>
            <option>OPEN</option>
            <option>CLOSED</option>
          </select>
          <CheckCircle className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        </div>
        
        <div className="relative flex-1 min-w-[150px]">
          <select className="w-full p-2 pl-10 border rounded-lg shadow-md appearance-none bg-white">
            <option>ALL CREATORS</option>
            <option>CRM ADMIN</option>
            <option>CUSTOMER</option>
          </select>
          <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        </div>
        
        <div className="relative flex-1 min-w-[150px]">
          <select className="w-full p-2 border rounded-lg shadow-md bg-white">
            <option>ALL CITIES</option>
            <option>CHENNAI</option>
            <option>BANGALORE</option>
          </select>
        </div>
        
        <div className="relative flex-1 min-w-[150px]">
          <select className="w-full p-2 border rounded-lg shadow-md bg-white">
            <option>ALL ASSIGNEES</option>
            <option>GOPINATH D</option>
            <option>OTHERS</option>
          </select>
        </div>
        
        <button className="px-4 py-2 bg-[#243158] text-white rounded-lg shadow-md flex items-center justify-center gap-2 flex-1 min-w-[150px]">
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3 min-w-[50px] text-sm font-medium">ID</th>
              <th className="p-3 min-w-[100px] text-sm font-medium">CREATED</th>
              <th className="p-3 min-w-[80px] text-sm font-medium whitespace-nowrap">CREATED BY</th>
              <th className="p-3 min-w-[80px] text-sm font-medium">STATUS</th>
              <th className="p-3 min-w-[120px] text-sm font-medium">SUBJECT</th>
              <th className="p-3 min-w-[200px] text-sm font-medium">CUSTOMER</th>
              <th className="p-3 min-w-[120px] text-sm font-medium">BLOCK/WING</th>
              <th className="p-3 min-w-[100px] text-sm font-medium">CITY</th>
              <th className="p-3 min-w-[120px] text-sm font-medium">ASSIGNED TO</th>
              <th className="p-3 min-w-[80px] text-sm font-medium">SOLUTION</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="p-3 text-sm">567</td>
              <td className="p-3 text-sm">23.06.2025</td>
              <td className="p-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <FileText className="h-3 w-3 mr-1" />
                  CRM ADMIN
                </span>
              </td>
              <td className="p-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Open
                </span>
              </td>
              <td className="p-3 text-sm">Call Book Admin</td>
              <td className="p-3 text-sm">Adyar 4 Ms.Anugriha At Chennai Associates</td>
              <td className="p-3 text-sm">Main Building</td>
              <td className="p-3 text-sm">Chennai</td>
              <td className="p-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  <User className="h-3 w-3 mr-1" />
                  Gopinath D
                </span>
              </td>
              <td className="p-3">
                <button className="text-gray-500 hover:text-orange-500">
                  <Printer className="h-4 w-4" />
                </button>
              </td>
            </tr>
            {/* Additional row example */}
            <tr className="border-b hover:bg-gray-50">
              <td className="p-3 text-sm">568</td>
              <td className="p-3 text-sm">24.06.2025</td>
              <td className="p-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <User className="h-3 w-3 mr-1" />
                  CUSTOMER
                </span>
              </td>
              <td className="p-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </span>
              </td>
              <td className="p-3 text-sm">Water Leakage</td>
              <td className="p-3 text-sm">T.Nagar 12 Mr.Ramesh Kumar</td>
              <td className="p-3 text-sm">B Block</td>
              <td className="p-3 text-sm">Chennai</td>
              <td className="p-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  <User className="h-3 w-3 mr-1" />
                  Unassigned
                </span>
              </td>
              <td className="p-3">
                <button className="text-gray-500 hover:text-orange-500">
                  <Printer className="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;