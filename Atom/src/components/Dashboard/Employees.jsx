import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Edit, Trash2, Search, ChevronDown, MoreVertical, Download, Upload } from 'lucide-react';
import EmployeeForm from '../Dashboard/Forms/EmployeeForm';
import { useNavigate } from 'react-router-dom';

const apiBaseUrl = import.meta.env.VITE_BASE_API; // http://localhost:8000

const Employees = () => {
  // State for employees data and loading/error status
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const navigate = useNavigate();

  // State for filters
  const [filters, setFilters] = useState({
    search: '',
  });

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('You must be logged in to view employees.');
          setTimeout(() => navigate('/login'), 2000);
          setLoading(false);
          return;
        }

        console.log('Fetching employees with token:', token.substring(0, 10) + '...');
        const response = await axios.get(`${apiBaseUrl}/auth/employees/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('API response:', response.data);
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
        } else {
          throw new Error('Invalid response format from API');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching employees:', error.response || error);
        const errorMsg = error.response?.data?.error || error.message || 'Failed to fetch employees';
        toast.error(errorMsg);
        if (error.response?.status === 401) {
          setError('Session expired or invalid token. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(errorMsg);
        }
        setEmployees([]);
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [navigate]);

  // Handle import CSV
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

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('You must be logged in to import employees.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`${apiBaseUrl}/auth/import-employees-csv/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Employees imported successfully.');
      document.getElementById('options-dropdown').classList.add('hidden');
      // Refresh employee list
      const response = await axios.get(`${apiBaseUrl}/auth/employees/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to import employees';
      toast.error(errorMsg);
      if (error.response?.status === 401) {
        setError('Session expired or invalid token. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
      document.getElementById('options-dropdown').classList.add('hidden');
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
    });
    setCurrentPage(1);
  };

  // Handle employee selection
  const handleSelectEmployee = (id) => {
    setSelectedEmployees(prev =>
      prev.includes(id)
        ? prev.filter(empId => empId !== id)
        : [...prev, id]
    );
  };

  // Handle select all employees on current page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(currentEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  // Handle employee deletion
  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('You must be logged in to delete employees.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        await axios.delete(`${apiBaseUrl}/auth/delete-employee/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        setSelectedEmployees(prev => prev.filter(empId => empId !== id));
        setCurrentPage(1);
        toast.success('Employee deleted successfully.');
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to delete employee';
        toast.error(errorMsg);
        if (error.response?.status === 401) {
          setError('Session expired or invalid token. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        }
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedEmployees.length === 0) {
      toast.warning('No employees selected for deletion');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedEmployees.length} selected employees?`)) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('You must be logged in to delete employees.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        for (const id of selectedEmployees) {
          await axios.delete(`${apiBaseUrl}/auth/delete-employee/${id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        setEmployees(prev => prev.filter(emp => !selectedEmployees.includes(emp.id)));
        setSelectedEmployees([]);
        toast.success(`${selectedEmployees.length} employees deleted successfully.`);
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to delete selected employees';
        toast.error(errorMsg);
        if (error.response?.status === 401) {
          setError('Session expired or invalid token. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        }
      }
    }
  };

  // Handle export to Excel
  const handleExport = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('You must be logged in to export employees.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await axios.get(`${apiBaseUrl}/auth/export-employees/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employees_export.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Employees exported successfully.');
      document.getElementById('options-dropdown').classList.add('hidden');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to export employees';
      toast.error(errorMsg);
      if (error.response?.status === 401) {
        setError('Session expired or invalid token. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
      document.getElementById('options-dropdown').classList.add('hidden');
    }
  };

  // Open edit modal with employee data
  const openEditModal = (employee) => {
    setCurrentEmployee(employee);
    setIsEditModalOpen(true);
  };

  // Filter employees based on current filters
  const filteredEmployees = employees.filter(emp =>
    emp.username.toLowerCase().includes(filters.search.toLowerCase()) ||
    emp.email.toLowerCase().includes(filters.search.toLowerCase()) ||
    (emp.name && emp.name.toLowerCase().includes(filters.search.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

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

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
        <div className="relative inline-block text-left">
          <button
            id="options-menu"
            onClick={() => document.getElementById('options-dropdown').classList.toggle('hidden')}
            className="inline-flex justify-center items-center p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#243158]"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          <div
            id="options-dropdown"
            className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          >
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              <button
                onClick={handleExport}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                <Download className="w-4 h-4 mr-3" />
                Export to Excel
              </button>
              <label
                htmlFor="import-csv"
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                role="menuitem"
              >
                <Upload className="w-4 h-4 mr-3" />
                Import CSV
                <input
                  id="import-csv"
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                name="search"
                type="text"
                value={filters.search}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#243158] focus:border-[#243158] sm:text-sm"
                placeholder="Search by username, email, or name..."
              />
            </div>
          </div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm sm:text-base"
          >
            Reset Filters
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#243158] text-white rounded-md hover:bg-[#1e2a44] text-sm sm:text-base"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedEmployees.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative inline-block text-left">
            <button
              id="bulk-actions-menu"
              onClick={() => document.getElementById('bulk-actions-dropdown').classList.toggle('hidden')}
              className="inline-flex justify-center items-center px-4 py-2 bg-[#243158] text-white rounded-md hover:bg-[#1e2a44] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#243158]"
            >
              Bulk Actions
              <ChevronDown className="ml-2 w-4 h-4" />
            </button>
            <div
              id="bulk-actions-dropdown"
              className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
            >
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="bulk-actions-menu">
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-100 hover:text-red-900"
                  role="menuitem"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={currentEmployees.length > 0 && selectedEmployees.length === currentEmployees.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#243158]"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-red-500">
                  Error: {error}
                </td>
              </tr>
            ) : currentEmployees.length > 0 ? (
              currentEmployees.map(emp => (
                <tr key={emp.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={() => handleSelectEmployee(emp.id)}
                      className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openEditModal(emp)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(emp.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No employees found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-white p-3 text-gray-600 flex flex-col sm:flex-row justify-between items-center">
          <span className="text-sm md:text-base mb-2 md:mb-0">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length}
            {selectedEmployees.length > 0 && (
              <span className="ml-2 text-[#243158]">
                ({selectedEmployees.length} selected)
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
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-red-500">
            Error: {error}
          </div>
        ) : currentEmployees.length > 0 ? (
          currentEmployees.map(emp => (
            <div key={emp.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(emp.id)}
                    onChange={() => handleSelectEmployee(emp.id)}
                    className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300 mr-2"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg truncate">{emp.email}</h3>
                    <p className="text-sm text-gray-600 truncate">{emp.username}</p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => openEditModal(emp)}
                    className="text-blue-500 hover:text-blue-700 p-1"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(emp.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Name</span>
                  <span className="font-medium">{emp.name || '-'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No employees found matching your criteria
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white rounded-lg shadow p-3 text-gray-600 flex flex-col xs:flex-row justify-between items-center">
          <span className="text-sm sm:text-base mb-2 xs:mb-0">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length}
            {selectedEmployees.length > 0 && (
              <span className="ml-2 text-[#243158]">
                ({selectedEmployees.length} selected)
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

      {/* Employee Form Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <EmployeeForm
          isEdit={isEditModalOpen}
          initialData={currentEmployee}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setCurrentEmployee(null);
            // Refresh employee list after modal close
            const fetchEmployees = async () => {
              try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                  toast.error('You must be logged in to view employees.');
                  setTimeout(() => navigate('/login'), 2000);
                  return;
                }
                const response = await axios.get(`${apiBaseUrl}/auth/employees/`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                setEmployees(Array.isArray(response.data) ? response.data : []);
              } catch (error) {
                const errorMsg = error.response?.data?.error || 'Failed to refresh employees';
                toast.error(errorMsg);
                setEmployees([]);
                if (error.response?.status === 401) {
                  setError('Session expired or invalid token. Redirecting to login...');
                  setTimeout(() => navigate('/login'), 2000);
                } else {
                  setError(errorMsg);
                }
              }
            };
            fetchEmployees();
          }}
          onSubmitSuccess={(message) => {
            toast.success(message, {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            // Refresh employee list
            const fetchEmployees = async () => {
              try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                  toast.error('You must be logged in to view employees.');
                  setTimeout(() => navigate('/login'), 2000);
                  return;
                }
                const response = await axios.get(`${apiBaseUrl}/auth/employees/`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                setEmployees(Array.isArray(response.data) ? response.data : []);
              } catch (error) {
                const errorMsg = error.response?.data?.error || 'Failed to refresh employees';
                toast.error(errorMsg);
                setEmployees([]);
                if (error.response?.status === 401) {
                  setError('Session expired or invalid token. Redirecting to login...');
                  setTimeout(() => navigate('/login'), 2000);
                } else {
                  setError(errorMsg);
                }
              }
            };
            fetchEmployees();
          }}
          onSubmitError={(error) => {
            toast.error(error, {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }}
        />
      )}
    </div>
  );
};

export default Employees;