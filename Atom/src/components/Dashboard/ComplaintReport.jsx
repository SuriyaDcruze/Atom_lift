import React, { useState, useEffect } from 'react';
import { Search, Printer, MoreVertical, Copy, FileText, File, Check } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const ComplaintsReport = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    period: 'ALL TIME',
    customer: 'ALL',
    by: 'ALL',
    status: 'ALL',
  });
  const [periodOptions] = useState(['ALL TIME', 'LAST_WEEK', 'LAST_MONTH']);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [byOptions] = useState(['ALL', 'Customer', 'Admin']);
  const [statusOptions] = useState(['ALL', 'In Progress', 'Open', 'Closed']);
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
      const [complaintsResponse, customersResponse] = await Promise.all([
        axiosInstance.get(`${apiBaseUrl}/auth/complaint-list/`),
        axiosInstance.get(`${apiBaseUrl}/sales/customer-list/`),
      ]);

      const complaintsData = complaintsResponse.data.map((complaint) => ({
        id: complaint.id,
        complaintNo: complaint.reference || complaint.id,
        date: new Date(complaint.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        amcId: complaint.amc_id || 'N/A',
        siteId: complaint.site_id || 'N/A',
        customer: complaint.customer_name || 'Unknown',
        type: complaint.complaint_type || 'General',
        problem: complaint.subject || 'N/A',
        resolution: complaint.solution || 'Pending',
        doneBy: complaint.assign_to_name || 'Unassigned',
        status: complaint.priority || 'Open',
        source: complaint.contact_person_name ? 'Customer' : 'Admin',
      }));

      setComplaints(complaintsData);
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
            'Failed to fetch complaints data. Please check your network or API endpoint.'
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
      const response = await axiosInstance.get(`${apiBaseUrl}/auth/export-complaints/`, {
        responseType: 'blob',
      });

      let filename;
      if (type === 'copy') {
        const text = complaints.map(c => Object.values(c).join(',')).join('\n');
        navigator.clipboard.writeText(text);
        toast.success('Complaints copied to clipboard.');
        return;
      } else if (type === 'csv') {
        filename = 'complaints_export.csv';
      } else if (type === 'pdf') {
        filename = 'complaints_export.pdf';
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

      toast.success(`Complaints exported as ${type.toUpperCase()} successfully.`);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || `Failed to export complaints as ${type.toUpperCase()}.`);
      }
    }
  };

  const handlePrintComplaint = async (id) => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${apiBaseUrl}/auth/print-complaint/${id}/`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `complaint_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Complaint printed successfully.');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || 'Failed to print complaint.');
      }
    }
  };

  const getFilteredComplaints = () => {
    return complaints.filter((comp) => {
      if (filters.period === 'LAST_WEEK') {
        const createdDate = new Date(comp.date.split('.').reverse().join('-'));
        const now = new Date();
        const fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 7);
        if (createdDate < fromDate) return false;
      } else if (filters.period === 'LAST_MONTH') {
        const createdDate = new Date(comp.date.split('.').reverse().join('-'));
        const now = new Date();
        const fromDate = new Date(now);
        fromDate.setMonth(now.getMonth() - 1);
        if (createdDate < fromDate) return false;
      }
      if (filters.customer !== 'ALL' && comp.customer !== filters.customer) return false;
      if (filters.by !== 'ALL' && comp.source !== filters.by) return false;
      if (filters.status !== 'ALL' && comp.status !== filters.status) return false;
      return true;
    });
  };

  const filteredComplaints = getFilteredComplaints();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComplaints = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Complaints Report</h1>
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

        {/* Complaints Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-gray-100 p-3 font-medium text-gray-700 text-sm border-b border-gray-200">
            <div className="px-2">COMPLAINT NO</div>
            <div className="px-2">DATE</div>
            <div className="px-2">AMC ID</div>
            <div className="px-2">SITE ID</div>
            <div className="px-2">CUSTOMER</div>
            <div className="px-2">TYPE</div>
            <div className="px-2">PROBLEM</div>
            <div className="px-2">RESOLUTION</div>
            <div className="px-2">DONE BY</div>
            <div className="px-2">STATUS</div>
            <div className="px-2">CLOSE</div>
            <div className="px-2">PRINT</div>
          </div>
          
          {/* Table Rows */}
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading complaints...
            </div>
          ) : filteredComplaints.length > 0 ? (
            currentComplaints.map((complaint, index) => (
              <div key={index} className="grid grid-cols-12 p-3 border-b border-gray-200 text-sm items-center">
                <div className="px-2 font-medium">{complaint.complaintNo}</div>
                <div className="px-2">{complaint.date}</div>
                <div className="px-2">{complaint.amcId}</div>
                <div className="px-2">{complaint.siteId}</div>
                <div className="px-2">{complaint.customer}</div>
                <div className="px-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    complaint.type === 'Electrical' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.type}
                  </span>
                </div>
                <div className="px-2">{complaint.problem}</div>
                <div className="px-2">{complaint.resolution}</div>
                <div className="px-2">{complaint.doneBy}</div>
                <div className="px-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    complaint.status === 'Closed' ? 'bg-green-100 text-green-800' : 
                    complaint.status === 'In Progress' ? 'bg-purple-100 text-purple-800' :
                    complaint.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.status}
                  </span>
                </div>
                <div className="px-2">
                  {complaint.status !== 'Closed' && (
                    <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="px-2">
                  <button 
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    onClick={() => handlePrintComplaint(complaint.id)}
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No complaints found for the selected period
            </div>
          )}

          {/* Pagination */}
          <div className="p-3 text-sm text-gray-600 border-t border-gray-200">
            Showing {filteredComplaints.length === 0 ? 0 : indexOfFirstItem + 1} to{' '}
            {Math.min(indexOfLastItem, filteredComplaints.length)} of {filteredComplaints.length} entries
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsReport;