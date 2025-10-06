import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SuccessToast from './messages/SuccessToast';
import ErrorToast from './messages/ErrorToast';
import LiftForm from './Forms/LiftForm';

const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [lifts, setLifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLiftFormOpen, setIsLiftFormOpen] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_BASE_API;

  const createAxiosInstance = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast(<ErrorToast message="Authentication required" />, { autoClose: 3000 });
      navigate('/login');
      return null;
    }
    return axios.create({
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const fetchCustomerDetails = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      setLoading(true);
      console.log('Fetching customer details for ID:', customerId);
      // Fetch all customers and find the one with matching ID
      const response = await axiosInstance.get(`${apiBaseUrl}/sales/customer-list/`);
      console.log('Customer list response:', response.data);
      const customerData = response.data.find(customer => customer.id == customerId);
      console.log('Found customer data:', customerData);
      
      if (customerData) {
        setCustomer(customerData);
        setFormData(customerData);
        console.log('Customer data set successfully');
      } else {
        console.error('Customer not found with ID:', customerId);
        toast(<ErrorToast message="Customer not found" />, { autoClose: 3000 });
        navigate('/dashboard/customers');
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast(<ErrorToast message="Failed to fetch customer details" />, { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerLifts = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      // Fetch all lifts and filter by customer
      const response = await axiosInstance.get(`${apiBaseUrl}/auth/lift_list/`);
      const customerLifts = response.data.filter(lift => lift.customer == customerId);
      setLifts(customerLifts);
    } catch (error) {
      console.error('Error fetching customer lifts:', error);
      setLifts([]);
    }
  };

  useEffect(() => {
    console.log('CustomerDetails mounted with customerId:', customerId);
    if (customerId) {
      fetchCustomerDetails();
      fetchCustomerLifts();
    } else {
      console.error('No customerId provided');
      toast(<ErrorToast message="No customer ID provided" />, { autoClose: 3000 });
      navigate('/dashboard/customers');
    }
  }, [customerId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      await axiosInstance.put(`${apiBaseUrl}/sales/edit-customer/${customerId}/`, formData);
      toast(<SuccessToast message="Customer updated successfully" />, { autoClose: 3000 });
      setIsEditing(false);
      fetchCustomerDetails();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast(<ErrorToast message="Failed to update customer" />, { autoClose: 3000 });
    }
  };

  const handleSetPassword = () => {
    // Navigate to set password page or open modal
    navigate(`/dashboard/customer/${customerId}/set-password`);
  };

  const handleCreateQuotation = () => {
    // Navigate to create quotation page
    navigate(`/dashboard/quotation?customerId=${customerId}`);
  };

  const handleNewAMC = () => {
    // Navigate to AMC form with customer pre-selected
    navigate(`/dashboard/amc?customerId=${customerId}`);
  };

  const handleComplaint = () => {
    // Navigate to complaint form
    navigate(`/dashboard/complaints?customerId=${customerId}`);
  };

  const handleAddLifts = () => {
    // Open lift form modal
    setIsLiftFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Customer not found</p>
        <button 
          onClick={() => navigate('/dashboard/customers')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2D3A6B] to-[#243158] text-white px-6 py-4 rounded-xl shadow mb-6">
        <h1 className="text-2xl font-bold">{customer.site_name || 'Customer Details'}</h1>
        <p className="text-white/80">Customer ID: {customer.site_id}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleSetPassword}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          SET PWD
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {isEditing ? 'CANCEL' : 'EDIT'}
        </button>
        <button
          onClick={handleCreateQuotation}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          CREATE QUOTATION FOR DEFAULT AMC
        </button>
        <button
          onClick={handleNewAMC}
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          NEW AMC
        </button>
        <button
          onClick={handleComplaint}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          COMPLAINT OR CODE
        </button>
      </div>

      <div className="space-y-6">
        {/* Customer Details Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            CUSTOMER DETAILS (CREATED BY: {customer.created_by || 'ADMIN'})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">JOB No</label>
                <input
                  type="text"
                  name="job_no"
                  value={formData.job_no || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SECTOR</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="sector_private"
                    checked={formData.sector === 'private'}
                    onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.checked ? 'private' : 'government' }))}
                    disabled={!isEditing}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Private</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PRIMARY CONTACT</label>
                <input
                  type="text"
                  name="contact_person_name"
                  value={formData.contact_person_name || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EMAIL</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LATITUDE & LONGITUDE</label>
                <input
                  type="text"
                  name="coordinates"
                  value={formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Middle Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PHONE</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MOBILE</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST NUMBER</label>
                <input
                  type="text"
                  name="gst_number"
                  value={formData.gst_number || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text sm font-medium text-gray-700 mb-1">PAN NUMBER</label>
                <input
                  type="text"
                  name="pan_number"
                  value={formData.pan_number || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Right Column - Address Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OFFICE ADDRESS</label>
                <textarea
                  name="office_address"
                  value={formData.office_address || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows="3"
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SITE ADDRESS</label>
                <textarea
                  name="site_address"
                  value={formData.site_address || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows="3"
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CITY</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN CODE</label>
                <input
                  type="text"
                  name="pin_code"
                  value={formData.pin_code || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Additional Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">COUNTRY</label>
              <input
                type="text"
                name="country"
                value={formData.country || 'India'}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PROVINCE/STATE</label>
              <input
                type="text"
                name="province_state"
                value={formData.province_state || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ROUTES</label>
              <input
                type="text"
                name="routes"
                value={formData.routes || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HANDOVER DATE</label>
              <input
                type="date"
                name="handover_date"
                value={formData.handover_date || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Attachment Section */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">ATTACHMENT</label>
            <input
              type="file"
              name="attachment"
              disabled={!isEditing}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
            />
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Customer Lifts Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">CUSTOMER LIFTS</h2>
            <button
              onClick={handleAddLifts}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              ADD LIFTS
            </button>
          </div>
          
          {lifts.length > 0 ? (
            <div className="space-y-3">
              {lifts.map((lift, index) => (
                <div key={lift.id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Lift ID:</span>
                      <p className="text-gray-800">{lift.lift_id || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Model:</span>
                      <p className="text-gray-800">{lift.model || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Capacity:</span>
                      <p className="text-gray-800">{lift.capacity || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <p className="text-gray-800">{lift.status || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No Lifts</p>
              <p className="text-gray-400 text-sm mt-2">Click "ADD LIFTS" to add lifts for this customer</p>
            </div>
          )}
        </div>

        {/* Contact Information Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">CONTACT</h2>
            <button
              onClick={() => {
                // Navigate to contact form or open contact modal
                navigate(`/dashboard/contacts?customerId=${customerId}`);
              }}
             className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              ADD CONTACT
            </button>
          </div>
          
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No Contacts</p>
            <p className="text-gray-400 text-sm mt-2">Click "ADD CONTACT" to add contact information for this customer</p>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">NOTES</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}

                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              {isEditing ? 'CANCEL' : 'EDIT NOTES'}
            </button>
          </div>
          
          {/* Notes Display */}
          <div className="space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Customer Notes</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    {formData.notes ? (
                      <p className="whitespace-pre-wrap">{formData.notes}</p>
                    ) : (
                      <p className="text-gray-500 italic">No notes available. Click "EDIT NOTES" to add customer notes.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Notes Section */}
            {isEditing && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Edit Customer Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  rows="4"
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Add customer notes, preferences, or special requirements..."
                />
              </div>
            )}

            {/* Save Button */}
            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  Save Notes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lift Form Modal */}
      {isLiftFormOpen && (
        <LiftForm
          isEdit={false}
          initialData={{ customer: customerId }}
          onClose={() => setIsLiftFormOpen(false)}
          onSubmitSuccess={() => {
            fetchCustomerLifts(); // Refresh lifts data
            setIsLiftFormOpen(false);
            toast.success('Lift added successfully!');
          }}
          onSubmitError={(error) => {
            toast.error(error || 'Failed to add lift');
          }}
          apiBaseUrl={apiBaseUrl}
          dropdownOptions={{}}
        />
      )}
    </div>
  );
};

export default CustomerDetails;
