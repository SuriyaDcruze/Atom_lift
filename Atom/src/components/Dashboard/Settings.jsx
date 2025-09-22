import { useState } from 'react';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const Settings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Client-side validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    // Get the JWT token from localStorage
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please log in to change your password.');
      return;
    }

    try {
      console.log('Sending request with token:', token); // Debug token
      const response = await axios.post(
        `${apiBaseUrl}/auth/change-password/`, // Updated to use apiBaseUrl
        {
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
          confirm_password: formData.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Success response:', response.data); // Debug success
      setMessage(response.data.message);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear form
    } catch (err) {
      console.error('Error details:', err); // Log full error for debugging
      if (err.response) {
        console.log('Response data:', err.response.data); // Log backend response
        setError(
          err.response.data.current_password?.[0] || // Array-style errors
          err.response.data.confirm_password?.[0] ||
          err.response.data.message ||
          'An error occurred while changing the password.'
        );
      } else if (err.request) {
        setError('No response from the server. Please check your network.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-medium text-gray-800 text-center mb-6">Dashboard Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
            />
          </div>
          {message && <p className="text-sm text-center text-green-500">{message}</p>}
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              className="px-4 py-2 bg-[#243158] text-white rounded-md hover:bg-[#111520] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;