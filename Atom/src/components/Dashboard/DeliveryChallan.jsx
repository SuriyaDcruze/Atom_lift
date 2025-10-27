import React, { useState } from 'react';
import { Trash2, Plus, Download, ChevronDown, ChevronUp, X } from 'lucide-react';

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
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('delivery_challans');
    return saved ? JSON.parse(saved) : [
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
  });
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    deliveryChallanNumber: '',
    reference: '',
    customerName: '',
    status: 'Drafts',
    invoiceStatus: 'Not Invoiced',
    amount: '0.00',
    items: [],
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Delivery Challan Form Submitted:', formData);
    
    // Format date for display
    const formattedDate = new Date(formData.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Create new challan entry
    const newChallan = {
      date: formattedDate,
      deliveryChallanNumber: formData.deliveryChallanNumber,
      reference: formData.reference,
      customerName: formData.customerName,
      status: formData.status,
      invoiceStatus: formData.invoiceStatus,
      amount: `INR ${parseFloat(formData.amount || 0).toFixed(2)}`
    };
    
    // Add to customers list
    const updatedCustomers = [...customers, newChallan];
    setCustomers(updatedCustomers);
    
    // Save to localStorage
    localStorage.setItem('delivery_challans', JSON.stringify(updatedCustomers));
    
    alert('Delivery Challan created successfully!');
    setShowForm(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      deliveryChallanNumber: '',
      reference: '',
      customerName: '',
      status: 'Drafts',
      invoiceStatus: 'Not Invoiced',
      amount: '0.00',
      items: [],
      notes: ''
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      deliveryChallanNumber: '',
      reference: '',
      customerName: '',
      status: 'Drafts',
      invoiceStatus: 'Not Invoiced',
      amount: '0.00',
      items: [],
      notes: ''
    });
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Delivery Challan</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button className="bg-gray-200 text-gray-700 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-md hover:bg-gray-300 transition-colors flex items-center justify-center text-sm sm:text-base">
            <Download size={16} className="mr-2" /> Export
          </button>
          <button 
            onClick={() => {
              console.log('Create Delivery Challan button clicked');
              setShowForm(true);
            }}
            className="bg-[#243158] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-md hover:bg-[#1a2540] transition-colors flex items-center justify-center text-sm sm:text-base"
          >
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

      {/* Delivery Challan Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#2D3A6B] to-[#243158] px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Create Delivery Challan</h2>
              <button 
                onClick={handleCloseForm}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Basic Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D3A6B] focus:border-[#2D3A6B]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Challan Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="deliveryChallanNumber"
                      value={formData.deliveryChallanNumber}
                      onChange={handleInputChange}
                      placeholder="Enter challan number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D3A6B] focus:border-[#2D3A6B]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={handleInputChange}
                      placeholder="Enter reference"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D3A6B] focus:border-[#2D3A6B]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Enter customer name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D3A6B] focus:border-[#2D3A6B]"
                      required
                    />
                  </div>
                </div>

                {/* Status and Amount */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Status & Amount
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D3A6B] focus:border-[#2D3A6B]"
                    >
                      <option value="Drafts">Drafts</option>
                      <option value="Sent">Sent</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Status
                    </label>
                    <select
                      name="invoiceStatus"
                      value={formData.invoiceStatus}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D3A6B] focus:border-[#2D3A6B]"
                    >
                      <option value="Not Invoiced">Not Invoiced</option>
                      <option value="Invoiced">Invoiced</option>
                      <option value="Partially Invoiced">Partially Invoiced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (INR)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D3A6B] focus:border-[#2D3A6B]"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter any additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D3A6B] focus:border-[#2D3A6B]"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#243158] text-white rounded-lg hover:bg-[#1a2540] transition-colors"
                >
                  Create Delivery Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryChallan;