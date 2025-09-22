import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Download, Trash2, Edit, ChevronDown, MoreVertical } from 'lucide-react';
import RequisitionForm from '../Dashboard/Forms/RequistionForm';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const Requisition = () => {
  // State for requisitions data and loading status
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequisitions, setSelectedRequisitions] = useState([]);

  // State for filters
  const [filters, setFilters] = useState({
    period: 'ALL_TIME',
    requisitionType: 'ALL',
    status: 'ALL',
  });

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRequisition, setCurrentRequisition] = useState(null);

  // State for dropdown options
  const [itemOptions, setItemOptions] = useState([]);
  const [amcIdOptions, setAmcIdOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Fetch data with retry logic
  const fetchData = async (retryCount = 3) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please log in to continue.');
        window.location.href = '/login';
        return;
      }
      const response = await axios.get(`${apiBaseUrl}/inventory/list-requisition/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });

      // Log API response for debugging
      console.log('Fetched requisitions:', response.data);

      const requisitionsData = response.data.map(req => ({
        id: req.id,
        date: req.date,
        itemName: req.item?.name || '',
        itemDetails: req.item?.sale_price || '',
        qty: req.qty,
        site: req.site?.site_name || '', // Changed to site_name
        amcDetails: req.amc_id?.amcname || '',
        service: req.service || '',
        status: req.status,
        employee: req.employee?.name || '',
      }));

      setRequisitions(requisitionsData);
      setSelectedRequisitions([]);
    } catch (error) {
      console.error('Error fetching requisitions:', error);
      if (retryCount > 0 && error.code === 'ERR_NETWORK') {
        console.log(`Retrying fetchData... (${retryCount} attempts left)`);
        setTimeout(() => fetchData(retryCount - 1), 1000);
      } else {
        toast.error(error.response?.data?.error || 'Failed to fetch requisitions.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      period: 'ALL_TIME',
      requisitionType: 'ALL',
      status: 'ALL',
    });
    setCurrentPage(1);
  };

  // Handle requisition selection
  const handleSelectRequisition = (id) => {
    setSelectedRequisitions(prev =>
      prev.includes(id)
        ? prev.filter(reqId => reqId !== id)
        : [...prev, id]
    );
  };

  // Handle select all requisitions on current page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRequisitions(currentRequisitions.map(req => req.id));
    } else {
      setSelectedRequisitions([]);
    }
  };

  // Handle requisition deletion
  const handleDeleteRequisition = async (id) => {
    if (window.confirm('Are you sure you want to delete this requisition?')) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('Please log in to continue.');
          window.location.href = '/login';
          return;
        }
        await axios.delete(`${apiBaseUrl}/inventory/delete-requisition/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequisitions(prev => prev.filter(req => req.id !== id));
        setSelectedRequisitions(prev => prev.filter(reqId => reqId !== id));
        setCurrentPage(1); // Reset to first page after deletion
        toast.success('Requisition deleted successfully.');
      } catch (error) {
        console.error('Error deleting requisition:', error.response?.data || error);
        toast.error(error.response?.data?.error || 'Failed to delete requisition.');
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRequisitions.length === 0) {
      toast.warning('No requisitions selected for deletion');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedRequisitions.length} selected requisitions?`)) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('Please log in to continue.');
          window.location.href = '/login';
          return;
        }
        await Promise.all(
          selectedRequisitions.map(id =>
            axios.delete(`${apiBaseUrl}/inventory/delete-requisition/${id}/`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        setRequisitions(prev => prev.filter(req => !selectedRequisitions.includes(req.id)));
        setSelectedRequisitions([]);
        toast.success(`${selectedRequisitions.length} requisitions deleted successfully.`);
      } catch (error) {
        console.error('Error deleting requisitions:', error);
        toast.error(error.response?.data?.error || 'Failed to delete selected requisitions.');
      }
    }
  };

  // Handle export to Excel
  const handleExport = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please log in to continue.');
        window.location.href = '/login';
        return;
      }
      const response = await axios.get(`${apiBaseUrl}/inventory/export-requisition/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
        params: filters,
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'requisitions_export.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Requisitions exported successfully.');
      document.getElementById('options-dropdown').classList.add('hidden');
    } catch (error) {
      console.error('Error exporting requisitions:', error);
      toast.error(error.response?.data?.error || 'Failed to export requisitions.');
      document.getElementById('options-dropdown').classList.add('hidden');
    }
  };

  // Open edit modal with requisition data
  const openEditModal = (requisition) => {
    setCurrentRequisition({
      id: requisition.id,
      date: requisition.date,
      item: requisition.itemName,
      qty: requisition.qty,
      site: requisition.site, // Maps to site_name
      amcId: requisition.amcDetails,
      service: requisition.service,
      employee: requisition.employee,
    });
    setIsEditModalOpen(true);
  };

  // Filter requisitions based on current filters
  const filteredRequisitions = requisitions.filter(req =>
    Object.entries(filters).every(([key, value]) => {
      if (value === 'ALL' || value === 'ALL_TIME') return true;
      if (key === 'status') return req[key] === value;
      if (key === 'requisitionType') return req[key] === value;
      return true; // For period, we'd need date filtering logic
    })
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequisitions = filteredRequisitions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequisitions.length / itemsPerPage);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const bulkActions = document.getElementById('bulk-actions-dropdown');
      const options = document.getElementById('options-dropdown');

      if (bulkActions && !event.target.closest('#bulk-actions-menu') && !bulkActions.contains(event.target)) {
        bulkActions.classList.add('hidden');
      }

      if (options && !event.target.closest('#options-menu') && !options.contains(event.target)) {
        options.classList.add('hidden');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Log dropdown options for debugging
  useEffect(() => {
    console.log('Dropdown options:', { itemOptions, amcIdOptions, employeeOptions, siteOptions });
  }, [itemOptions, amcIdOptions, employeeOptions, siteOptions]);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header and Actions */}
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Requisitions</h1>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Bulk Actions Dropdown */}
          <div className="relative inline-block text-left">
            <div>
              <button
                type="button"
                className={`inline-flex items-center justify-center rounded-md px-3 md:px-4 py-2 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#243158] focus:ring-offset-2 ${
                  selectedRequisitions.length > 0
                    ? 'bg-[#243158] text-white hover:bg-[#243158]'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                id="bulk-actions-menu"
                aria-expanded="true"
                aria-haspopup="true"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('bulk-actions-dropdown').classList.toggle('hidden');
                }}
                disabled={selectedRequisitions.length === 0}
              >
                Bulk Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
            </div>

            <div
              id="bulk-actions-dropdown"
              className="hidden absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="bulk-actions-menu"
            >
              <div className="py-1" role="none">
                <button
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={() => {
                    handleBulkDelete();
                    document.getElementById('bulk-actions-dropdown').classList.add('hidden');
                  }}
                >
                  <Trash2 className="mr-3 h-5 w-5 text-gray-400" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Three Dot Menu Button */}
          <div className="relative inline-block text-left ml-2">
            <div>
              <button
                type="button"
                className="inline-flex items-center rounded-md p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#243158] focus:ring-offset-2"
                id="options-menu"
                aria-expanded="true"
                aria-haspopup="true"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('options-dropdown').classList.toggle('hidden');
                }}
              >
                <span className="sr-only">Open options</span>
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div
              id="options-dropdown"
              className="hidden absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <div className="py-1" role="none">
                <button
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={handleExport}
                >
                  <Download className="mr-1 h-5 w-5 text-gray-400" />
                  Export Excel
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#243158] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-[#111520] transition duration-200 text-sm md:text-base"
          >
            + Create New Requisition
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-lg mb-4 md:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              name="period"
              value={filters.period}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#243158] text-sm md:text-base"
            >
              <option value="ALL_TIME">All Time</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requisitions</label>
            <select
              name="requisitionType"
              value={filters.requisitionType}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#243158] text-sm md:text-base"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requesting Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#243158] text-sm md:text-base"
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tablet and Desktop View */}
      <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[768px]">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                <th className="p-3 lg:p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRequisitions.length > 0 && selectedRequisitions.length === currentRequisitions.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300"
                  />
                </th>
                <th className="p-3 lg:p-4 text-left">Reference ID</th>
                <th className="p-3 lg:p-4 text-left">Date</th>
                <th className="p-3 lg:p-4 text-left">Item Name</th>
                <th className="p-3 lg:p-4 text-left">Item Details</th>
                <th className="p-3 lg:p-4 text-left">Quantity</th>
                <th className="p-3 lg:p-4 text-left">Site</th>
                <th className="p-3 lg:p-4 text-left">AMC Details</th>
                <th className="p-3 lg:p-4 text-left">Service</th>
                <th className="p-3 lg:p-4 text-left">Status</th>
                <th className="p-3 lg:p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center p-4">
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#243158]"></div>
                    </div>
                  </td>
                </tr>
              ) : currentRequisitions.length > 0 ? (
                currentRequisitions.map(req => (
                  <tr key={req.id} className="border-t hover:bg-gray-50 transition duration-200">
                    <td className="p-3 lg:p-4">
                      <input
                        type="checkbox"
                        checked={selectedRequisitions.includes(req.id)}
                        onChange={() => handleSelectRequisition(req.id)}
                        className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300"
                      />
                    </td>
                    <td className="p-3 lg:p-4 text-gray-800">{req.id}</td>
                    <td className="p-3 lg:p-4 text-gray-800">{req.date}</td>
                    <td className="p-3 lg:p-4 text-gray-800 font-medium whitespace-nowrap">{req.itemName}</td>
                    <td className="p-3 lg:p-4 text-gray-800">{req.itemDetails}</td>
                    <td className="p-3 lg:p-4 text-gray-800 whitespace-nowrap">{req.qty}</td>
                    <td className="p-3 lg:p-4 text-gray-800 whitespace-nowrap">{req.site}</td>
                    <td className="p-3 lg:p-4 text-gray-800">{req.amcDetails}</td>
                    <td className="p-3 lg:p-4 text-gray-800">{req.service}</td>
                    <td className="p-3 lg:p-4 text-gray-800 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          req.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : req.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : req.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3 lg:p-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(req)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequisition(req.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center p-4 text-gray-500">
                    No requisitions found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 md:p-4 text-gray-600 flex flex-col md:flex-row justify-between items-center border-t">
          <span className="text-sm md:text-base mb-2 md:mb-0">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRequisitions.length)} of {filteredRequisitions.length}
            {selectedRequisitions.length > 0 && (
              <span className="ml-2 text-[#243158]">
                ({selectedRequisitions.length} selected)
              </span>
            )}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 md:px-4 py-1 md:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-200 text-sm md:text-base"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 md:px-4 py-1 md:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-200 text-sm md:text-base"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile View - Attractive Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-8 bg-white rounded-lg shadow">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#243158]"></div>
          </div>
        ) : currentRequisitions.length > 0 ? (
          currentRequisitions.map(req => (
            <div key={req.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedRequisitions.includes(req.id)}
                    onChange={() => handleSelectRequisition(req.id)}
                    className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300 mr-2"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg truncate">{req.itemName}</h3>
                    <p className="text-sm text-gray-600 truncate">
                      {req.site} • {req.date}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => openEditModal(req)}
                    className="text-blue-500 hover:text-blue-700 p-1"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRequisition(req.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Reference ID</span>
                  <span className="font-medium">{req.id}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Item Details</span>
                  <span className="font-medium">{req.itemDetails}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Quantity</span>
                  <span className="font-medium">{req.qty}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">AMC Details</span>
                  <span className="font-medium">{req.amcDetails}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Service</span>
                  <span className="font-medium">{req.service}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Status</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      req.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : req.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-800'
                        : req.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No requisitions found matching your criteria
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white rounded-lg shadow p-3 text-gray-600 flex flex-col xs:flex-row justify-between items-center">
          <span className="text-sm sm:text-base mb-2 xs:mb-0">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRequisitions.length)} of {filteredRequisitions.length}
            {selectedRequisitions.length > 0 && (
              <span className="ml-2 text-[#243158]">
                ({selectedRequisitions.length} selected)
              </span>
            )}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-200 text-sm sm:text-base"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-200 text-sm sm:text-base"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create/Edit Requisition Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <RequisitionForm
          isEdit={isEditModalOpen}
          initialData={currentRequisition || {}}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setCurrentRequisition(null);
          }}
          onSubmitSuccess={() => {
            fetchData();
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setCurrentRequisition(null);
          }}
          apiBaseUrl={apiBaseUrl}
          dropdownOptions={{
            itemOptions,
            setItemOptions,
            amcIdOptions,
            setAmcIdOptions,
            employeeOptions,
            setEmployeeOptions,
            siteOptions,
            setSiteOptions,
          }}
        />
      )}
    </div>
  );
};

export default Requisition;