import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Trash2, Search, ChevronDown, MoreVertical, Download, Upload, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const apiBaseUrl = import.meta.env.VITE_BASE_API; // http://localhost:8000

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

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
        const response = await axios.get(`${apiBaseUrl}/auth/list-users/`, {
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
      const response = await axios.get(`${apiBaseUrl}/auth/list-users/`, {
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
    });
    setCurrentPage(1);
  };

  const handleSelectUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id)
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(currentUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('You must be logged in to delete users.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        await axios.delete(`${apiBaseUrl}/auth/delete-user/${id}/`, {
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
          await axios.delete(`${apiBaseUrl}/auth/delete-user/${id}/`, {
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
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to export users';
      toast.error(errorMsg);
      if (error.response?.status === 401) {
        setError('Session expired or invalid token. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = filters.search.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 sm:mb-0">Users</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={() => navigate('/dashboard/create-user')}
            className="flex items-center justify-center bg-[#243158] text-white px-4 py-2 rounded-lg hover:bg-[#1e2a4a] transition duration-200"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add User
          </button>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243158]"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          <div className="relative">
            <button
              onClick={() =>
                document.getElementById('options-dropdown').classList.toggle('hidden')
              }
              className="flex items-center bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Options <ChevronDown className="ml-2 w-5 h-5" />
            </button>
            <div
              id="options-dropdown"
              className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10"
            >
              <button
                onClick={() => handleBulkApproval(true)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Approve Selected
              </button>
              <button
                onClick={() => handleBulkApproval(false)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Reject Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Delete Selected
              </button>
              <button
                onClick={handleExport}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Download className="inline w-4 h-4 mr-2" />
                Export to Excel
              </button>
              <label className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Upload className="inline w-4 h-4 mr-2" />
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <button
            onClick={resetFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
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