import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ComplaintForm from '../Dashboard/Forms/ComplaintForm';
import { Edit, Trash2, Printer, Plus, Search } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaints, setSelectedComplaints] = useState([]);
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

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
        reference: complaint.reference,
        created: complaint.date,
        // Format date only (DD/MM/YYYY)
        formattedCreated: new Date(complaint.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        createdBy: complaint.contact_person_name || 'Admin',
        status: complaint.priority || 'Open',
        subject: complaint.subject,
        customer: complaint.customer_name || 'Unknown',
        assignedTo: complaint.assign_to_name || 'Unassigned',
        solution: complaint.solution,
        source: complaint.contact_person_name ? 'Customer' : 'Admin',
      }));

      setComplaints(complaintsData);
      setSelectedComplaints([]);
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

  const handleSelectComplaint = (id) => {
    setSelectedComplaints((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedComplaints(currentComplaints.map((comp) => comp.id));
    } else {
      setSelectedComplaints([]);
    }
  };

  const handleDeleteComplaint = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this complaint?');
    if (!confirmDelete) return;

    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      await axiosInstance.delete(`${apiBaseUrl}/auth/delete-complaint/${id}/`);
      toast.success('Complaint deleted successfully.');
      fetchData();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error('Failed to delete complaint.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedComplaints.length === 0) {
      toast.info('Please select at least one complaint to delete.');
      return;
    }
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedComplaints.length} selected complaint(s)?`
    );
    if (!confirmDelete) return;

    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      await Promise.all(
        selectedComplaints.map((id) =>
          axiosInstance.delete(`${apiBaseUrl}/auth/delete-complaint/${id}/`)
        )
      );
      toast.success('Selected complaints deleted successfully.');
      fetchData();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error('Failed to delete selected complaints.');
      }
    }
  };

  const handleExport = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${apiBaseUrl}/auth/export-complaints/`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'complaints_export.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Complaints exported successfully.');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || 'Failed to export complaints.');
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

  const openEditModal = (complaint) => {
    setCurrentComplaint(complaint);
    setIsEditModalOpen(true);
  };

  const getFilteredComplaints = () => {
    return complaints.filter((comp) => {
      if (filters.period === 'LAST_WEEK') {
        const createdDate = new Date(comp.created);
        const now = new Date();
        const fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 7);
        if (createdDate < fromDate) return false;
      } else if (filters.period === 'LAST_MONTH') {
        const createdDate = new Date(comp.created);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      const bulkActions = document.getElementById('bulk-actions-dropdown');
      if (
        bulkActions &&
        !event.target.closest('#bulk-actions-menu') &&
        !bulkActions.contains(event.target)
      ) {
        bulkActions.classList.add('hidden');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header and Summary Cards */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">Complaints</h1>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col sm:flex-row items-center w-full justify-between gap-4 flex-wrap">
            {/* In Progress card */}
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 w-full sm:w-[220px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700 text-base font-medium">In Progress</span>
                <span className="h-10 w-10 bg-[#F3F0FF] rounded-full flex items-center justify-center">
                  <Printer className="h-6 w-6 text-purple-600" />
                </span>
              </div>
              <div className="text-3xl font-bold text-[#243158] mt-1">
                {complaints.filter((comp) => comp.status === 'High' || comp.status === 'Urgent').length || 0}
              </div>
            </div>
            {/* Open card */}
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 w-full sm:w-[220px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700 text-base font-medium">Open</span>
                <span className="h-10 w-10 bg-[#FFF8E5] rounded-full flex items-center justify-center">
                  <Edit className="h-6 w-6 text-yellow-500" />
                </span>
              </div>
              <div className="text-3xl font-bold text-[#243158] mt-1">
                {complaints.filter((comp) => comp.status === 'Medium' || comp.status === 'Low').length || 0}
              </div>
            </div>
            {/* Closed card */}
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 w-full sm:w-[220px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700 text-base font-medium">Closed</span>
                <span className="h-10 w-10 bg-[#E5F3FF] rounded-full flex items-center justify-center">
                  <Edit className="h-6 w-6 text-blue-500" />
                </span>
              </div>
              <div className="text-3xl font-bold text-[#243158] mt-1">
                {complaints.filter((comp) => comp.status === 'Closed').length || 0}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row gap-3 mt-4 md:mt-0 flex-wrap justify-start w-full sm:w-auto">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-800 font-medium text-sm"
              >
                Export
              </button>
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() =>
                    document.getElementById('bulk-actions-dropdown').classList.toggle('hidden')
                  }
                >
                  Bulk Actions
                  <svg
                    className="-mr-1 ml-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  id="bulk-actions-dropdown"
                  className="hidden origin-top-right absolute right-0 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                >
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedComplaints.length === 0}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      selectedComplaints.length === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-red-600 hover:bg-red-100'
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-[#243158] hover:bg-[#1b2545] text-white rounded-md flex items-center font-medium text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Complaint
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between flex-wrap">
        {/* Period */}
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

        {/* By */}
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

        {/* Customer */}
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

        {/* Status */}
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
          <Search className="inline mr-2 h-4 w-4" /> Search
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button className="bg-[#243158] text-white rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap">Complaints</button>
        <button className="bg-white border border-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap">
          Transaction History
        </button>
        <button className="bg-white border border-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap">
          Check Transaction History
        </button>
      </div>

      {/* Table container with horizontal scroll on small screens */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        {loading ? (
          <p className="p-4 text-center">Loading complaints...</p>
        ) : (
          <table className="w-full table-fixed border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-xs uppercase">
                <th className="p-2 w-12 text-center align-middle">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedComplaints.length === currentComplaints.length &&
                      currentComplaints.length > 0
                    }
                    aria-label="Select all complaints"
                  />
                </th>
                <th className="p-2 w-[80px] text-left whitespace-nowrap">REFERENCE</th>
                <th className="p-2 w-[150px] text-left whitespace-nowrap">CUSTOMER</th>
                <th className="p-2 w-[100px] text-left whitespace-nowrap">CREATED</th>
                <th className="p-2 w-[120px] text-left whitespace-nowrap">PRIORITY</th>
                <th className="p-2 w-[150px] text-left whitespace-nowrap">SUBJECT</th>
                <th className="p-2 w-[100px] text-left whitespace-nowrap">ASSIGNED TO</th>
                <th className="p-2 w-[100px] text-left whitespace-nowrap">SOLUTION</th>
                <th className="p-2 w-[100px] text-left whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentComplaints.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-gray-500">
                    No complaints found.
                  </td>
                </tr>
              ) : (
                currentComplaints.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-50">
                    <td className="p-2 w-12 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={selectedComplaints.includes(comp.id)}
                        onChange={() => handleSelectComplaint(comp.id)}
                        aria-label={`Select complaint ${comp.reference || comp.id}`}
                      />
                    </td>
                    <td className="p-2 w-[80px] text-left whitespace-nowrap">
                      {comp.reference || comp.id}
                    </td>
                    <td className="p-2 w-[150px] text-left whitespace-nowrap">{comp.customer || 'N/A'}</td>
                    <td className="p-2 w-[100px] text-left whitespace-nowrap">{comp.formattedCreated}</td>
                    <td className="p-2 w-[120px] text-left whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${
                          comp.status === 'Urgent'
                            ? 'bg-red-100 text-red-800'
                            : comp.status === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : comp.status === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : comp.status === 'Low'
                            ? 'bg-green-100 text-green-800'
                            : comp.status === 'In Progress'
                            ? 'bg-purple-100 text-purple-800'
                            : comp.status === 'Open'
                            ? 'bg-yellow-100 text-yellow-800'
                            : comp.status === 'Closed'
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {comp.status || 'Open'}
                      </span>
                    </td>
                    <td className="p-2 w-[150px] text-left whitespace-nowrap">{comp.subject}</td>
                    <td className="p-2 w-[100px] text-left whitespace-nowrap">{comp.assignedTo || 'Unassigned'}</td>
                    <td className="p-2 w-[100px] text-left whitespace-nowrap">
                      {comp.solution ? (
                        <Printer
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => handlePrintComplaint(comp.id)}
                        />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-2 w-[100px] text-left whitespace-nowrap">
                      <div className="flex space-x-2 justify-center">
                        <Edit
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => openEditModal(comp)}
                        />
                        <Trash2
                          className="cursor-pointer hover:text-red-600"
                          onClick={() => handleDeleteComplaint(comp.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
        <span>
          Showing {filteredComplaints.length === 0 ? 0 : indexOfFirstItem + 1} to{' '}
          {Math.min(indexOfLastItem, filteredComplaints.length)} of {filteredComplaints.length} entries
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

      {/* Create Modal */}
      {isCreateModalOpen && (
        <ComplaintForm
          isEdit={false}
          initialData={null}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmitSuccess={() => {
            fetchData();
            setIsCreateModalOpen(false);
          }}
          onSubmitError={(error) => {
            toast.error(error || 'Failed to create complaint');
          }}
          apiBaseUrl={apiBaseUrl}
          dropdownOptions={{
            customerOptions,
            byOptions,
          }}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && currentComplaint && (
        <ComplaintForm
          isEdit={true}
          initialData={currentComplaint}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentComplaint(null);
          }}
          onSubmitSuccess={() => {
            fetchData();
            setIsEditModalOpen(false);
          }}
          onSubmitError={(error) => {
            toast.error(error || 'Failed to update complaint');
          }}
          apiBaseUrl={apiBaseUrl}
          dropdownOptions={{
            customerOptions,
            byOptions,
          }}
        />
      )}
    </div>
  );
};

export default Complaints;
