import React, { useState, useEffect } from 'react';
import { Search, Printer, MoreVertical, Copy, FileText, File } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const InvoiceReport = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    period: 'ALL TIME',
    customer: 'ALL',
    by: 'ALL',
    status: 'ALL',
  });
  const [periodOptions] = useState(['ALL TIME', 'CURRENT MONTH']);
  const [byOptions] = useState(['ALL', 'Customer', 'Admin']);
  const [statusOptions] = useState(['ALL', 'PAID', 'Pending']);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const itemsPerPage = 7;
  const primaryColor = '#243158';

  const createAxiosInstance = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in to continue.');
      window.location.href = '/login';
      return null;
    }
    return axios.create({
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const fetchData = async (retryCount = 3) => {
    setLoading(true);
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) {
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get(`${apiBaseUrl}/sales/invoice-list/`);

      const invoicesData = response.data.map((invoice) => ({
        id: invoice.id,
        invoiceId: invoice.reference_id || invoice.id,
        customer: invoice.customer_name || 'N/A',
        invoiceDate: invoice.start_date,
        dueDate: invoice.due_date,
        value: `INR ${invoice.value || '0.00'}`,
        dueBalance: `INR ${invoice.due_balance || '0.00'}`,
        status: invoice.status || 'Pending',
        source: invoice.contact_person_name ? 'Customer' : 'Admin', // Assuming similar to complaints
      }));

      setInvoices(invoicesData);
      setCustomerOptions(Array.from(new Set(response.data.map(inv => inv.customer_name).filter(Boolean))));
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else if (retryCount > 0) {
        console.log(`Retrying fetchData... (${retryCount} attempts left)`);
        setTimeout(() => fetchData(retryCount - 1), 1000);
      } else {
        toast.error(
          error.response?.data?.error ||
            'Failed to fetch invoice data. Please check your network or API endpoint.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      period: 'ALL TIME',
      customer: 'ALL',
      by: 'ALL',
      status: 'ALL',
    });
    setCurrentPage(1);
  };

  const handleExport = async (type) => {
    setShowExportMenu(false);
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${apiBaseUrl}/sales/export-invoices-to-excel/`, {
        responseType: 'blob',
      });

      let filename;
      if (type === 'copy') {
        const text = invoices.map(c => Object.values(c).join(',')).join('\n');
        navigator.clipboard.writeText(text);
        toast.success('Invoice reports copied to clipboard.');
        return;
      } else if (type === 'csv') {
        filename = 'invoice_reports_export.csv';
      } else if (type === 'pdf') {
        filename = 'invoice_reports_export.pdf';
      } else if (type === 'print') {
        window.print();
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Invoice reports exported as ${type.toUpperCase()} successfully.`);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || `Failed to export invoice reports as ${type.toUpperCase()}.`);
      }
    }
  };

  const getFilteredInvoices = () => {
    return invoices.filter((inv) => {
      if (filters.period === 'CURRENT MONTH') {
        const dueDate = new Date(inv.dueDate);
        const now = new Date();
        if (dueDate.getMonth() !== now.getMonth() || dueDate.getFullYear() !== now.getFullYear()) return false;
      }
      if (filters.customer !== 'ALL' && inv.customer !== filters.customer) return false;
      if (filters.by !== 'ALL' && inv.source !== filters.by) return false;
      if (filters.status !== 'ALL' && inv.status !== filters.status) return false;
      return true;
    });
  };

  const filteredInvoices = getFilteredInvoices();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Invoice Reports</h1>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <div className="relative">
              <button 
                className="flex items-center bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
                style={{ borderColor: primaryColor, color: primaryColor }}
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button 
                      onClick={() => handleExport('copy')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </button>
                    <button 
                      onClick={() => handleExport('csv')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      CSV
                    </button>
                    <button 
                      onClick={() => handleExport('print')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </button>
                    <button 
                      onClick={() => handleExport('pdf')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <File className="h-4 w-4 mr-2" />
                      PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between flex-wrap">
          <div className="flex flex-col w-full sm:w-40">
            <label className="mb-1 text-xs text-gray-500 font-medium" htmlFor="period-select">
              Period
            </label>
            <select
              id="period-select"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#243158] w-full"
              value={filters.period}
              onChange={handleFilterChange}
              name="period"
            >
              {periodOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col w-full sm:w-40">
            <label className="mb-1 text-xs text-gray-500 font-medium" htmlFor="by-select">
              By
            </label>
            <select
              id="by-select"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#243158] w-full"
              value={filters.by}
              onChange={handleFilterChange}
              name="by"
            >
              {byOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col w-full sm:w-40">
            <label className="mb-1 text-xs text-gray-500 font-medium" htmlFor="customer-select">
              Customer
            </label>
            <select
              id="customer-select"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#243158] w-full"
              value={filters.customer}
              onChange={handleFilterChange}
              name="customer"
            >
              <option value="ALL">ALL</option>
              {customerOptions.map((option, index) => (
                <option key={`${option}-${index}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col w-full sm:w-40">
            <label className="mb-1 text-xs text-gray-500 font-medium" htmlFor="status-select">
              Status
            </label>
            <select
              id="status-select"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#243158] w-full"
              value={filters.status}
              onChange={handleFilterChange}
              name="status"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <button
            className="bg-[#243158] hover:bg-[#1b2545] text-white px-4 py-2 rounded-md text-sm flex items-center mt-4 sm:mt-0"
            onClick={resetFilters}
          >
            <Search className="inline mr-2 h-4 w-4" />
            Search
          </button>
        </div>

        {/* Invoice Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <div className="grid grid-cols-8 bg-gray-100 p-3 font-medium text-gray-700 text-sm border-b border-gray-200">
                <div className="px-2">INVOICE ID</div>
                <div className="px-2">CUSTOMER</div>
                <div className="px-2">INVOICE DATE</div>
                <div className="px-2">DUE DATE</div>
                <div className="px-2">VALUE</div>
                <div className="px-2">DUE BALANCE</div>
                <div className="px-2">STATUS</div>
                <div className="px-2">PRINT</div>
              </div>
              
              {loading ? (
                <div className="p-4 text-center text-gray-500 col-span-8">
                  Loading invoice reports...
                </div>
              ) : currentInvoices.length > 0 ? (
                currentInvoices.map((invoice, index) => (
                  <div key={index} className="grid grid-cols-8 p-3 border-b border-gray-200 text-sm items-center">
                    <div className="px-2 font-medium">{invoice.invoiceId}</div>
                    <div className="px-2">{invoice.customer}</div>
                    <div className="px-2">{invoice.invoiceDate}</div>
                    <div className="px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        new Date(invoice.dueDate) < new Date() ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.dueDate}
                      </span>
                    </div>
                    <div className="px-2">{invoice.value}</div>
                    <div className="px-2">{invoice.dueBalance}</div>
                    <div className="px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                    <div className="px-2">
                      <button 
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        onClick={() => {} /* Add print logic if available */}
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 col-span-8">
                  No invoice reports found for the selected period
                </div>
              )}
            </div>
          </div>

          <div className="p-3 text-sm text-gray-600 border-t border-gray-200 flex justify-between items-center">
            <span>
              Showing {filteredInvoices.length === 0 ? 0 : indexOfFirstItem + 1} to 
              {Math.min(indexOfLastItem, filteredInvoices.length)} of {filteredInvoices.length} entries
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceReport;