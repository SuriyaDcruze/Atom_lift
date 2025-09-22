// Invoice.jsx (updated with handlePrint function and onClick on Printer icon)

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Printer, Trash2, User, Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import NewInvoiceForm from '../Dashboard/Forms/InvoiceForm';

const Invoice = () => {
  const [showNewInvoiceForm, setShowNewInvoiceForm] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('ALL TIME');
  const [filterBy, setFilterBy] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCustomer, setFilterCustomer] = useState('ALL');

  const fetchInvoices = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in to continue.');
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_API}/sales/invoice-list/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(res.data || []);
      setSelectedInvoices([]);
    } catch (error) {
      toast.error('Failed to fetch invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePrint = async (id) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in to continue.');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_API}/sales/print-invoice/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'  // Important for handling binary data
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice PDF downloaded successfully.');
    } catch (error) {
      toast.error('Failed to download invoice PDF.');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this invoice?');
    if (!confirmDelete) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in to continue.');
      window.location.href = '/login';
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_BASE_API}/sales/delete-invoice/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Invoice deleted successfully.');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to delete invoice.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedInvoices.length === 0) {
      toast.info('Please select at least one invoice to delete.');
      return;
    }
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedInvoices.length} selected invoice(s)?`);
    if (!confirmDelete) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in to continue.');
      window.location.href = '/login';
      return;
    }

    try {
      await Promise.all(
        selectedInvoices.map(id =>
          axios.delete(`${import.meta.env.VITE_BASE_API}/sales/delete-invoice/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      toast.success('Selected invoices deleted successfully.');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to delete selected invoices.');
    }
  };

  const handleExport = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in to continue.');
      window.location.href = '/login';
      return;
    }
    window.open(`${import.meta.env.VITE_BASE_API}/sales/export-invoices-to-excel/`, '_blank');
  };

  const handleSelectInvoice = (id) => {
    setSelectedInvoices(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = invoices.map(inv => inv.id);
      setSelectedInvoices(allIds);
    } else {
      setSelectedInvoices([]);
    }
  };

  const getFilteredInvoices = () => {
    return invoices.filter(inv => {
      if (filterPeriod === 'CURRENT MONTH') {
        const dueDate = new Date(inv.due_date);
        const now = new Date();
        if (dueDate.getMonth() !== now.getMonth() || dueDate.getFullYear() !== now.getFullYear()) return false;
      }
      if (filterStatus !== 'ALL' && inv.status !== filterStatus) return false;
      if (filterCustomer !== 'ALL' && inv.customer_name !== filterCustomer) return false;
      return true;
    });
  };

  // Memoize customer options for performance
  const customerOptions = useMemo(() => {
    return Array.from(new Set(invoices.map(inv => inv.customer_name).filter(Boolean)));
  }, [invoices]);

  return (
    <div className="p-2 sm:p-4 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Invoice</h1>
        {/* Responsive flex layout for cards and buttons */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Cards: Stack vertically on mobile, original layout on desktop */}
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="bg-white border border-gray-200 rounded-lg px-4 sm:px-5 py-3 sm:py-4 w-full md:w-[220px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700 text-sm sm:text-base font-medium">Due This Month</span>
                <span className="h-8 sm:h-10 w-8 sm:w-10 bg-[#F3F0FF] rounded-full flex items-center justify-center">
                  <User className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#243158] mt-1">
                {invoices.filter(inv => {
                  const dueDate = new Date(inv.due_date);
                  const now = new Date();
                  return dueDate.getMonth() === now.getMonth() && dueDate.getFullYear() === now.getFullYear();
                }).length || 0}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 sm:px-5 py-3 sm:py-4 w-full md:w-[220px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700 text-sm sm:text-base font-medium">Paid This Month</span>
                <span className="h-8 sm:h-10 w-8 sm:w-10 bg-[#FFF8E5] rounded-full flex items-center justify-center">
                  <User className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-500" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#243158] mt-1">
                {invoices.filter(inv => {
                  const paidDate = new Date(inv.start_date);
                  const now = new Date();
                  return inv.status === 'PAID' && paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
                }).length || 0}
              </div>
            </div>
          </div>
          {/* Buttons: Stack vertically on mobile, original layout on desktop */}
          <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0 w-full md:w-auto">
            <button
              onClick={handleExport}
              className="w-full md:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-800 font-medium text-sm"
            >
              Export
            </button>
            <div className="relative w-full md:w-auto">
              <button
                type="button"
                className="w-full md:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowBulkActions(!showBulkActions)}
              >
                Bulk Actions
                <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showBulkActions && (
                <div className="origin-top-right absolute right-0 mt-2 w-full md:w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <button
                      onClick={handleDeleteSelected}
                      disabled={selectedInvoices.length === 0}
                      className={`block w-full text-left px-4 py-2 text-sm ${selectedInvoices.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-100'}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowNewInvoiceForm(true)}
              className="w-full md:w-auto px-4 py-2 bg-[#243158] hover:bg-[#1b2545] text-white rounded-md flex items-center justify-center font-medium text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Invoice
            </button>
          </div>
        </div>
      </div>
      {/* Filter Section: Stack vertically on mobile, original layout on desktop */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2 flex-wrap">
        <div className="flex flex-col w-full sm:w-40">
          <label className="mb-1 text-xs text-gray-500 font-medium" htmlFor="period-select">Period</label>
          <select
            id="period-select"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#243158] w-full"
            value={filterPeriod}
            onChange={e => setFilterPeriod(e.target.value)}
          >
            <option>ALL TIME</option>
            <option>CURRENT MONTH</option>
          </select>
        </div>
        <div className="flex flex-col w-full sm:w-40">
          <label className="mb-1 text-xs text-gray-500 font-medium" htmlFor="by-select">By</label>
          <select
            id="by-select"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#243158] w-full"
            value={filterBy}
            onChange={e => setFilterBy(e.target.value)}
          >
            <option>ALL</option>
          </select>
        </div>
        <div className="flex flex-col w-full sm:w-40">
          <label className="mb-1 text-xs text-gray-500 font-medium" htmlFor="status-select">Status</label>
          <select
            id="status-select"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#243158] w-full"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option>ALL</option>
            <option>PAID</option>
            <option>PENDING</option>
          </select>
        </div>
        <div className="flex flex-col w-full sm:w-40">
          <label className="mb-1 text-xs text-gray-500 font-medium" htmlFor="customer-select">Customer</label>
          <select
            id="customer-select"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#243158] w-full"
            value={filterCustomer}
            onChange={e => setFilterCustomer(e.target.value)}
          >
            <option>ALL</option>
            {customerOptions.map(name => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
        <button className="w-full sm:w-auto bg-[#243158] hover:bg-[#1b2545] text-white px-4 py-2 rounded-md text-sm flex items-center justify-center sm:mt-5 md:mt-6">
          <Search className="inline mr-2 h-4 w-4" /> Search
        </button>
      </div>
      {/* Tab Bar: Stack vertically on mobile, original layout on desktop */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <button className="w-full sm:w-auto bg-[#243158] text-white rounded-md px-4 py-2 text-sm font-medium">Invoices</button>
        <button className="w-full sm:w-auto bg-white border border-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium">Transaction History</button>
        <button className="w-full sm:w-auto bg-white border border-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium">Check Transaction History</button>
      </div>
      <div className="bg-white rounded-lg shadow-lg">
        {loading ? (
          <p className="p-4 text-center text-sm">Loading invoices...</p>
        ) : (
          <>
            {/* Desktop Table: Original layout, shown on desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs uppercase">
                    <th className="p-2 w-12 text-center align-middle">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                        aria-label="Select all invoices"
                      />
                    </th>
                    <th className="p-2 w-[80px] text-left whitespace-nowrap">INVOICE ID</th>
                    <th className="p-2 w-[150px] text-left whitespace-nowrap">CUSTOMER</th>
                    <th className="p-2 w-[120px] text-left whitespace-nowrap">INVOICE DATE</th>
                    <th className="p-2 w-[120px] text-left whitespace-nowrap">DUE DATE</th>
                    <th className="p-2 w-[100px] text-left whitespace-nowrap">VALUE</th>
                    <th className="p-2 w-[100px] text-left whitespace-nowrap">DUE BALANCE</th>
                    <th className="p-2 w-[100px] text-left whitespace-nowrap">STATUS</th>
                    <th className="p-2 w-[100px] text-left whitespace-nowrap">DOCUMENT</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredInvoices().length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-4 text-center text-gray-500">
                        No invoices found.
                      </td>
                    </tr>
                  ) : (
                    getFilteredInvoices().map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="p-2 w-12 text-center align-middle">
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(inv.id)}
                            onChange={() => handleSelectInvoice(inv.id)}
                            aria-label={`Select invoice ${inv.reference_id || inv.id}`}
                          />
                        </td>
                        <td className="p-2 w-[80px] text-left whitespace-nowrap">{inv.reference_id || inv.id}</td>
                        <td className="p-2 w-[150px] text-left whitespace-nowrap">{inv.customer_name || 'N/A'}</td>
                        <td className="p-2 w-[120px] text-left whitespace-nowrap">{inv.start_date}</td>
                        <td className="p-2 w-[120px] text-left whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${
                              new Date(inv.due_date) < new Date()
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {inv.due_date}
                          </span>
                        </td>
                        <td className="p-2 w-[100px] text-left whitespace-nowrap">{`INR ${inv.value || '0.00'}`}</td>
                        <td className="p-2 w-[100px] text-left whitespace-nowrap">{`INR ${inv.due_balance || '0.00'}`}</td>
                        <td className="p-2 w-[100px] text-left whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${
                              inv.status === 'PAID'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {inv.status || 'Pending'}
                          </span>
                        </td>
                        <td className="p-2 w-[100px] text-left whitespace-nowrap">
                          <div className="flex space-x-2 justify-center">
                            <Printer className="cursor-pointer hover:text-blue-600" onClick={() => handlePrint(inv.id)} />
                            <Trash2
                              className="cursor-pointer hover:text-red-600"
                              onClick={() => handleDelete(inv.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Mobile Card Layout: Shown on mobile */}
            <div className="block sm:hidden">
              {getFilteredInvoices().length === 0 ? (
                <p className="p-4 text-center text-gray-500 text-sm">No invoices found.</p>
              ) : (
                getFilteredInvoices().map((inv) => (
                  <div key={inv.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(inv.id)}
                        onChange={() => handleSelectInvoice(inv.id)}
                        aria-label={`Select invoice ${inv.reference_id || inv.id}`}
                        className="h-5 w-5"
                      />
                      <div className="flex space-x-2">
                        <Printer className="cursor-pointer hover:text-blue-600 h-5 w-5" onClick={() => handlePrint(inv.id)} />
                        <Trash2
                          className="cursor-pointer hover:text-red-600 h-5 w-5"
                          onClick={() => handleDelete(inv.id)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Invoice ID:</span> {inv.reference_id || inv.id}
                      </div>
                      <div>
                        <span className="font-medium">Customer:</span> {inv.customer_name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Invoice Date:</span> {inv.start_date}
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ml-1 ${
                            new Date(inv.due_date) < new Date()
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {inv.due_date}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Value:</span> INR {inv.value || '0.00'}
                      </div>
                      <div>
                        <span className="font-medium">Due Balance:</span> INR {inv.due_balance || '0.00'}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ml-1 ${
                            inv.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {inv.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
      {showNewInvoiceForm && (
        <NewInvoiceForm
          onClose={() => setShowNewInvoiceForm(false)}
          onSubmitSuccess={() => {
            fetchInvoices();
            setShowNewInvoiceForm(false);
          }}
        />
      )}
    </div>
  );
};

export default Invoice;