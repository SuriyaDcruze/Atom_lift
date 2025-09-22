import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Upload } from 'lucide-react';

const QuotationForm = ({
  isEdit = false,
  initialData = {},
  onClose,
  onSubmitSuccess,
  apiBaseUrl,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    referenceId: '',
    customer: '',
    type: '',
    amcType: '',
    salesExecutive: '',
    yearOfMake: '',
    date: '',
    remark: '',
    otherRemark: '',
    lift: '',
    files: [],
    ...initialData,
  });

  // State for errors and submission
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for dropdown options
  const [existingOptions, setExistingOptions] = useState({
    customer: [],
    amcType: [],
    lift: [],
    salesExecutive: [], // Added salesExecutive to store fetched employees
  });

  // Centralized Axios instance with Bearer token
  const createAxiosInstance = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in to continue.');
      window.location.href = '/login';
      return null;
    }
    return axios.create({
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  // Fetch existing options
  const fetchOptions = async (field, retryCount = 2) => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const endpoints = {
        customer: 'sales/customer-list/',
        amcType: 'amc/amc-types/',
        lift: 'auth/lift_list/',
        salesExecutive: 'auth/employees/', // Added endpoint for employees
      };
      const response = await axiosInstance.get(`${apiBaseUrl}/${endpoints[field]}`);
      console.log(`Fetched ${field} data:`, response.data);
      let options = response.data?.results || response.data?.data || response.data || [];
      if (field === 'customer') {
        options = options.map(item => ({ id: item.id, site_name: item.site_name }));
      } else if (field === 'amcType') {
        options = options.map(item => ({
          id: item.id,
          type: item.type || item.name || `AMC-${item.id}`,
        }));
      } else if (field === 'lift') {
        options = options.map(item => ({ id: item.id, lift_code: item.lift_code }));
      } else if (field === 'salesExecutive') {
        options = options.map(item => ({ id: item.id, name: item.name }));
      }
      setExistingOptions((prev) => ({
        ...prev,
        [field]: options,
      }));
    } catch (error) {
      console.error(`Error fetching ${field}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else if (retryCount > 0) {
        console.log(`Retrying fetchOptions for ${field}... (${retryCount} attempts left)`);
        setTimeout(() => fetchOptions(field, retryCount - 1), 2000);
      } else {
        toast.error(`Failed to fetch ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}: ${error.message}`);
      }
    }
  };

  // Fetch options on component mount
  useEffect(() => {
    const fields = ['customer', 'amcType', 'lift', 'salesExecutive']; // Added salesExecutive
    fields.forEach(field => fetchOptions(field));
  }, [apiBaseUrl]);

  useEffect(() => {
    if (!isEdit && !formData.referenceId) {
      fetchNextReferenceId();
    }
  }, [isEdit, formData.referenceId]);

  const fetchNextReferenceId = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${apiBaseUrl}/sales/quotation-list/`);
      const quotations = response.data;
      let nextId = 'ALQ1001';
      if (quotations.length > 0) {
        const numbers = quotations.map(q => parseInt(q.reference_id.replace('ALQ', '')) || 0);
        const maxNum = Math.max(...numbers);
        nextId = `ALQ${(maxNum + 1)}`;
      }
      setFormData(prev => ({ ...prev, referenceId: nextId }));
    } catch (error) {
      console.error('Error fetching next reference ID:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error('Failed to generate reference ID. Please try again.');
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handle lift selection (single value)
  const handleLiftChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, lift: value }));
    setErrors(prev => ({ ...prev, lift: '' }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, files }));
    setErrors(prev => ({ ...prev, files: '' }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.referenceId) newErrors.referenceId = 'Reference ID is required';
    if (!formData.type) newErrors.type = 'Quotation type is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.lift) newErrors.lift = 'A lift must be selected';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const [customers, amcTypes, lifts, employees] = await Promise.all([
        axiosInstance.get(`${apiBaseUrl}/sales/customer-list/`),
        axiosInstance.get(`${apiBaseUrl}/amc/amc-types/`),
        axiosInstance.get(`${apiBaseUrl}/auth/lift_list/`),
        axiosInstance.get(`${apiBaseUrl}/auth/employees/`), // Fetch employees for submission
      ]);

      const quotationData = {
        reference_id: formData.referenceId,
        customer: customers.data.find(c => c.site_name === formData.customer)?.id || formData.customer,
        type: formData.type,
        amc_type: amcTypes.data.find(a => a.type === formData.amcType)?.id || null,
        sales_executive: employees.data.find(e => e.name === formData.salesExecutive)?.id || null, // Map name to ID
        year_of_make: formData.yearOfMake || null,
        date: formData.date,
        remark: formData.remark || null,
        other_remark: formData.otherRemark || null,
        lift: lifts.data.find(l => l.lift_code === formData.lift)?.id || formData.lift,
      };

      const formDataToSend = new FormData();
      Object.entries(quotationData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      formData.files.forEach((file, index) => {
        formDataToSend.append(`files[${index}]`, file);
      });

      if (isEdit) {
        await axiosInstance.put(`${apiBaseUrl}/sales/edit-quotation/${initialData.id}/`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axiosInstance.post(`${apiBaseUrl}/sales/add-quotation/`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success(isEdit ? 'Quotation updated successfully!' : 'Quotation created successfully!');
      onSubmitSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} quotation:`, error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} quotation.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Main Form Modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2D3A6B] to-[#243158] p-6">
          <h2 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Quotation' : 'Create New Quotation'}
          </h2>
          <p className="text-white">
            Fill in the details below to {isEdit ? 'update' : 'create'} a quotation.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Basic Information
              </h3>

              {/* Reference ID */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="referenceId"
                  value={formData.referenceId}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${errors.referenceId ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-100`}
                  required
                  readOnly
                />
                {errors.referenceId && (
                  <p className="text-red-500 text-xs mt-1">{errors.referenceId}</p>
                )}
              </div>

              {/* Customer */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <select
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">Select Customer</option>
                  {existingOptions.customer.map((option) => (
                    <option key={option.id} value={option.site_name}>
                      {option.site_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quotation Type */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quotation Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white`}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Parts/Peripheral Quotation">Parts/Peripheral Quotation</option>
                  <option value="Repair">Repair</option>
                  <option value="AMC Renewal Quotation">AMC Renewal Quotation</option>
                  <option value="AMC">AMC</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1">{errors.type}</p>
                )}
              </div>

              {/* AMC Type */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AMC Type
                </label>
                <select
                  name="amcType"
                  value={formData.amcType}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">Select AMC Type</option>
                  {existingOptions.amcType.map((option) => (
                    <option key={option.id} value={option.type}>
                      {option.type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sales/Service Executive */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sales/Service Executive
                </label>
                <select
                  name="salesExecutive"
                  value={formData.salesExecutive}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">Select Executive</option>
                  {existingOptions.salesExecutive.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column - Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Additional Information
              </h3>

              {/* Year of Make */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Make
                </label>
                <input
                  type="text"
                  name="yearOfMake"
                  value={formData.yearOfMake}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                />
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200`}
                  required
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>

              {/* Lift */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lift <span className="text-red-500">*</span>
                </label>
                <select
                  name="lift"
                  value={formData.lift}
                  onChange={handleLiftChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${
                    errors.lift ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white`}
                  required
                >
                  <option value="">Select Lift</option>
                  {existingOptions.lift.map((option) => (
                    <option key={option.id} value={option.lift_code}>
                      {option.lift_code}
                    </option>
                  ))}
                </select>
                {errors.lift && (
                  <p className="text-red-500 text-xs mt-1">{errors.lift}</p>
                )}
              </div>

              {/* Remark */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remark
                </label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  rows="3"
                />
              </div>

              {/* Other Remark */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Remark
                </label>
                <textarea
                  name="otherRemark"
                  value={formData.otherRemark}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  rows="3"
                />
              </div>

              {/* File Upload */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Files
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white cursor-pointer hover:bg-gray-50 transition-all duration-200"
                  >
                    <Upload className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">Choose files</span>
                  </label>
                </div>
                {formData.files.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {formData.files.map((file, index) => (
                      <p key={index}>{file.name}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2.5 bg-gradient-to-r from-[#2D3A6B] to-[#243158] rounded-lg text-white font-medium transition-all duration-200 shadow-md ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-[#213066] hover:to-[#182755]'
            }`}
          >
            {isEdit ? 'Update Quotation' : 'Create Quotation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationForm;