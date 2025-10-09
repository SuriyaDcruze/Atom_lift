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
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New User</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#243158]"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#243158]"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#243158]"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#243158]"
            required
          >
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="SALESMAN">Salesman</option>
            <option value="PENDING">Pending</option>
            <option value="TECHNICIAN">Technician</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#243158]"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Permissions</label>
          <div className="grid grid-cols-2 gap-2">
            {permissionsList.length > 0 ? (
              permissionsList.map((perm) => (
                <div key={perm} className="flex items-center">
                  <input
                    type="checkbox"
                    value={perm}
                    checked={formData.permissions.includes(perm)}
                    onChange={handlePermissionChange}
                    className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300"
                  />
                  <label className="ml-2 text-sm text-gray-700">{perm}</label>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No permissions available. Please check your connection or permissions.</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#243158] text-white py-2 rounded-md hover:bg-[#1e2a4a] transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default CreateUser;