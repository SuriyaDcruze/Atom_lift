import React, { useState } from 'react';
import { Trash2, Plus, Download, ChevronDown, ChevronUp } from 'lucide-react';

const DeliveryChallanRow = ({ 
  date, 
  deliveryChallanNumber, 
  reference, 
  customerName, 
  status, 
  invoiceStatus, 
  amount 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr className=" hover:bg-gray-50">
        {/* Always visible columns */}
        <td className="px-2 py-3 sm:px-4">{date}</td>
        <td className="px-2 py-3 sm:px-4 hidden sm:table-cell">{deliveryChallanNumber}</td>
        
        {/* Mobile expand/collapse button */}
        <td className="px-2 py-3 sm:px-4 sm:hidden text-right">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 p-1 rounded-full hover:bg-gray-100"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </td>
        
        {/* Desktop-only columns */}
        <td className="px-2 py-3 sm:px-4 hidden md:table-cell">{reference}</td>
        <td className="px-2 py-3 sm:px-4 hidden lg:table-cell">{customerName}</td>
        <td className="px-2 py-3 sm:px-4 hidden sm:table-cell">
          <span className="text-black px-2 py-1 text-xs sm:text-sm font-medium">{status}</span>
        </td>
        <td className="px-2 py-3 sm:px-4 hidden md:table-cell">
          <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
            {invoiceStatus}
          </span>
        </td>
        <td className="px-2 py-3 sm:px-4 hidden lg:table-cell">{amount}</td>
        
        {/* Action buttons - always visible */}
        <td className="px-2 py-3 sm:px-4">
          <button className="text-red-500 hover:text-red-600 transition-colors">
            <Trash2 size={18} />
          </button>
        </td>
      </tr>
      
      {/* Expanded mobile view */}
      {isExpanded && (
        <tr className="sm:hidden bg-gray-50">
          <td colSpan="100" className="px-4 py-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-medium text-gray-500">Challan Number</p>
                <p>{deliveryChallanNumber}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Reference</p>
                <p>{reference}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Customer</p>
                <p>{customerName}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Status</p>
                <p className="text-black px-2 py-1 text-sm font-medium">{status}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Invoice Status</p>
                <p className="bg-yellow-500 text-white px-2 py-1 rounded-full text-sm font-medium inline-block">
                  {invoiceStatus}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Amount</p>
                <p>{amount}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const DeliveryChallan = () => {
  const customers = [
    {
      date: '27.11.2024',
      deliveryChallanNumber: 'DC-2',
      reference: 'TEST-0001 AL0000',
      customerName: '-',
      status: 'Drafts',
      invoiceStatus: 'Not Invoiced',
      amount: 'INR 0.00',
    },
  ];

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Delivery Challan</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button className="bg-gray-200 text-gray-700 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-md hover:bg-gray-300 transition-colors flex items-center justify-center text-sm sm:text-base">
            <Download size={16} className="mr-2" /> Export
          </button>
          <button className="bg-[#243158] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-md  transition-colors flex items-center justify-center text-sm sm:text-base">
            <Plus size={16} className="mr-2" /> Create Delivery Challan
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-200 z-10">
                <tr>
                  <th className="px-2 py-3 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-500">DATE</th>
                  <th className="px-2 py-3 sm:px-4 text-left hidden sm:table-cell text-xs sm:text-sm font-semibold text-gray-500">
                    DELIVERY CHALLAN #
                  </th>
                  <th className="px-2 py-3 sm:px-4 sm:hidden text-right text-xs sm:text-sm font-semibold text-gray-500"></th>
                  <th className="px-2 py-3 sm:px-4 text-left hidden md:table-cell text-xs sm:text-sm font-semibold text-gray-500">
                    REFERENCE
                  </th>
                  <th className="px-2 py-3 sm:px-4 text-left hidden lg:table-cell text-xs sm:text-sm font-semibold text-gray-500">
                    CUSTOMER
                  </th>
                  <th className="px-2 py-3 sm:px-4 text-left hidden sm:table-cell text-xs sm:text-sm font-semibold text-gray-500">
                    STATUS
                  </th>
                  <th className="px-2 py-3 sm:px-4 text-left hidden md:table-cell text-xs sm:text-sm font-semibold text-gray-500">
                    INVOICE STATUS
                  </th>
                  <th className="px-2 py-3 sm:px-4 text-left hidden lg:table-cell text-xs sm:text-sm font-semibold text-gray-500">
                    AMOUNT
                  </th>
                  <th className="px-2 py-3 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-500">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <DeliveryChallanRow key={index} {...customer} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryChallan;