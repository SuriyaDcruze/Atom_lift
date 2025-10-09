import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const apiBaseUrl = import.meta.env.VITE_BASE_API; // Ensure this is set to your backend base URL, e.g., http://localhost:8000

const CreateUser = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'PENDING',
    phone_number: '',
    permissions: [],
  });
  const [loading, setLoading] = useState(false);
  const [permissionsList, setPermissionsList] = useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('You must be logged in to access this page.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        console.log('Fetching permissions with token:', token.substring(0, 10) + '...');
        const response = await axios.get(`${apiBaseUrl}/auth/permissions/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Permissions response:', response.data);
        setPermissionsList(response.data.permissions || []);
      } catch (error) {
        console.error('Error fetching permissions:', error.response || error);
        const errorMsg = error.response?.data?.error || 'Failed to fetch permissions';
        toast.error(errorMsg);
        if (error.response?.status === 401) {
          toast.error('Session expired. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        }
      }
    };
    fetchPermissions();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return { ...prev, permissions: [...prev.permissions, value] };
      } else {
        return { ...prev, permissions: prev.permissions.filter((perm) => perm !== value) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('You must be logged in to create users.');
        setTimeout(() => navigate('/login'), 2000);
        setLoading(false);
        return;
      }

      const createResponse = await axios.post(`${apiBaseUrl}/auth/create-user/`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone_number: formData.phone_number,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId = createResponse.data.id;
      toast.success('User created successfully.');

      if (formData.permissions.length > 0) {
        await axios.patch(`${apiBaseUrl}/auth/permissions/${userId}/`, {
          permissions: formData.permissions,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Permissions assigned successfully.');
      }

      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'PENDING',
        phone_number: '',
        permissions: [],
      });
      navigate('/dashboard/user'); // Redirect to user list
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create user or assign permissions';
      toast.error(errorMsg);
      if (error.response?.status === 401) {
        toast.error('Session expired. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md lg:max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8 text-center text-gray-800">Create New User</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <div className="mb-4 lg:mb-0">
            <label className="block text-gray-700 text-sm sm:text-base lg:text-lg mb-2 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243158] focus:border-transparent text-sm sm:text-base lg:text-lg transition-all duration-200"
              required
            />
          </div>
          <div className="mb-4 lg:mb-0">
            <label className="block text-gray-700 text-sm sm:text-base lg:text-lg mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243158] focus:border-transparent text-sm sm:text-base lg:text-lg transition-all duration-200"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <div className="mb-4 lg:mb-0">
            <label className="block text-gray-700 text-sm sm:text-base lg:text-lg mb-2 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243158] focus:border-transparent text-sm sm:text-base lg:text-lg transition-all duration-200"
              required
            />
          </div>
          <div className="mb-4 lg:mb-0">
            <label className="block text-gray-700 text-sm sm:text-base lg:text-lg mb-2 font-medium">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243158] focus:border-transparent text-sm sm:text-base lg:text-lg transition-all duration-200"
              required
            >
              <option value="OWNER">Owner</option>
              <option value="ADMIN">Admin</option>
              <option value="SALESMAN">Salesman</option>
              <option value="PENDING">Pending</option>
              <option value="TECHNICIAN">Technician</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm sm:text-base lg:text-lg mb-2 font-medium">Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full max-w-md px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243158] focus:border-transparent text-sm sm:text-base lg:text-lg transition-all duration-200"
          />
        </div>
        <div className="mb-8">
          <label className="block text-gray-700 text-sm sm:text-base lg:text-lg mb-4 font-medium">Permissions</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-4">
            {permissionsList.length > 0 ? (
              permissionsList.map((perm) => (
                <div key={perm} className="flex items-start p-3 lg:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200 min-h-[60px]">
                  <input
                    type="checkbox"
                    value={perm}
                    checked={formData.permissions.includes(perm)}
                    onChange={handlePermissionChange}
                    className="h-4 w-4 lg:h-5 lg:w-5 text-[#243158] rounded focus:ring-[#243158] border-gray-300 flex-shrink-0 mt-0.5"
                  />
                  <label className="ml-3 text-xs sm:text-sm lg:text-sm text-gray-700 break-words cursor-pointer leading-relaxed">{perm}</label>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm lg:text-base col-span-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">No permissions available. Please check your connection or permissions.</p>
            )}
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full max-w-md lg:max-w-lg bg-[#243158] text-white py-3 sm:py-2 lg:py-4 rounded-lg hover:bg-[#1e2a4a] transition-all duration-200 disabled:opacity-50 text-sm sm:text-base lg:text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? 'Creating User...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;