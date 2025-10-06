import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorToast from '../messages/ErrorToast';
import SuccessToast from '../messages/SuccessToast';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const EmployeeForm = ({ isEdit, initialData, onClose, onSubmitSuccess, onSubmitError }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alertMessage, setAlertMessage] = useState({
    show: false,
    type: '', // 'success' or 'error'
    message: '',
    description: ''
  });

  // Helper functions for showing alert messages
  const showSuccessMessage = (message, description = '', autoHide = true) => {
    setAlertMessage({
      show: true,
      type: 'success',
      message,
      description
    });
    // Auto-hide after 3 seconds only if autoHide is true
    if (autoHide) {
      setTimeout(() => {
        setAlertMessage(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  const showErrorMessage = (message, description = '') => {
    setAlertMessage({
      show: true,
      type: 'error',
      message,
      description
    });
    // Auto-hide after 5 seconds for errors
    setTimeout(() => {
      setAlertMessage(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Check token only on initial mount
  const token = localStorage.getItem('access_token');
  useEffect(() => {
    if (!token) {
      console.log('No token found on mount, redirecting to login at:', new Date().toISOString());
      navigate('/login');
    } else {
      console.log('Token found on mount:', token.substring(0, 10) + '...');
    }
  }, [navigate]);

  useEffect(() => {
    if (isEdit && initialData) {
      console.log('Populating form with initialData:', initialData);
      setFormData({
        username: initialData.username || '',
        email: initialData.email || '',
        password: '',
        password_confirm: '',
        name: initialData.name || '',
      });
    } else if (id) {
      const fetchEmployee = async () => {
        try {
          if (!token) {
            throw new Error('No token available');
          }
          console.log('Fetching employee with ID:', id, 'at:', new Date().toISOString(), 'Token:', token.substring(0, 10) + '...');
          const response = await axios.get(`${apiBaseUrl}/auth/employees/${id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Fetch employee response:', response.data);
          setFormData({
            username: response.data.username,
            email: response.data.email,
            password: '',
            password_confirm: '',
            name: response.data.name,
          });
        } catch (err) {
          const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch employee data';
          console.error('Fetch employee error at:', new Date().toISOString(), err.response || err);
          if (err.response?.status === 401) {
            showErrorMessage('Session expired or invalid token. Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
          } else {
            showErrorMessage(errorMsg);
          }
        }
      };
      fetchEmployee();
    }
  }, [id, isEdit, initialData, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!isEdit && formData.password !== formData.password_confirm) {
      showErrorMessage('Passwords do not match');
      return false;
    }
    if (!formData.username || !formData.email) {
      showErrorMessage('Username and email are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear any previous messages
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Submitting form at:', new Date().toISOString(), 'with token:', token.substring(0, 10) + '...');
      console.log('Form data:', formData);
      if (!token) {
        throw new Error('You must be logged in to perform this action.');
      }

      const url = isEdit ? `${apiBaseUrl}/auth/edit-employee/${initialData.id}/` : `${apiBaseUrl}/auth/add-employee/`;
      console.log('Request URL:', url, 'Method:', isEdit ? 'PUT' : 'POST');
      const method = isEdit ? 'put' : 'post';
      const response = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Response:', response.data);
      showSuccessMessage(response.data.message || (isEdit ? 'Employee updated successfully' : 'Employee added successfully'));
      onSubmitSuccess(response.data.message || (isEdit ? 'Employee updated successfully' : 'Employee added successfully'));
      setTimeout(() => {
        onClose();
        // Removed: if (!isEdit) navigate('/employees');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'An error occurred';
      console.error('Submit error at:', new Date().toISOString(), err.response || err);
      if (err.response?.status === 401) {
        showErrorMessage('Session expired or invalid token. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showErrorMessage(errorMsg);
        onSubmitError(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      {/* Fixed positioned messages in right bottom corner */}
      {alertMessage.show && (
        <div className="fixed bottom-4 right-4 z-[60] max-w-sm animate-in slide-in-from-right-2 duration-300">
          {alertMessage.type === 'success' ? (
            <SuccessToast 
              message={alertMessage.message} 
              description={alertMessage.description}
              autoClose={3000}
              onClose={() => setAlertMessage(prev => ({ ...prev, show: false }))}
            />
          ) : (
            <ErrorToast 
              message={alertMessage.message} 
              description={alertMessage.description}
              autoClose={5000}
              onClose={() => setAlertMessage(prev => ({ ...prev, show: false }))}
            />
          )}
        </div>
      )}
      
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEdit}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              required={!isEdit}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name (Optional)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isEdit ? 'Update' : 'Add'} Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;