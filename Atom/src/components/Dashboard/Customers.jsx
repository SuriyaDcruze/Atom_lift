import React, { useState, useEffect } from 'react';
import { Edit, MoreVertical, Plus, Search, ChevronDown, ChevronUp, Sliders, List, Trash2 } from 'lucide-react';
import CustomerForm from '../Dashboard/Forms/CustomerForm';
import { toast } from 'react-toastify';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${apiBaseUrl}/auth/refresh/`, {
          refresh: refreshToken
        });
        
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

const customerApi = {
  getCustomers: () => api.get('/sales/customer-list/'),
  addCustomer: (data) => api.post('/sales/add-customer/', data),
  editCustomer: (id, data) => api.put(`/sales/edit-customer/${id}/`, data),
  deleteCustomer: (id) => api.delete(`/sales/delete-customer/${id}/`),
};

const dropdownApi = {
  getRoutes: () => api.get('/sales/routes/'),
  getBranches: () => api.get('/sales/branches/'),
  getProvinceStates: () => api.get('/sales/province-states/'),
  addRoute: (data) => api.post('/sales/add-route/', data),
  addBranch: (data) => api.post('/sales/add-branch/', data),
  addProvinceState: (data) => api.post('/sales/add-province-state/', data),
};

const CustomerRow = ({ 
  customer, 
  onEdit,
  expandedRow,
  toggleExpand,
  isSelected,
  onSelect,
  onDelete
}) => {
  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 whitespace-nowrap">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={onSelect}
            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
          />
        </td>
        <td className="px-4 py-3 whitespace-nowrap">{customer.site_id}</td>
        <td className="px-4 py-3 hidden sm:table-cell whitespace-nowrap truncate max-w-[150px]">
          {customer.site_name}
        </td>
        
        <td className="px-4 py-3 sm:hidden text-right">
          <button 
            onClick={toggleExpand}
            className="text-orange-500 p-1 rounded-full hover:bg-orange-50"
          >
            {expandedRow === customer.site_id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </td>
        
        <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap truncate max-w-[200px]">
          {customer.site_address}
        </td>
        <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap">{customer.phone || 'N/A'}</td>
        <td className="px-4 py-3 hidden sm:table-cell whitespace-nowrap">{customer.contracts || 'N/A'}</td>
        <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">{customer.no_of_lifts || 'N/A'}</td>
        <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap">{customer.service || 'N/A'}</td>
        <td className="px-4 py-3 hidden xl:table-cell whitespace-nowrap">{customer.generated_tickets || 'N/A'}</td>
        <td className="px-4 py-3 hidden xl:table-cell whitespace-nowrap">{customer.invoices || 'N/A'}</td>
        <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">
          {customer.routes_value || 'N/A'}
        </td>
        
        <td className="px-4 py-3 whitespace-nowrap flex justify-end space-x-2">
          <button 
            onClick={() => onEdit(customer)}
            className="text-blue-500 hover:text-blue-700 p-1 transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>

          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this customer?')) {
                onDelete(customer.id);
              }
            }}
            className="text-red-500 hover:text-red-700 p-1 transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </td>
      </tr>
      
      {expandedRow === customer.site_id && (
        <tr className="sm:hidden bg-gray-50">
          <td colSpan="100" className="px-4 py-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries({
                'Site Name': customer.site_name || 'N/A',
                'Address': customer.site_address || 'N/A',
                'Mobile': customer.phone || 'N/A',
                'Contracts': customer.contracts || 'N/A',
                'No. of Lifts': customer.no_of_lifts || 'N/A',
                'Service': customer.service || 'N/A',
                'Tickets': customer.generated_tickets || 'N/A',
                'Invoices': customer.invoices || 'N/A',
                'Routes': customer.routes_value || 'N/A',
              }).map(([label, value]) => (
                <div key={label} className="whitespace-nowrap">
                  <p className="font-medium text-gray-500">{label}</p>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const Customers = () => {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showThreeDotMenu, setShowThreeDotMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    routes: '',
    branch: '',
    city: '',
    sector: '',
    search: ''
  });
  
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  
  const [dropdownOptions, setDropdownOptions] = useState({
    countryOptions: ['India', 'USA', 'UK'],
    stateOptions: [],
    cityOptions: [],
    sectorOptions: [
      { value: 'government', label: 'Government' },
      { value: 'private', label: 'Private' },
    ],
    routesOptions: [],
    branchOptions: [],
  });

  useEffect(() => {
    console.log('showForm state changed:', showForm);
  }, [showForm]);

  const fetchData = async (retryCount = 3) => {
    setIsLoading(true);
    try {
      const [customersRes, routesRes, branchesRes, statesRes] = await Promise.all([
        customerApi.getCustomers(),
        dropdownApi.getRoutes(),
        dropdownApi.getBranches(),
        dropdownApi.getProvinceStates()
      ]);
      
      console.log('API Responses:', {
        customers: customersRes.data,
        routes: routesRes.data,
        branches: branchesRes.data,
        states: statesRes.data
      });
      
      const customerData = Array.isArray(customersRes.data) ? customersRes.data : [];
      setCustomers(customerData);
      setFilteredCustomers(customerData);
      
      const normalizeOptions = (data) => {
        if (!data || !Array.isArray(data)) {
          console.warn('Invalid dropdown data:', data);
          return [];
        }
        return data.map((item, index) => {
          if (typeof item === 'string') {
            return { value: item, label: item };
          }
          if (item.value && item.label) {
            return item;
          }
          if (item.name) {
            return { value: item.id || item.name, label: item.name };
          }
          return {
            value: item.id || item.value || `option-${index}`,
            label: item.value || item.name || item.id || `Option ${index}`,
          };
        });
      };
      
      setDropdownOptions(prev => {
        const newOptions = {
          ...prev,
          routesOptions: normalizeOptions(routesRes.data),
          branchOptions: normalizeOptions(branchesRes.data),
          stateOptions: normalizeOptions(statesRes.data),
          sectorOptions: prev.sectorOptions
        };
        console.log('Updated dropdownOptions:', newOptions);
        return newOptions;
      });
      
    } catch (err) {
      console.error('Error fetching data:', err);
      if (retryCount > 0) {
        setTimeout(() => fetchData(retryCount - 1), 1000);
      } else {
        setError(err.message || 'Failed to fetch data');
        toast.error(err.response?.data?.message || 'Failed to fetch data');
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        console.log('fetchData completed, isLoading set to false');
      }, 500);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer => {
      return (
        (filters.routes === '' || customer.routes === filters.routes) &&
        (filters.branch === '' || customer.branch === filters.branch) &&
        (filters.city === '' || customer.city === filters.city) &&
        (filters.sector === '' || customer.sector === filters.sector) &&
        (filters.search === '' || 
          customer.site_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          customer.site_id?.toLowerCase().includes(filters.search.toLowerCase()) ||
          customer.mobile?.includes(filters.search))
      );
    });
    setFilteredCustomers(filtered);
    console.log('Filtered Customers:', filtered); // Debug log
  }, [filters, customers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const resetFilters = () => {
    setFilters({
      routes: '',
      branch: '',
      city: '',
      sector: '',
      search: ''
    });
  };

  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectAllCustomers = () => {
    if (selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const handleBulkAssignBranch = () => {
    if (selectedCustomers.length === 0) {
      toast.error('Please select at least one customer');
      return;
    }
    toast.success(`Branch assigned to ${selectedCustomers.length} customers`);
  };

  const handleBulkAction = (action) => {
    if (selectedCustomers.length === 0) {
      toast.error('Please select at least one customer');
      return;
    }
    toast.success(`${action} performed on ${selectedCustomers.length} customers`);
  };

  const handleAddNewCustomer = () => {
    console.log('Add New Customer button clicked, isLoading:', isLoading);
    if (isLoading) {
      toast.warn('Please wait, data is still loading...');
      return;
    }
    setEditData(null);
    setShowForm(true);
    console.log('setShowForm called, showForm should be true');
  };

  const handleEditCustomer = (customer) => {
    setEditData({
      siteId: customer.site_id,
      jobNo: customer.job_no || '',
      siteName: customer.site_name || '',
      siteAddress: customer.site_address || '',
      email: customer.email || '',
      phone: customer.phone || '',
      mobile: customer.mobile || '',
      officeAddress: customer.office_address || '',
      contactPersonName: customer.contact_person_name || '',
      designation: customer.designation || '',
      pinCode: customer.pin_code || '',
      country: customer.country || '',
      state: customer.province_state || '',
      city: customer.city || '',
      sector: customer.sector || '',
      routes: customer.routes || '',
      branch: customer.branch || '',
      gstNumber: customer.gst_number || '',
      panNumber: customer.pan_number || '',
      handoverDate: customer.handover_date || '',
      billingName: customer.billing_name || '',
      id: customer.id,
    });
    setShowForm(true);
  };

  const handleFormSubmitSuccess = async (customerData) => {
    try {
      // Use customerData directly from CustomerForm for immediate UI update
      if (editData) {
        setCustomers(customers.map(c => 
          c.id === editData.id ? { ...customerData, id: editData.id } : c
        ));
        toast.success('Customer updated successfully');
      } else {
        // For new customers, assume CustomerForm provides the id from API response
        setCustomers([...customers, { ...customerData, id: customerData.id }]);
        toast.success('Customer added successfully');
      }
      setShowForm(false);
    } catch (err) {
      console.error('Error updating state:', err);
      toast.error(`Error: ${err.message || 'Failed to update customer list'}`);
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await customerApi.deleteCustomer(id);
      setCustomers(customers.filter(customer => customer.id !== id));
      toast.success('Customer deleted successfully');
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditData(null);
  };

  const updateDropdownOptions = async (field, newValue) => {
    try {
      let response;
      const payload = { value: newValue };
      
      switch (field) {
        case 'routes':
          response = await dropdownApi.addRoute(payload);
          break;
        case 'branch':
          response = await dropdownApi.addBranch(payload);
          break;
        case 'state':
          response = await dropdownApi.addProvinceState(payload);
          break;
        default:
          return Promise.reject(new Error('Invalid field'));
      }
      
      const newOption = typeof response.data === 'object'
        ? { 
            value: response.data.id || response.data.value || newValue, 
            label: response.data.value || response.data.name || newValue 
          }
        : { value: response.data, label: response.data };
      
      setDropdownOptions(prev => ({
        ...prev,
        [`${field}Options`]: [...prev[`${field}Options`], newOption]
      }));
      
      return newOption;
    } catch (err) {
      toast.error(`Error adding ${field}: ${err.response?.data?.message || err.message}`);
      throw err;
    }
  };

  const toggleExpandRow = (siteId) => {
    setExpandedRow(expandedRow === siteId ? null : siteId);
  };

  const renderDropdownOptions = (options) => {
    return options.map((option, index) => (
      <option 
        key={`${option.value}-${index}`}
        value={option.value}
      >
        {option.label}
      </option>
    ));
  };

  // New: Import CSV handler
  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error('Please select a CSV file to import.');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a valid CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${apiBaseUrl}/sales/import-customers-csv/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Customers imported successfully.');
      fetchData(); // Refresh the customer data
    } catch (error) {
      console.error('Error importing customers:', error);
      toast.error(error.response?.data?.error || 'Failed to import customers.');
    }
  };

  // New: Export handler
  const handleExport = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${apiBaseUrl}/sales/export-customers/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customers_export.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Customers exported successfully.');
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.error(error.response?.data?.error || 'Failed to export customers.');
    }
  };

  // New: Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) {
      toast.warning('No customers selected for deletion');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedCustomers.length} selected customers?`)) {
      try {
        const token = localStorage.getItem('access_token');
        await Promise.all(
          selectedCustomers.map(id => 
            axios.delete(`${apiBaseUrl}/sales/delete-customer/${id}/`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        setCustomers(prev => prev.filter(customer => !selectedCustomers.includes(customer.id)));
        setSelectedCustomers([]);
        toast.success(`${selectedCustomers.length} customers deleted successfully.`);
      } catch (error) {
        console.error('Error deleting customers:', error);
        toast.error(error.response?.data?.error || 'Failed to delete selected customers.');
      }
    }
  };

  // New: Click outside handler for dropdowns
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

  if (isLoading) {
    return <div className="container mx-auto p-6 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Customers</h1>
        
        {/* Action Buttons Row */}
        <div className="flex flex-wrap justify-end gap-2 mt-2 sm:gap-3 sm:flex-nowrap">
          <button 
            onClick={handleBulkAssignBranch}
            className="flex items-center bg-white text-gray-700 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            <Sliders size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Bulk Assign Branch</span>
            <span className="sm:hidden">Assign</span>
          </button>
          
          {/* Updated: Bulk Actions Dropdown like in Lifts */}
          <div className="relative inline-block text-left">
            <div>
              <button
                type="button"
                className={`inline-flex items-center justify-center rounded-md px-3 md:px-4 py-2 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#243158] focus:ring-offset-2 ${
                  selectedCustomers.length > 0
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
              >
                Bulk Actions
                <ChevronDown className="ml-1 md:ml-2 w-4 md:w-5 h-4 md:h-5" />
              </button>
            </div>
            <div
              id="bulk-actions-dropdown"
              className="hidden absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="bulk-actions-menu"
              tabIndex="-1"
            >
              <div className="py-1" role="none">
                <button
                  onClick={handleBulkDelete}
                  className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  role="menuitem"
                  tabIndex="-1"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>

          {/* Updated: 3-Dot Menu like in Lifts */}
          <div className="relative inline-block text-left">
            <div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#243158] focus:ring-offset-2"
                id="options-menu"
                aria-expanded="true"
                aria-haspopup="true"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('options-dropdown').classList.toggle('hidden');
                }}
              >
                <MoreVertical size={16} />
              </button>
            </div>
            <div
              id="options-dropdown"
              className="hidden absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
              tabIndex="-1"
            >
              <div className="py-1" role="none">
                <label
                  htmlFor="import-csv"
                  className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  role="menuitem"
                  tabIndex="-1"
                >
                  Import CSV
                </label>
                <input
                  type="file"
                  id="import-csv"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportCSV}
                />
                <button
                  onClick={handleExport}
                  className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  role="menuitem"
                  tabIndex="-1"
                >
                  Export
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              console.log('Add New Customer button clicked');
              handleAddNewCustomer();
            }}
            className="flex items-center bg-gradient-to-r from-[#2D3A6B] to-[#243158] text-white px-3 py-2 rounded-lg shadow-md hover:from-[#213066] hover:to-[#182755] transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            <Plus size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add New Customer</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-6 gap-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 w-full">
          <select 
            name="routes"
            value={filters.routes}
            onChange={handleFilterChange}
            className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-300 transition text-sm sm:text-base whitespace-nowrap"
          >
            <option value="">All Routes</option>
            {renderDropdownOptions(dropdownOptions.routesOptions)}
          </select>
          <select 
            name="branch"
            value={filters.branch}
            onChange={handleFilterChange}
            className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-300 transition text-sm sm:text-base whitespace-nowrap"
          >
            <option value="">All Branch</option>
            {renderDropdownOptions(dropdownOptions.branchOptions)}
          </select>
          <select 
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
            className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-300 transition text-sm sm:text-base whitespace-nowrap"
          >
            <option value="">All City</option>
            {renderDropdownOptions(dropdownOptions.cityOptions)}
          </select>
          <select 
            name="sector"
            value={filters.sector}
            onChange={handleFilterChange}
            className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-300 transition text-sm sm:text-base whitespace-nowrap"
          >
            <option value="">All Sector</option>
            {renderDropdownOptions(dropdownOptions.sectorOptions)}
          </select>
          <div className="flex space-x-2">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search..."
              className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-300 transition text-sm sm:text-base flex-1"
            />
            <button 
              type="submit"
              className="bg-[#243158] text-white p-2 rounded-lg shadow-md hover:bg-[#182255] transition-colors flex items-center justify-center text-sm sm:text-base whitespace-nowrap"
            >
              <Search size={16} />
            </button>
            <button 
              type="button"
              onClick={resetFilters}
              className="bg-gray-200 text-gray-700 p-2 rounded-lg shadow-sm hover:bg-gray-300 transition-colors flex items-center justify-center text-sm sm:text-base whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      
      {/* Table container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={selectAllCustomers}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">Site ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap hidden sm:table-cell">Site Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap sm:hidden"></th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap hidden md:table-cell">Address</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap hidden lg:table-cell">Mobile</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap hidden sm:table-cell">Contracts</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap hidden md:table-cell">No.of Lifts</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap hidden lg:table-cell">Service</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap hidden xl:table-cell">Tickets</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap hidden xl:table-cell">Invoices</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap hidden md:table-cell">Routes</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <CustomerRow 
                      key={customer.id}
                      customer={customer}
                      onEdit={handleEditCustomer}
                      expandedRow={expandedRow}
                      toggleExpand={() => toggleExpandRow(customer.site_id)}
                      isSelected={selectedCustomers.includes(customer.id)}
                      onSelect={() => toggleCustomerSelection(customer.id)}
                      onDelete={handleDeleteCustomer}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="px-4 py-4 text-center text-gray-500">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm
          isEdit={!!editData}
          initialData={editData || {}}
          onClose={handleCloseForm}
          onSubmitSuccess={handleFormSubmitSuccess}
          apiBaseUrl={apiBaseUrl}
          dropdownOptions={{
            stateOptions: dropdownOptions.stateOptions,
            routesOptions: dropdownOptions.routesOptions,
            branchOptions: dropdownOptions.branchOptions,
            sectorOptions: dropdownOptions.sectorOptions,
            onAddOption: updateDropdownOptions
          }}
        />
      )}
    </div>
  );
};

export default Customers;