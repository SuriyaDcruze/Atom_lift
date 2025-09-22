import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AMCForm from '../Dashboard/Forms/AMCform';
import { Edit, Trash2, Search, ChevronDown, MoreVertical, Download, Upload, Import } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'; // Replace useHistory with useNavigate

const apiBaseUrl = import.meta.env.VITE_BASE_API;

// Static invoice frequency options from Django model
const invoiceFrequencyOptionsStatic = [
  { value: 'annually', label: 'Annually' },
  { value: 'semi_annually', label: 'Semi Annually' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'every_other_weekly', label: 'Every Other Weekly' },
];

const AMC = () => {
  // State for AMC data and loading status
  const [amcData, setAmcData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAMCs, setSelectedAMCs] = useState([]);
  const [initialFormData, setInitialFormData] = useState({});

  // State for filters
  const [filters, setFilters] = useState({
    customer: 'ALL',
    amcType: 'ALL',
    invoiceFrequency: 'ALL',
    paymentTerms: 'ALL',
    status: 'ALL',
    startDate: 'ALL',
    endDate: 'ALL',
  });

  // State for dropdown options
  const [customerOptions, setCustomerOptions] = useState([]);
  const [invoiceFrequencyOptions] = useState(invoiceFrequencyOptionsStatic.map(option => option.value));
  const [amcTypeOptions, setAmcTypeOptions] = useState([]);
  const [paymentTermsOptions, setPaymentTermsOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState(['Active', 'Expired', 'Renew In Progress']);

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAMC, setCurrentAMC] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Use useLocation and useNavigate
  const location = useLocation();
  const navigate = useNavigate(); // Replace useHistory with useNavigate

  // Centralized Axios instance with Bearer token
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

  // Fetch data with retry logic for network errors
  const fetchData = async (retryCount = 2) => {
    setLoading(true);
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) {
      setLoading(false);
      return;
    }

    try {
      const [amcResponse, customers, amcTypes, paymentTerms] = await Promise.all([
        axiosInstance.get(`${apiBaseUrl}/amc/amc-list/`),
        axiosInstance.get(`${apiBaseUrl}/sales/customer-list/`),
        axiosInstance.get(`${apiBaseUrl}/amc/amc-types/`),
        axiosInstance.get(`${apiBaseUrl}/amc/payment-terms/`),
      ]);

      const amcDataMapped = amcResponse.data.map(item => ({
        id: item.id,
        amc: item.amcname || 'N/A',
        customer: item.customer_name || '-',
        created: new Date(item.created).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        contactPeriod: `${new Date(item.start_date).toLocaleDateString('en-GB')} - ${new Date(item.end_date).toLocaleDateString('en-GB')}`,
        nextPayment: item.next_payment ? new Date(item.next_payment).toLocaleDateString('en-GB') : 'Payments Complete',
        status: item.status || 'Active',
        amount: `Contract Amount: ${item.contract_amount || '0.00'}, Total Amount Paid: ${item.total_amount_paid || '0.00'}, Amount Due: ${item.amount_due || '0.00'}`,
        referenceId: item.reference_id,
        invoiceFrequency: invoiceFrequencyOptionsStatic.find(opt => opt.value === item.invoice_frequency)?.label || '-',
        amcType: item.amc_type_name || '-',
        paymentTerms: item.payment_terms_name || '-',
        startDate: item.start_date,
        endDate: item.end_date,
        equipmentNo: item.equipment_no || '-',
        notes: item.notes || '-',
        isGenerateContractNow: item.is_generate_contract || false,
        noOfServices: item.no_of_services || '',
      }));

      setAmcData(amcDataMapped);
      setSelectedAMCs([]);
      setCustomerOptions(customers.data);
      setAmcTypeOptions(amcTypes.data);
      setPaymentTermsOptions(paymentTerms.data);

      // Check for customerId in URL and open AMCForm if present
      const queryParams = new URLSearchParams(location.search);
      const customerId = queryParams.get('customerId');
      if (customerId) {
        const customer = customers.data.find(c => c.reference_id == customerId);
        setInitialFormData({ customer: customer ? customer.site_name : '' });
        setIsCreateModalOpen(true);
        // Clear the query parameter to avoid repeated triggers
        //navigate({ ...location, search: '' }); // Updated from history.replace
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else if (retryCount > 0 && error.code === 'ERR_NETWORK') {
        console.log(`Retrying fetchData... (${retryCount} attempts left)`);
        setTimeout(() => fetchData(retryCount - 1), 2000);
      } else {
        toast.error(error.response?.data?.error || 'Failed to fetch data. Please check your network.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      customer: 'ALL',
      amcType: 'ALL',
      invoiceFrequency: 'ALL',
      paymentTerms: 'ALL',
      status: 'ALL',
      startDate: 'ALL',
      endDate: 'ALL',
    });
    setCurrentPage(1);
  };

  // Handle AMC selection
  const handleSelectAMC = (id) => {
    setSelectedAMCs(prev =>
      prev.includes(id)
        ? prev.filter(amcId => amcId !== id)
        : [...prev, id]
    );
  };

  // Handle select all AMCs on current page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAMCs(currentAMCs.map(amc => amc.id));
    } else {
      setSelectedAMCs([]);
    }
  };

  // Handle AMC deletion
  const handleDeleteAMC = async (id) => {
    if (window.confirm('Are you sure you want to delete this AMC?')) {
      const axiosInstance = createAxiosInstance();
      if (!axiosInstance) return;

      try {
        await axiosInstance.delete(`${apiBaseUrl}/amc/amc-delete/${id}/`);
        setAmcData(prev => prev.filter(amc => amc.id !== id));
        setSelectedAMCs(prev => prev.filter(amcId => amcId !== id));
        setCurrentPage(1);
        toast.success('AMC deleted successfully.');
      } catch (error) {
        console.error('Error deleting AMC:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        } else {
          toast.error(error.response?.data?.error || 'Failed to delete AMC.');
        }
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedAMCs.length === 0) {
      toast.warning('No AMCs selected for deletion');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedAMCs.length} selected AMCs?`)) {
      const axiosInstance = createAxiosInstance();
      if (!axiosInstance) return;

      try {
        await Promise.all(
          selectedAMCs.map(id =>
            axiosInstance.delete(`${apiBaseUrl}/amc/amc-delete/${id}/`)
          )
        );
        setAmcData(prev => prev.filter(amc => !selectedAMCs.includes(amc.id)));
        setSelectedAMCs([]);
        toast.success(`${selectedAMCs.length} AMCs deleted successfully.`);
      } catch (error) {
        console.error('Error deleting AMCs:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        } else {
          toast.error(error.response?.data?.error || 'Failed to delete selected AMCs.');
        }
      }
    }
  };

  // Handle export to Excel
  const handleExport = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${apiBaseUrl}/amc/export-amc-excel/`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'amcs_export.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('AMCs exported successfully.');
      document.getElementById('options-dropdown').classList.add('hidden');
    } catch (error) {
      console.error('Error exporting AMCs:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || 'Failed to export AMCs.');
      }
      document.getElementById('options-dropdown').classList.add('hidden');
    }
  };

  // Open edit modal with AMC data
  const openEditModal = (amc) => {
    setCurrentAMC(amc);
    setIsEditModalOpen(true);
  };

  // Filter AMCs based on current filters
  const filteredAMCs = amcData.filter(amc => {
    const matchesAll = Object.entries(filters).every(([key, value]) => {
      if (value === 'ALL') return true;
      if (key === 'startDate' && value !== 'ALL') {
        const filterDate = new Date(value).setHours(0, 0, 0, 0);
        const amcDate = new Date(amc.startDate).setHours(0, 0, 0, 0);
        return amcDate >= filterDate;
      }
      if (key === 'endDate' && value !== 'ALL') {
        const filterDate = new Date(value).setHours(0, 0, 0, 0);
        const amcDate = new Date(amc.endDate).setHours(0, 0, 0, 0);
        return amcDate <= filterDate;
      }
      return amc[key] === value;
    });
    return matchesAll;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAMCs = filteredAMCs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAMCs.length / itemsPerPage);

  // Dropdown for bulk actions, 3-dot menu
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

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header and Actions */}
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">AMC Management</h1>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Bulk Actions Dropdown */}
          <div className="relative inline-block text-left">
            <div>
              <button
                type="button"
                className={`inline-flex items-center justify-center rounded-md px-3 md:px-4 py-2 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#243158] focus:ring-offset-2 ${
                  selectedAMCs.length > 0
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
                disabled={selectedAMCs.length === 0}
              >
                Bulk Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
            </div>

            {/* Bulk Actions Dropdown Menu */}
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

            {/* Options Dropdown Menu */}
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
                  Export
                </button>
                <button
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={() => {
                    document.getElementById('options-dropdown').classList.add('hidden');
                  }}
                >
                  <Upload className="mr-1 h-5 w-5 text-gray-400" />
                  Import CSV
                </button>
                <button
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={() => {
                    document.getElementById('options-dropdown').classList.add('hidden');
                  }}
                >
                  <Import className="mr-1 h-5 w-5 text-gray-400" />
                  AMC Import with Customer
                </button>
              </div>
            </div>
          </div>

          {/* Create New AMC Button */}
          <button
            onClick={() => {
              setInitialFormData({});
              setIsCreateModalOpen(true);
            }}
            className="bg-[#243158] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-[#111520] transition duration-200 text-sm md:text-base"
          >
            Create New AMC
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-lg mb-4 md:mb-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 2xl:grid-cols-7 gap-3 md:gap-4 items-end">
          {/* Customer */}
          <div className="xl:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select
              name="customer"
              value={filters.customer}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#243158] text-sm md:text-base"
            >
              <option value="ALL">All Customers</option>
              {customerOptions.map((option, index) => (
                <option key={option.id || `${option.site_name}-${index}`} value={option.site_name}>
                  {option.site_name}
                </option>
              ))}
            </select>
          </div>

          {/* AMC Type */}
          <div className="xl:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">AMC Type</label>
            <select
              name="amcType"
              value={filters.amcType}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#243158] text-sm md:text-base"
            >
              <option value="ALL">All AMC Types</option>
              {amcTypeOptions.map((option, index) => (
                <option key={option.id || `${option.value}-${index}`} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Frequency */}
          <div className="xl:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Frequency</label>
            <select
              name="invoiceFrequency"
              value={filters.invoiceFrequency}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#243158] text-sm md:text-base"
            >
              <option value="ALL">All Frequencies</option>
              {invoiceFrequencyOptions.map((option) => (
                <option key={option} value={option}>{invoiceFrequencyOptionsStatic.find(opt => opt.value === option)?.label || option}</option>
              ))}
            </select>
          </div>

          {/* Payment Terms */}
          <div className="xl:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
            <select
              name="paymentTerms"
              value={filters.paymentTerms}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#243158] text-sm md:text-base"
            >
              <option value="ALL">All Payment Terms</option>
              {paymentTermsOptions.map((option, index) => (
                <option key={option.id || `${option.value}-${index}`} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="xl:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#243158] text-sm md:text-base"
            >
              <option value="ALL">All Statuses</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="xl:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate === 'ALL' ? '' : filters.startDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#243158] text-sm md:text-base"
            />
          </div>

          {/* End Date */}
          <div className="xl:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate === 'ALL' ? '' : filters.endDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#243158] text-sm md:text-base"
            />
          </div>

          {/* Filter Actions */}
          <div className="flex flex-row space-x-2 col-span-1 xs:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-2 2xl:col-span-1">
            <button
              onClick={resetFilters}
              className="flex-1 bg-gray-200 text-gray-700 px-3 md:px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200 text-sm md:text-base"
            >
              Reset
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className="flex-1 bg-[#243158] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-[#0f131d] transition duration-200 text-sm md:text-base flex items-center justify-center"
            >
              <Search className="w-4 h-4 mr-1" />
              <span>Search</span>
            </button>
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
                    checked={selectedAMCs.length > 0 && selectedAMCs.length === currentAMCs.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300"
                  />
                </th>
                <th className="p-3 lg:p-4 text-left">Reference ID</th>
                <th className="p-3 lg:p-4 text-left">AMC</th>
                <th className="p-3 lg:p-4 text-left">Customer</th>
                <th className="p-3 lg:p-4 text-left">Created</th>
                <th className="p-3 lg:p-4 text-left hidden lg:table-cell">Contract Period</th>
                <th className="p-3 lg:p-4 text-left hidden lg:table-cell">Next Payment</th>
                <th className="p-3 lg:p-4 text-left">Status</th>
                <th className="p-3 lg:p-4 text-left hidden xl:table-cell">Amount</th>
                <th className="p-3 lg:p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center p-4">
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#243158]"></div>
                    </div>
                  </td>
                </tr>
              ) : currentAMCs.length > 0 ? (
                currentAMCs.map(amc => (
                  <tr key={amc.id} className="border-t hover:bg-gray-50 transition duration-200">
                    <td className="p-3 lg:p-4">
                      <input
                        type="checkbox"
                        checked={selectedAMCs.includes(amc.id)}
                        onChange={() => handleSelectAMC(amc.id)}
                        className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300"
                      />
                    </td>
                    <td className="p-3 lg:p-4 text-gray-800">{amc.referenceId}</td>
                    <td className="p-3 lg:p-4 text-gray-800 font-medium whitespace-nowrap">{amc.amc}</td>
                    <td className="p-3 lg:p-4 text-gray-800 whitespace-nowrap">{amc.customer}</td>
                    <td className="p-3 lg:p-4 text-gray-800 whitespace-nowrap">{amc.created}</td>
                    <td className="p-3 lg:p-4 text-gray-800 hidden lg:table-cell whitespace-nowrap">{amc.contactPeriod}</td>
                    <td className="p-3 lg:p-4 text-gray-800 hidden lg:table-cell whitespace-nowrap">{amc.nextPayment}</td>
                    <td className="p-3 lg:p-4">
                      <span className="bg-[#00B69B] text-white px-4 py-2 rounded-full font-medium">{amc.status}</span>
                    </td>
                    <td className="p-3 lg:p-4 text-gray-800 hidden xl:table-cell">{amc.amount}</td>
                    <td className="p-3 lg:p-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(amc)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAMC(amc.id)}
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
                  <td colSpan="10" className="text-center p-4 text-gray-500">
                    No AMCs found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 md:p-4 text-gray-600 flex flex-col md:flex-row justify-between items-center border-t">
          <span className="text-sm md:text-base mb-2 md:mb-0">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAMCs.length)} of {filteredAMCs.length}
            {selectedAMCs.length > 0 && (
              <span className="ml-2 text-[#243158]">
                ({selectedAMCs.length} selected)
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
        ) : currentAMCs.length > 0 ? (
          currentAMCs.map(amc => (
            <div key={amc.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedAMCs.includes(amc.id)}
                    onChange={() => handleSelectAMC(amc.id)}
                    className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300 mr-2"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg truncate">{amc.amc}</h3>
                    <p className="text-sm text-gray-600 truncate">{amc.customer}</p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => openEditModal(amc)}
                    className="text-blue-500 hover:text-blue-700 p-1"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAMC(amc.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Created</span>
                  <span className="font-medium">{amc.created}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Status</span>
                  <span className="font-medium">{amc.status}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Contract Period</span>
                  <span className="font-medium">{amc.contactPeriod}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Next Payment</span>
                  <span className="font-medium">{amc.nextPayment}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No AMCs found matching your criteria
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white rounded-lg shadow p-3 text-gray-600 flex flex-col xs:flex-row justify-between items-center">
          <span className="text-sm sm:text-base mb-2 xs:mb-0">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAMCs.length)} of {filteredAMCs.length}
            {selectedAMCs.length > 0 && (
              <span className="ml-2 text-[#243158]">
                ({selectedAMCs.length} selected)
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

      {/* AMC Form Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <AMCForm
          isEdit={isEditModalOpen}
          initialData={isEditModalOpen ? currentAMC : initialFormData}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setCurrentAMC(null);
            setInitialFormData({});
          }}
          onSubmitSuccess={(message) => {
            fetchData();
            toast.success(message || (isEditModalOpen ? 'AMC updated successfully!' : 'AMC created successfully!'), {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }}
          onSubmitError={(error) => {
            toast.error(error || (isEditModalOpen ? 'Failed to update AMC' : 'Failed to create AMC'), {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }}
          apiBaseUrl={apiBaseUrl}
          dropdownOptions={{
            customerOptions: customerOptions.map(item => item.site_name),
            invoiceFrequencyOptions,
            amcTypeOptions: amcTypeOptions.map(item => item.value),
            paymentTermsOptions: paymentTermsOptions.map(item => item.value),
            setCustomerOptions,
            setInvoiceFrequencyOptions: () => {},
            setAmcTypeOptions,
            setPaymentTermsOptions,
          }}
        />
      )}
    </div>
  );
};

export default AMC;
