import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Trash2, Search, ChevronDown, MoreVertical, Download, Upload, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const apiBaseUrl = import.meta.env.VITE_BASE_API; // http://localhost:8000

const Users = () => {
  // State for users data and loading/error status
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  // State for filters
  const [filters, setFilters] = useState({
    search: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('You must be logged in to view users.');
          setTimeout(() => navigate('/login'), 2000);
          setLoading(false);
          return;
        }

        console.log('Fetching users with token:', token.substring(0, 10) + '...');
        const response = await axios.get(`${apiBaseUrl}/auth/admin/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('API response:', response.data);
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          throw new Error('Invalid response format from API');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error.response || error);
        const errorMsg = error.response?.data?.error || error.message || 'Failed to fetch users';
        toast.error(errorMsg);
        if (error.response?.status === 401) {
          setError('Session expired or invalid token. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(errorMsg);
        }
        setUsers([]);
        setLoading(false);
      }
    };
    fetchUsers();
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
        toast.error('You must be logged in to import users.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`${apiBaseUrl}/auth/admin/import-users-csv/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Users imported successfully.');
      document.getElementById('options-dropdown').classList.add('hidden');
      // Refresh user list
      const response = await axios.get(`${apiBaseUrl}/auth/admin/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to import users';
      toast.error(errorMsg);
      if (error.response?.status === 401) {
        setError('Session expired or invalid token. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
      document.getElementById('options-dropdown').classList.add('hidden');
    }
  };

  // Handle approve/reject user
  const handleToggleApproval = async (id, isApproved) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('You must be logged in to update user approval.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await axios.patch(
        `${apiBaseUrl}/auth/admin/users/${id}/approve/`,
        { is_approved: !isApproved },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(prev =>
        prev.map(user =>
          user.id === id ? { ...user, is_approved: response.data.is_approved } : user
        )
      );
      toast.success(`User ${isApproved ? 'rejected' : 'approved'} successfully.`);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update user approval';
      toast.error(errorMsg);
      if (error.response?.status === 401) {
        setError('Session expired or invalid token. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  // Handle bulk approve/reject
  const handleBulkApproval = async (approve) => {
    if (selectedUsers.length === 0) {
      toast.warning('No users selected for approval/rejection');
      return;
    }

    if (window.confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} ${selectedUsers.length} selected users?`)) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('You must be logged in to update user approval.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        for (const id of selectedUsers) {
          await axios.patch(
            `${apiBaseUrl}/auth/admin/users/${id}/approve/`,
            { is_approved: approve },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        setUsers(prev =>
          prev.map(user =>
            selectedUsers.includes(user.id) ? { ...user, is_approved: approve } : user
          )
        );
        setSelectedUsers([]);
        toast.success(`${selectedUsers.length} users ${approve ? 'approved' : 'rejected'} successfully.`);
      } catch (error) {
        const errorMsg = error.response?.data?.error || `Failed to ${approve ? 'approve' : 'reject'} selected users`;
        toast.error(errorMsg);
        if (error.response?.status === 401) {
          setError('Session expired or invalid token. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        }
      }
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

  // Handle user selection
  const handleSelectUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id)
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
  };

  // Handle select all users on current page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(currentUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('You must be logged in to delete users.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        await axios.delete(`${apiBaseUrl}/auth/admin/users/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(prev => prev.filter(user => user.id !== id));
        setSelectedUsers(prev => prev.filter(userId => userId !== id));
        setCurrentPage(1);
        toast.success('User deleted successfully.');
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to delete user';
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
    if (selectedUsers.length === 0) {
      toast.warning('No users selected for deletion');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected users?`)) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('You must be logged in to delete users.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        for (const id of selectedUsers) {
          await axios.delete(`${apiBaseUrl}/auth/admin/users/${id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
        setSelectedUsers([]);
        toast.success(`${selectedUsers.length} users deleted successfully.`);
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to delete selected users';
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
        toast.error('You must be logged in to export users.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await axios.get(`${apiBaseUrl}/api/admin/export-users/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users_export.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Users exported successfully.');
      document.getElementById('options-dropdown').classList.add('hidden');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to export users';
      toast.error(errorMsg);
      if (error.response?.status === 401) {
        setError('Session expired or invalid token. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
      document.getElementById('options-dropdown').classList.add('hidden');
    }
  };

  // Filter users based on current filters
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
    user.email.toLowerCase().includes(filters.search.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
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
                placeholder="Search by username or email..."
              />
            </div>
          </div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm sm:text-base"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
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
                  onClick={() => handleBulkApproval(true)}
                  className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-100 hover:text-green-900"
                  role="menuitem"
                >
                  <CheckCircle className="w-4 h-4 mr-3" />
                  Approve Selected
                </button>
                <button
                  onClick={() => handleBulkApproval(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-100 hover:text-red-900"
                  role="menuitem"
                >
                  <XCircle className="w-4 h-4 mr-3" />
                  Reject Selected
                </button>
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
                  checked={currentUsers.length > 0 && selectedUsers.length === currentUsers.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#243158]"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-red-500">
                  Error: {error}
                </td>
              </tr>
            ) : currentUsers.length > 0 ? (
              currentUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => handleToggleApproval(user.id, user.is_approved)}
                      className={`flex items-center ${user.is_approved ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                      title={user.is_approved ? 'Reject' : 'Approve'}
                    >
                      {user.is_approved ? (
                        <CheckCircle className="w-5 h-5 mr-1" />
                      ) : (
                        <XCircle className="w-5 h-5 mr-1" />
                      )}
                      {user.is_approved ? 'Approved' : 'Not Approved'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.updated_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
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
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  No users found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-white p-3 text-gray-600 flex flex-col sm:flex-row justify-between items-center">
          <span className="text-sm md:text-base mb-2 md:mb-0">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length}
            {selectedUsers.length > 0 && (
              <span className="ml-2 text-[#243158]">
                ({selectedUsers.length} selected)
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
        ) : currentUsers.length > 0 ? (
          currentUsers.map(user => (
            <div key={user.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300 mr-2"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg truncate">{user.email}</h3>
                    <p className="text-sm text-gray-600 truncate">{user.username}</p>
                  </div>
                </div>
                <div className="ml-2">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">ID</span>
                  <span className="font-medium">{user.id}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Approved</span>
                  <button
                    onClick={() => handleToggleApproval(user.id, user.is_approved)}
                    className={`flex items-center ${user.is_approved ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {user.is_approved ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-1" />
                    )}
                    {user.is_approved ? 'Approved' : 'Not Approved'}
                  </button>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Created At</span>
                  <span className="font-medium">{new Date(user.created_at).toLocaleString()}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Updated At</span>
                  <span className="font-medium">{new Date(user.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No users found matching your criteria
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white rounded-lg shadow p-3 text-gray-600 flex flex-col xs:flex-row justify-between items-center">
          <span className="text-sm sm:text-base mb-2 xs:mb-0">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length}
            {selectedUsers.length > 0 && (
              <span className="ml-2 text-[#243158]">
                ({selectedUsers.length} selected)
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
    </div>
  );
};

export default Users;