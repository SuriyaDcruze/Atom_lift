import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import QuotationForm from '../Dashboard/Forms/QuotationForm';
import { ChevronDown, MoreVertical, Download, Search, Copy, Edit, Trash2 } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_BASE_API || 'https://crm-lift.onrender.com';

const Quotation = () => {
  // State for quotations data and loading status
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuotations, setSelectedQuotations] = useState([]);

  // State for filters
  const [filters, setFilters] = useState({
    period: 'ALL TIME',
    status: 'ALL',
    quotationType: 'ALL',
    customer: 'ALL',
  });

  // State for dropdown options
  const [periodOptions] = useState(['ALL TIME', 'Today', 'This Week', 'This Month']);
  const [statusOptions] = useState(['ALL', 'Active', 'Closed']);
  const [quotationTypeOptions] = useState(['ALL', 'Standard', 'Custom']);
  const [customerOptions, setCustomerOptions] = useState(['ALL']);
  const [amcTypeOptions, setAmcTypeOptions] = useState([]);
  const [liftOptions, setLiftOptions] = useState([]);

  // State for form visibility
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [currentQuotation, setCurrentQuotation] = useState(null);

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

      // Fetch quotations, customers, AMC types, and lifts in parallel
      const [quotationsResponse, customersResponse, amcTypesResponse, liftsResponse] = await Promise.all([
        axios.get(`${apiBaseUrl}/sales/quotation-list/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiBaseUrl}/sales/customer-list/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiBaseUrl}/amc/amc-types/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiBaseUrl}/auth/lift_list/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Map quotations data to match table format
      const quotationsData = quotationsResponse.data.map(quotation => ({
        id: quotation.id,
        number: quotation.reference_id,
        date: quotation.date,
        name: quotation.customer_site_name || quotation.customer?.site_name || 'N/A', // Multiple fallbacks
        amcDetails: quotation.amc_type || 'N/A',
        quotationType: quotation.type,
        amount: quotation.amount || '0',
        gst: quotation.gst || '0%',
        netAmount: quotation.net_amount || '0',
        lifts: quotation.lifts?.length > 0 ? quotation.lifts.join(', ') : 'No Lifts',
        status: quotation.status || 'Active',
      }));

      setQuotations(quotationsData);
      setSelectedQuotations([]);
      setCustomerOptions(['ALL', ...customersResponse.data.map(customer => customer.site_name)]);
      setAmcTypeOptions(amcTypesResponse.data.map(amc => amc.type));
      setLiftOptions(liftsResponse.data.map(lift => lift.lift_number));
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else if (retryCount > 0 && error.code === 'ERR_NETWORK') {
        console.log(`Retrying fetchData... (${retryCount} attempts left)`);
        setTimeout(() => fetchData(retryCount - 1), 1000);
      } else {
        toast.error(error.response?.data?.error || 'Failed to fetch quotation data.');
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

  // Reset filters
  const resetFilters = () => {
    setFilters({
      period: 'ALL TIME',
      status: 'ALL',
      quotationType: 'ALL',
      customer: 'ALL',
    });
    setCurrentPage(1);
  };

  // Handle quotation selection
  const handleSelectQuotation = (id) => {
    setSelectedQuotations(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  // Handle select all quotations on current page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedQuotations(currentQuotations.map(quotation => quotation.id));
    } else {
      setSelectedQuotations([]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedQuotations.length === 0) {
      toast.warning('No quotations selected for deletion');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedQuotations.length} selected quotations?`)) {
      try {
        const token = localStorage.getItem('access_token');
        await Promise.all(
          selectedQuotations.map(id =>
            axios.delete(`${apiBaseUrl}/sales/delete-quotation/${id}/`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        setQuotations(prev => prev.filter(quotation => !selectedQuotations.includes(quotation.id)));
        setSelectedQuotations([]);
        setCurrentPage(1);
        toast.success(`${selectedQuotations.length} quotations deleted successfully.`);
      } catch (error) {
        console.error('Error deleting quotations:', error);
        toast.error(error.response?.data?.error || 'Failed to delete selected quotations.');
      }
    }
    document.getElementById('bulk-actions-dropdown')?.classList.add('hidden');
  };

  // Handle export (placeholder functionality)
  const handleExport = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${apiBaseUrl}/sales/export-quotations/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'quotations_export.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Quotations exported successfully.');
      document.getElementById('options-dropdown')?.classList.add('hidden');
    } catch (error) {
      console.error('Error exporting quotations:', error);
      toast.error(error.response?.data?.error || 'Failed to export quotations.');
      document.getElementById('options-dropdown')?.classList.add('hidden');
    }
  };

  // Handle copy action (placeholder)
  const handleCopy = (quotation) => {
    console.log('Copying quotation:', quotation);
    toast.info('Copy functionality not implemented yet.');
  };

  // Handle edit action
  const openEditForm = (quotation) => {
    setCurrentQuotation({
      id: quotation.id,
      referenceId: quotation.number,
      customer: quotation.name,
      type: quotation.quotationType,
      amcType: quotation.amcDetails === 'N/A' ? '' : quotation.amcDetails,
      salesExecutive: '', // Adjust based on API data
      yearOfMake: '',
      date: quotation.date,
      remark: '',
      otherRemark: '',
      lifts: quotation.lifts === 'No Lifts' ? [] : quotation.lifts.split(', '),
      files: [],
    });
    setIsEditFormOpen(true);
  };

  // Handle delete action
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`${apiBaseUrl}/sales/delete-quotation/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuotations(prev => prev.filter(quotation => quotation.id !== id));
        setSelectedQuotations(prev => prev.filter(qId => qId !== id));
        setCurrentPage(1);
        toast.success('Quotation deleted successfully.');
      } catch (error) {
        console.error('Error deleting quotation:', error);
        toast.error(error.response?.data?.error || 'Failed to delete quotation.');
      }
    }
  };

  // Filter quotations based on current filters
  const filteredQuotations = quotations.filter(quotation =>
    Object.entries(filters).every(([key, value]) => {
      if (value === 'ALL' || value === 'ALL TIME') return true;
      if (key === 'period') return quotation.date.includes(value);
      if (key === 'status') return quotation.status === value;
      if (key === 'quotationType') return quotation.quotationType === value;
      if (key === 'customer') return quotation.name.includes(value);
      return true;
    })
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuotations = filteredQuotations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);

  // Handle dropdown visibility
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
      {isCreateFormOpen || isEditFormOpen ? (
        <QuotationForm
          isEdit={isEditFormOpen}
          initialData={currentQuotation}
          onClose={() => {
            setIsCreateFormOpen(false);
            setIsEditFormOpen(false);
            setCurrentQuotation(null);
          }}
          onSubmitSuccess={() => {
            fetchData();
            toast.success(isEditFormOpen ? 'Quotation updated successfully!' : 'Quotation created successfully!', {
              position: 'top-right',
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }}
          apiBaseUrl={apiBaseUrl}
          dropdownOptions={{
            customerOptions,
            amcTypeOptions,
            liftOptions,
            setCustomerOptions,
            setAmcTypeOptions,
            setLiftOptions,
          }}
        />
      ) : (
        <>
          {/* Header and Actions */}
          <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quotation Management</h1>
            <div className="flex items-center space-x-2 w-full md:w-auto">
              {/* Bulk Actions Dropdown */}
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  className={`inline-flex items-center justify-center rounded-lg px-3 md:px-4 py-2.5 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#2D3A6B] focus:ring-offset-2 ${
                    selectedQuotations.length > 0
                      ? 'bg-gradient-to-r from-[#2D3A6B] to-[#243158] text-white hover:from-[#213066] hover:to-[#182755]'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } transition-all duration-200 shadow-md`}
                  id="bulk-actions-menu"
                  aria-expanded="true"
                  aria-haspopup="true"
                  onClick={() => document.getElementById('bulk-actions-dropdown').classList.toggle('hidden')}
                >
                  Bulk Actions
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>
                <div
                  id="bulk-actions-dropdown"
                  className="hidden absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="bulk-actions-menu"
                >
                  <div className="py-1" role="none">
                    <button
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="mr-3 h-5 w-5 text-gray-400" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Options Dropdown */}
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2D3A6B] focus:ring-offset-2 transition-all duration-200"
                  id="options-menu"
                  aria-expanded="true"
                  aria-haspopup="true"
                  onClick={() => document.getElementById('options-dropdown').classList.toggle('hidden')}
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                <div
                  id="options-dropdown"
                  className="hidden absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none"
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
                  </div>
                </div>
              </div>

              {/* Create Quotation Button */}
              <button
                onClick={() => setIsCreateFormOpen(true)}
                className="bg-gradient-to-r from-[#2D3A6B] to-[#243158] text-white px-3 md:px-4 py-2.5 rounded-lg hover:from-[#213066] hover:to-[#182755] transition-all duration-200 text-sm md:text-base shadow-md"
              >
                + Create Quotation
              </button>
            </div>
          </div>

          {/* Filters Section */}
   <div className="bg-white p-3 md:p-4 rounded-lg shadow-lg mb-4 md:mb-6">
  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3 md:gap-4 items-end">
    {/* Period Filter */}
    <div className="xl:col-span-1">
      <select
        name="period"
        value={filters.period}
        onChange={handleFilterChange}
        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#2D3A6B] text-sm md:text-base"
      >
        {periodOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>

    {/* Status Filter */}
    <div className="xl:col-span-1">
      <select
        name="status"
        value={filters.status}
        onChange={handleFilterChange}
        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#2D3A6B] text-sm md:text-base"
      >
        {statusOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>

    {/* Quotation Type Filter */}
    <div className="xl:col-span-1">
      <select
        name="quotationType"
        value={filters.quotationType}
        onChange={handleFilterChange}
        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#2D3A6B] text-sm md:text-base"
      >
        {quotationTypeOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>

    {/* Customer Filter */}
    <div className="xl:col-span-1">
      <select
        name="customer"
        value={filters.customer}
        onChange={handleFilterChange}
        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#2D3A6B] text-sm md:text-base"
      >
        {customerOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>

    {/* Filter Actions */}
    <div className="flex flex-row space-x-2 col-span-1 xs:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-1 2xl:col-span-1">
      <button
        onClick={resetFilters}
        className="flex-1 bg-gray-200 text-gray-700 px-3 md:px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200 text-sm md:text-base"
      >
        Reset
      </button>
      <button
        onClick={() => setCurrentPage(1)}
        className="flex-1 bg-[#2D3A6B] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-[#1d264d] transition duration-200 text-sm md:text-base flex items-center justify-center"
      >
        <Search className="w-4 h-4 mr-1" />
        <span>Search</span>
      </button>
    </div>
  </div>
</div>

          {/* Tablet and Desktop View */}
          <div className="hidden md:block bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[768px]">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedQuotations.length > 0 && selectedQuotations.length === currentQuotations.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-[#2D3A6B] rounded focus:ring-[#2D3A6B] border-gray-300"
                      />
                    </th>
                    <th className="p-4 text-left">Quotation Number</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Customer</th>
                    <th className="p-4 text-left">AMC Details</th>
                    <th className="p-4 text-left">Quotation Type</th>
                    <th className="p-4 text-left">Amount</th>
                    <th className="p-4 text-left">GST</th>
                    <th className="p-4 text-left">Net Amount</th>
                    <th className="p-4 text-left">Lifts</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="11" className="text-center p-4">
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D3A6B]"></div>
                        </div>
                      </td>
                    </tr>
                  ) : currentQuotations.length > 0 ? (
                    currentQuotations.map(quotation => (
                      <tr key={quotation.id} className="border-t hover:bg-gray-50 transition duration-200">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedQuotations.includes(quotation.id)}
                            onChange={() => handleSelectQuotation(quotation.id)}
                            className="h-4 w-4 text-[#2D3A6B] rounded focus:ring-[#2D3A6B] border-gray-300"
                          />
                        </td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{quotation.number}</td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{quotation.date}</td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{quotation.name}</td>
                        <td className="p-4 text-gray-800">{quotation.amcDetails}</td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{quotation.quotationType || '-'}</td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{quotation.amount}</td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{quotation.gst}</td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{quotation.netAmount}</td>
                        <td className="p-4">
                          <button className="bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600 transition duration-200 text-sm whitespace-nowrap">
                            {quotation.lifts}
                          </button>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCopy(quotation)}
                              className="text-blue-500 hover:text-blue-700 p-1"
                              title="Copy"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openEditForm(quotation)}
                              className="text-blue-500 hover:text-blue-700 p-1"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(quotation.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="text-center p-4 text-gray-500">
                        No quotations found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 text-gray-600 flex flex-col md:flex-row justify-between items-center border-t">
              <span className="text-sm md:text-base mb-2 md:mb-0">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredQuotations.length)} of {filteredQuotations.length}
                {selectedQuotations.length > 0 && (
                  <span className="ml-2 text-[#2D3A6B]">
                    ({selectedQuotations.length} selected)
                  </span>
                )}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-200 text-sm md:text-base shadow-md"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-200 text-sm md:text-base shadow-md"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Mobile View - Attractive Cards */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-8 bg-white rounded-xl shadow-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D3A6B]"></div>
              </div>
            ) : currentQuotations.length > 0 ? (
              currentQuotations.map(quotation => (
                <div key={quotation.id} className="bg-white rounded-xl shadow-2xl p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedQuotations.includes(quotation.id)}
                        onChange={() => handleSelectQuotation(quotation.id)}
                        className="h-4 w-4 text-[#2D3A6B] rounded focus:ring-[#2D3A6B] border-gray-300 mr-2"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg truncate">{quotation.number}</h3>
                        <p className="text-sm text-gray-600 truncate">{quotation.name}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => handleCopy(quotation)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Copy"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openEditForm(quotation)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(quotation.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="text-gray-500 block text-xs">Date</span>
                      <span className="font-medium">{quotation.date}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="text-gray-500 block text-xs">AMC Details</span>
                      <span className="font-medium">{quotation.amcDetails}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="text-gray-500 block text-xs">Quotation Type</span>
                      <span className="font-medium">{quotation.quotationType || '-'}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="text-gray-500 block text-xs">Amount</span>
                      <span className="font-medium">{quotation.amount}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="text-gray-500 block text-xs">GST</span>
                      <span className="font-medium">{quotation.gst}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="text-gray-500 block text-xs">Net Amount</span>
                      <span className="font-medium">{quotation.netAmount}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="text-gray-500 block text-xs">Lifts</span>
                      <span className="font-medium whitespace-nowrap">{quotation.lifts}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-2xl p-6 text-center text-gray-500">
                No quotations found matching your criteria
              </div>
            )}

            {/* Pagination */}
            <div className="bg-white rounded-xl shadow-2xl p-4 text-gray-600 flex flex-col xs:flex-row justify-between items-center">
              <span className="text-sm sm:text-base mb-2 xs:mb-0">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredQuotations.length)} of {filteredQuotations.length}
                {selectedQuotations.length > 0 && (
                  <span className="ml-2 text-[#2D3A6B]">
                    ({selectedQuotations.length} selected)
                  </span>
                )}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-200 text-sm sm:text-base shadow-md"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-200 text-sm sm:text-base shadow-md"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Quotation;