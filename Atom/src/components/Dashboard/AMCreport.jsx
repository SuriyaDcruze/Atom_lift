import React, { useState, useEffect } from 'react';
import { Search, Printer, MoreVertical, Copy, FileText, File } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const AMCreport = () => {
  const [amcData, setAmcData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    period: 'ALL TIME',
    customer: 'ALL',
    by: 'ALL',
    status: 'ALL',
  });
  const [customerOptions, setCustomerOptions] = useState([]);
  const [periodOptions] = useState(['ALL TIME', 'LAST_WEEK', 'LAST_MONTH']);
  const [byOptions] = useState(['ALL', 'Customer', 'Admin']);
  const [statusOptions] = useState(['ALL', 'Active', 'Expired', 'Renew In Progress']);
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
      const [amcResponse, customersResponse] = await Promise.all([
        axiosInstance.get(`${apiBaseUrl}/amc/amc-list/`),
        axiosInstance.get(`${apiBaseUrl}/sales/customer-list/`),
      ]);

      const amcDataMapped = amcResponse.data.map((item) => ({
        id: item.id,
        amc: item.amcname || 'N/A',
        customer: item.customer_name || '-',
        created: new Date(item.created).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        contractPeriod: `${new Date(item.start_date).toLocaleDateString('en-GB')} - ${new Date(item.end_date).toLocaleDateString('en-GB')}`,
        nextPayment: item.next_payment ? new Date(item.next_payment).toLocaleDateString('en-GB') : 'Payments Complete',
        status: item.status || 'Active',
        amount: `Contract Amount: ${item.contract_amount || '0.00'}, Total Amount Paid: ${item.total_amount_paid || '0.00'}, Amount Due: ${item.amount_due || '0.00'}`,
        source: item.contact_person_name ? 'Customer' : 'Admin',
      }));

      setAmcData(amcDataMapped);
      setCustomerOptions(customersResponse.data.map((customer) => customer.site_name));
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
            'Failed to fetch AMC data. Please check your network or API endpoint.'
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
      const response = await axiosInstance.get(`${apiBaseUrl}/amc/export-amc-excel/`, {
        responseType: 'blob',
      });

      let filename;
      if (type === 'copy') {
        const text = amcData.map(c => Object.values(c).join(',')).join('\n');
        navigator.clipboard.writeText(text);
        toast.success('AMC reports copied to clipboard.');
        return;
      } else if (type === 'csv') {
        filename = 'amc_reports_export.csv';
      } else if (type === 'pdf') {
        filename = 'amc_reports_export.pdf';
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

      toast.success(`AMC reports exported as ${type.toUpperCase()} successfully.`);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || `Failed to export AMC reports as ${type.toUpperCase()}.`);
      }
    }
  };

  const handlePrintAmc = async (id) => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${apiBaseUrl}/amc/print-amc/${id}/`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `amc_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('AMC printed successfully.');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || 'Failed to print AMC.');
      }
    }
  };

  const getFilteredAmc = () => {
    return amcData.filter((amc) => {
      if (filters.period === 'LAST_WEEK') {
        const createdDate = new Date(amc.created.split('.').reverse().join('-'));
        const now = new Date();
        const fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 7);
        if (createdDate < fromDate) return false;
      } else if (filters.period === 'LAST_MONTH') {
        const createdDate = new Date(amc.created.split('.').reverse().join('-'));
        const now = new Date();
        const fromDate = new Date(now);
        fromDate.setMonth(now.getMonth() - 1);
        if (createdDate < fromDate) return false;
      }
      if (filters.customer !== 'ALL' && amc.customer !== filters.customer) return false;
      if (filters.by !== 'ALL' && amc.source !== filters.by) return false;
      if (filters.status !== 'ALL' && amc.status !== filters.status) return false;
      return true;
    });
  };

  const filteredAmc = getFilteredAmc();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAmc = filteredAmc.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAmc.length / itemsPerPage);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">AMC Reports</h1>
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

        {/* AMC Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <div className="grid grid-cols-9 bg-gray-100 p-3 font-medium text-gray-700 text-sm border-b border-gray-200">
                <div className="px-2">ID</div>
                <div className="px-2">AMC</div>
                <div className="px-2">CUSTOMER</div>
                <div className="px-2">CREATED</div>
                <div className="px-2">CONTRACT PERIOD</div>
                <div className="px-2">NEXT PAYMENT</div>
                <div className="px-2">STATUS</div>
                <div className="px-2">AMOUNT</div>
                <div className="px-2">PRINT</div>
              </div>
              
              {loading ? (
                <div className="p-4 text-center text-gray-500 col-span-9">
                  Loading AMC reports...
                </div>
              ) : currentAmc.length > 0 ? (
                currentAmc.map((amc, index) => (
                  <div key={index} className="grid grid-cols-9 p-3 border-b border-gray-200 text-sm items-center">
                    <div className="px-2">{amc.id}</div>
                    <div className="px-2 font-medium">{amc.amc}</div>
                    <div className="px-2">{amc.customer}</div>
                    <div className="px-2">{amc.created}</div>
                    <div className="px-2">{amc.contractPeriod}</div>
                    <div className="px-2">{amc.nextPayment}</div>
                    <div className="px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        amc.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        amc.status === 'Expired' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {amc.status}
                      </span>
                    </div>
                    <div className="px-2">{amc.amount}</div>
                    <div className="px-2">
                      <button 
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        onClick={() => handlePrintAmc(amc.id)}
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 col-span-9">
                  No AMC reports found for the selected period
                </div>
              )}
            </div>
          </div>

          <div className="p-3 text-sm text-gray-600 border-t border-gray-200 flex justify-between items-center">
            <span>
              Showing {filteredAmc.length === 0 ? 0 : indexOfFirstItem + 1} to 
              {Math.min(indexOfLastItem, filteredAmc.length)} of {filteredAmc.length} entries
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

export default AMCreport;