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
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [routineServices, setRoutineServices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [amcs, setAmcs] = useState([]);
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
      console.log('Fetching lifts for customerId:', customerId);
      // Fetch all lifts and filter by customer
      const response = await axiosInstance.get(`${apiBaseUrl}/auth/lift_list/`);
      console.log('All lifts:', response.data);
      
      // Try multiple comparison methods to find customer lifts
      const customerLifts = response.data.filter(lift => {
        const liftCustomer = lift.customer;
        const matches = (
          liftCustomer == customerId || 
          liftCustomer === parseInt(customerId) ||
          liftCustomer === customerId.toString() ||
          liftCustomer === String(customerId)
        );
        
        if (matches) {
          console.log('Found matching lift:', lift);
        }
        
        return matches;
      });
      
      console.log('Filtered customer lifts:', customerLifts);
      setLifts(customerLifts);
    } catch (error) {
      console.error('Error fetching customer lifts:', error);
      setLifts([]);
    }
  };

  const fetchCustomerInvoices = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${apiBaseUrl}/sales/invoice-list/`);
      const allInvoices = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      const customerInvoices = allInvoices.filter(inv => {
        const invCustomer = inv.customer || inv.customer_id;
        return (
          invCustomer == customerId ||
          invCustomer === parseInt(customerId) ||
          invCustomer === customerId?.toString()
        );
      });
      setInvoices(customerInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
  };

  const fetchCustomerPayments = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      // Try to fetch payments; adjust endpoint if your API differs
      const response = await axiosInstance.get(`${apiBaseUrl}/sales/payment-list/`);
      const allPayments = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      const customerPayments = allPayments.filter(pay => {
        const payCustomer = pay.customer || pay.customer_id;
        return (
          payCustomer == customerId ||
          payCustomer === parseInt(customerId) ||
          payCustomer === customerId?.toString()
        );
      });
      setPayments(customerPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    }
  };

  const fetchCustomerRoutineServices = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    const tryEndpoints = [
      `${apiBaseUrl}/amc/routine-services/`,
      `${apiBaseUrl}/services/routine-list/`,
      `${apiBaseUrl}/routine/services/`,
    ];

    for (const url of tryEndpoints) {
      try {
        const response = await axiosInstance.get(url);
        const allServices = Array.isArray(response.data) ? response.data : (response.data?.results || []);
        const customerServices = allServices.filter(svc => {
          const svcCustomer = svc.customer || svc.customer_id;
          return (
            svcCustomer == customerId ||
            svcCustomer === parseInt(customerId) ||
            svcCustomer === customerId?.toString()
          );
        });
        setRoutineServices(customerServices);
        return; // success, stop trying
      } catch (e) {
        // continue to next endpoint
      }
    }
    // If all failed
    setRoutineServices([]);
  };

  const fetchCustomerComplaints = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${apiBaseUrl}/complaints/complaint-list/`);
      const allComplaints = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      const customerComplaints = allComplaints.filter(complaint => {
        const complaintCustomer = complaint.customer || complaint.customer_id;
        return (
          complaintCustomer == customerId ||
          complaintCustomer === parseInt(customerId) ||
          complaintCustomer === customerId?.toString()
        );
      });
      setComplaints(customerComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    }
  };

  const fetchCustomerFeedbacks = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${apiBaseUrl}/feedback/feedback-list/`);
      const allFeedbacks = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      const customerFeedbacks = allFeedbacks.filter(feedback => {
        const feedbackCustomer = feedback.customer || feedback.customer_id;
        return (
          feedbackCustomer == customerId ||
          feedbackCustomer === parseInt(customerId) ||
          feedbackCustomer === customerId?.toString()
        );
      });
      setFeedbacks(customerFeedbacks);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks([]);
    }
  };

  const fetchCustomerAMCs = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${apiBaseUrl}/amc/amc-list/`);
      const allAmcs = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      const customerAmcs = allAmcs.filter(amc => {
        const amcCustomer = amc.customer || amc.customer_id;
        return (
          amcCustomer == customerId ||
          amcCustomer === parseInt(customerId) ||
          amcCustomer === customerId?.toString()
        );
      });
      setAmcs(customerAmcs);
    } catch (error) {
      console.error('Error fetching AMCs:', error);
      setAmcs([]);
    }
  };

  useEffect(() => {
    console.log('CustomerDetails mounted with customerId:', customerId);
    if (customerId) {
      fetchCustomerDetails();
      fetchCustomerLifts();
      fetchCustomerInvoices();
      fetchCustomerPayments();
      fetchCustomerRoutineServices();
      fetchCustomerComplaints();
      fetchCustomerFeedbacks();
      fetchCustomerAMCs();
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
    console.log('CustomerDetails - Opening lift form for customerId:', customerId);
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

      <div className="space-y-8">
        {/* Customer Details Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
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
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
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
                      <p className="text-gray-800">{lift.lift_id || lift.lift_code || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Model:</span>
                      <p className="text-gray-800">{lift.model || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Capacity:</span>
                      <p className="text-gray-800">{lift.no_of_passengers || lift.capacity || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Brand:</span>
                      <p className="text-gray-800">{lift.brand_name || lift.brand || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No Lifts</p>
              <p className="text-gray-400 text-sm mt-2">Click "ADD LIFTS" to add lifts for this customer</p>
              <p className="text-gray-400 text-xs mt-1">Debug: lifts.length = {lifts.length}</p>
            </div>
          )}
        </div>

        {/* Contact Information Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
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

        {/* Notes Section - Clean Text Editor Style */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Editor Header */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">NOTES</span>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
              >
                {isEditing ? 'CANCEL' : 'SAVE'}
              </button>
            </div>
          </div>

          {/* Toolbar */}
          {isEditing && (
            <div className="bg-white border-b border-blue-200 px-4 py-2">
              <div className="flex items-center space-x-1">
                {/* Bullet List */}
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Bullet List">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </button>
                
                {/* Checkbox List */}
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Checkbox List">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </button>
                
                {/* Bold */}
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 font-bold" title="Bold">
                  B
                </button>
                
                {/* Italic */}
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 italic" title="Italic">
                  I
                </button>
                
                {/* Underline */}
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 underline" title="Underline">
                  U
                </button>
                
                {/* Font Size Dropdown */}
                <select className="p-2 hover:bg-gray-100 rounded text-gray-600 border-0 bg-transparent text-sm">
                  <option>14</option>
                  <option>12</option>
                  <option>16</option>
                  <option>18</option>
                </select>
                
                {/* Text Color */}
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 bg-yellow-200" title="Text Color">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                  </svg>
                </button>
                
                {/* Text Alignment */}
                <div className="flex space-x-1">
                  <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Align Left">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3z" clipRule="evenodd"/>
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Align Center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm2 4a1 1 0 000 2h10a1 1 0 100-2H5zm-2 4a1 1 0 000 2h14a1 1 0 100-2H3zm2 4a1 1 0 000 2h10a1 1 0 100-2H5z" clipRule="evenodd"/>
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Align Right">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm4 4a1 1 0 000 2h10a1 1 0 100-2H7zm-4 4a1 1 0 000 2h14a1 1 0 100-2H3zm4 4a1 1 0 000 2h10a1 1 0 100-2H7z" clipRule="evenodd"/>
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Justify">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
                
                {/* Indent Controls */}
                <div className="flex space-x-1">
                  <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Decrease Indent">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3z" clipRule="evenodd"/>
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Increase Indent">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
                
                {/* Text Style */}
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Text Style">
                  <span className="text-sm font-bold">T</span>
                  <svg className="w-3 h-3 inline ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Editor Content */}
          <div className="bg-white">
            {isEditing ? (
              <div className="p-4">
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  rows="12"
                  className="w-full bg-transparent text-gray-900 placeholder-gray-400 resize-none focus:outline-none text-sm leading-relaxed"
                  placeholder="Start typing your notes here..."
                  style={{ minHeight: '300px' }}
                />
              </div>
            ) : (
              <div className="p-4">
                <div className="min-h-[300px]">
                  {formData.notes ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900">
                      {formData.notes}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-72 text-gray-400">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg text-gray-500">No notes available</p>
                        <p className="text-sm text-gray-400 mt-2">Click "SAVE" to add customer notes</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Status Bar */}
          <div className="bg-gray-100 border-t border-gray-200 px-4 py-1">
            <div className="text-xs text-gray-500">
              {formData.notes ? formData.notes.length : 0} characters
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">INVOICES</h2>
        </div>

        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="text-left p-3">Invoice No</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr key={inv.id || idx} className="border-t">
                    <td className="p-3">{inv.invoice_no || inv.reference_id || inv.number || '—'}</td>
                    <td className="p-3">{inv.date || inv.invoice_date || (inv.created_at ? inv.created_at.slice(0,10) : '—')}</td>
                    <td className="p-3">{inv.total || inv.amount || inv.grand_total || 0}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {inv.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No Invoices</p>
            <p className="text-gray-400 text-sm mt-2">Click "CREATE INVOICE" to add a new invoice for this customer</p>
          </div>
        )}
      </div>

      {/* AMCs Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">AMCs</h2>
        </div>

        {amcs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="text-left p-3">Reference ID</th>
                  <th className="text-left p-3">AMC Name</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Start</th>
                  <th className="text-left p-3">End</th>
                  <th className="text-left p-3">Equipment No</th>
                </tr>
              </thead>
              <tbody>
                {amcs.map((amc, idx) => (
                  <tr key={amc.id || idx} className="border-t">
                    <td className="p-3">{amc.reference_id || amc.referenceId || '—'}</td>
                    <td className="p-3">{amc.amcname || amc.amc_name || '—'}</td>
                    <td className="p-3">{amc.amc_type_name || amc.amc_type || '—'}</td>
                    <td className="p-3">{amc.start_date || amc.startDate || '—'}</td>
                    <td className="p-3">{amc.end_date || amc.endDate || '—'}</td>
                    <td className="p-3">{amc.equipment_no || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No AMCs</p>
            <p className="text-gray-400 text-sm mt-2">Customer has no AMC records yet</p>
          </div>
        )}
      </div>

      {/* Payments Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">PAYMENTS</h2>
        </div>

        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="text-left p-3">Receipt No</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Mode</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pay, idx) => (
                  <tr key={pay.id || idx} className="border-t">
                    <td className="p-3">{pay.receipt_no || pay.reference_id || pay.number || '—'}</td>
                    <td className="p-3">{pay.date || pay.payment_date || (pay.created_at ? pay.created_at.slice(0,10) : '—')}</td>
                    <td className="p-3">{pay.amount || pay.total || pay.paid_amount || 0}</td>
                    <td className="p-3">{pay.mode || pay.payment_mode || '—'}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {pay.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No Payments</p>
            <p className="text-gray-400 text-sm mt-2">Customer has no payment records yet</p>
          </div>
        )}
      </div>

      {/* Routine Services Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">ROUTINE SERVICES</h2>
        </div>

        {routineServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="text-left p-3">Cust Ref</th>
                  <th className="text-left p-3">Lift Code</th>
                  <th className="text-left p-3">Route</th>
                  <th className="text-left p-3">Block/Wing</th>
                  <th className="text-left p-3">Service Date</th>
                  <th className="text-left p-3">Employee</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {routineServices.map((svc, idx) => (
                  <tr key={svc.id || idx} className="border-t">
                    <td className="p-3">{svc.cust_ref_no || svc.customer_ref || '—'}</td>
                    <td className="p-3">{svc.lift_code || svc.lift || '—'}</td>
                    <td className="p-3">{svc.route || svc.route_name || '—'}</td>
                    <td className="p-3">{svc.block_wing || svc.blockWing || '—'}</td>
                    <td className="p-3">{svc.service_date || svc.planned_date || '—'}</td>
                    <td className="p-3">{svc.employee_name || svc.employee || '—'}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {svc.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No Routine Services</p>
            <p className="text-gray-400 text-sm mt-2">No routine services found for this customer</p>
          </div>
        )}
      </div>

      {/* Complaints Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">COMPLAINTS</h2>
        </div>

        {complaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="text-left p-3">Complaint ID</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Subject</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Priority</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint, idx) => (
                  <tr key={complaint.id || idx} className="border-t">
                    <td className="p-3">{complaint.complaint_id || complaint.reference_id || complaint.id || '—'}</td>
                    <td className="p-3">{complaint.date || complaint.created_date || (complaint.created_at ? complaint.created_at.slice(0,10) : '—')}</td>
                    <td className="p-3">{complaint.subject || complaint.title || complaint.description || '—'}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {complaint.status || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {complaint.priority || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No Complaints</p>
            <p className="text-gray-400 text-sm mt-2">No complaints found for this customer</p>
          </div>
        )}
      </div>

      {/* Feedback Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">FEEDBACK</h2>
          <button
            onClick={() => navigate(`/dashboard/feedback?customerId=${customerId}`)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            ADD FEEDBACK
          </button>
        </div>

        {feedbacks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="text-left p-3">Feedback ID</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Rating</th>
                  <th className="text-left p-3">Comment</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((feedback, idx) => (
                  <tr key={feedback.id || idx} className="border-t">
                    <td className="p-3">{feedback.feedback_id || feedback.reference_id || feedback.id || '—'}</td>
                    <td className="p-3">{feedback.date || feedback.created_date || (feedback.created_at ? feedback.created_at.slice(0,10) : '—')}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={`text-lg ${i < (feedback.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({feedback.rating || 0}/5)</span>
                      </div>
                    </td>
                    <td className="p-3">{feedback.comment || feedback.feedback_text || feedback.description || '—'}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {feedback.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No Feedback</p>
            <p className="text-gray-400 text-sm mt-2">Click "ADD FEEDBACK" to add feedback for this customer</p>
          </div>
        )}
      </div>

      {/* Lift Form Modal */}
      {isLiftFormOpen && (
        <LiftForm
          isEdit={false}
          initialData={{ customer: customerId }}
          onClose={() => setIsLiftFormOpen(false)}
          onSubmitSuccess={() => {
            console.log('LiftForm onSubmitSuccess called for customerId:', customerId);
            fetchCustomerLifts(); // Refresh lifts data
            setIsLiftFormOpen(false);
            toast.success('Lift added successfully!');
          }}
          apiBaseUrl={apiBaseUrl}
          dropdownOptions={{}}
        />
      )}
    </div>
  );
};

export default CustomerDetails;
