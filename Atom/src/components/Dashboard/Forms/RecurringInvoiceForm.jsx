import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const RecurringInvoiceForm = ({ isOpen, onClose, onInvoiceAdded, isEdit = false, initialData = {} }) => {
  const [formData, setFormData] = useState({
    customer: '',
    profile_name: '',
    order_number: '',
    repeat_every: 'week',
    start_date: '',
    end_date: '',
    sales_person: '',
    billing_address: '',
    shipping_address: '',
    gst_treatment: '',
    status: 'active',
    uploads_files: null,
    ...initialData,
  });
  const [items, setItems] = useState([{ item: '', rate: '', qty: 1, tax: 0.00 }]);
  const [customers, setCustomers] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAxiosInstance = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication token not found');
      return null;
    }
    return axios.create({
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const fetchData = async (endpoint, setter, retryCount = 2) => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_BASE_API}/${endpoint}`);
      if (!response.data) throw new Error('No data received');
      setter(response.data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (retryCount > 0 && error.code === 'ERR_NETWORK') {
        setTimeout(() => fetchData(endpoint, setter, retryCount - 1), 2000);
      } else {
        setError(`Failed to fetch ${endpoint.replace(/[-]/g, ' ').trim()}.`);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData('sales/customer-list/', setCustomers);
      fetchData('auth/item-list/', setItemOptions);
      fetchData('auth/employees/', setSalesPersons);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isEdit && initialData.id) {
      const axiosInstance = createAxiosInstance();
      if (!axiosInstance) return;
      axiosInstance.get(`${import.meta.env.VITE_BASE_API}/sales/edit-recurring-invoice/${initialData.id}/`)
        .then(response => {
          const data = response.data;
          setFormData({
            customer: data.customer || '',
            profile_name: data.profile_name || '',
            order_number: data.order_number || '',
            repeat_every: data.repeat_every || 'week',
            start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : '',
            end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : '',
            sales_person: data.sales_person || '',
            billing_address: data.billing_address || '',
            shipping_address: data.shipping_address || '',
            gst_treatment: data.gst_treatment || '',
            status: data.status || 'active',
          });
          setItems(data.items.length > 0 ? data.items.map(item => ({
            item: item.item || '',
            rate: item.rate !== null && item.rate !== '' ? item.rate.toString() : '',
            qty: item.qty || 1,
            tax: item.tax || 0.00
          })) : [{ item: '', rate: '', qty: 1, tax: 0.00 }]);
        })
        .catch(err => {
          console.error('Error loading invoice data:', err);
          setError('Failed to load invoice data');
        });
    }
  }, [isOpen, isEdit, initialData.id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (name === 'start_date' || name === 'end_date') {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (name === 'customer') {
      const selectedCustomer = customers.find(cust => cust.id === parseInt(value));
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        billing_address: selectedCustomer ? selectedCustomer.site_address : '',
        shipping_address: selectedCustomer ? selectedCustomer.site_address : '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...items];
    updatedItems[index][name] = value;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { item: '', rate: '', qty: 1, tax: 0.00 }]);
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const calculateTotal = (item) => {
    const rate = parseFloat(item.rate) || 0;
    const qty = parseInt(item.qty) || 1;
    const tax = parseFloat(item.tax) || 0;
    return (rate * qty * (1 + tax / 100)).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!formData.customer || !formData.start_date) {
      setError('Customer and Start Date are required.');
      setIsSubmitting(false);
      return;
    }

    const validatedItems = items.map(item => {
      const rate = parseFloat(item.rate);
      if (!item.item || isNaN(rate) || rate <= 0) {
        throw new Error('Each item must have a valid item selection and a positive rate.');
      }
      return {
        item: item.item,
        rate: rate.toFixed(2),
        qty: parseInt(item.qty) || 1,
        tax: parseFloat(item.tax) || 0.00,
      };
    });

    try {
      const axiosInstance = createAxiosInstance();
      if (!axiosInstance) throw new Error('Authentication failed');

      const payload = {
        customer: parseInt(formData.customer),
        profile_name: formData.profile_name,
        order_number: formData.order_number,
        repeat_every: formData.repeat_every,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        sales_person: formData.sales_person ? parseInt(formData.sales_person) : null,
        billing_address: formData.billing_address,
        shipping_address: formData.shipping_address,
        gst_treatment: formData.gst_treatment,
        status: formData.status.toLowerCase(),
        items: validatedItems,
      };

      let response;
      if (formData.uploads_files) {
        const formPayload = new FormData();
        formPayload.append('uploads_files', formData.uploads_files);
        Object.entries(payload).forEach(([key, value]) => {
          formPayload.append(key, value);
        });
        const url = isEdit && initialData.id
          ? `${import.meta.env.VITE_BASE_API}/sales/edit-recurring-invoice/${initialData.id}/`
          : `${import.meta.env.VITE_BASE_API}/sales/add-recurring-invoice/`;
        response = await axiosInstance[isEdit ? 'put' : 'post'](url, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        const url = isEdit && initialData.id
          ? `${import.meta.env.VITE_BASE_API}/sales/edit-recurring-invoice/${initialData.id}/`
          : `${import.meta.env.VITE_BASE_API}/sales/add-recurring-invoice/`;
        response = await axiosInstance[isEdit ? 'put' : 'post'](url, payload);
      }

      const result = response.data;
      if (typeof onInvoiceAdded === 'function') {
        onInvoiceAdded({
          id: result.id,
          customerName: result.customer_name,
          profileName: result.profile_name,
          frequency: result.frequency_display,
          lastInvoiceDate: result.last_invoice_date || '',
          nextInvoiceDate: result.next_invoice_date || result.start_date,
          status: result.status.toUpperCase(),
          amount: `INR ${parseFloat(result.amount || 0).toFixed(2)}`,
        });
      }
      onClose();
      window.location.reload(); // Refresh the page after successful submission
      setFormData({
        customer: '',
        profile_name: '',
        order_number: '',
        repeat_every: 'week',
        start_date: '',
        end_date: '',
        sales_person: '',
        billing_address: '',
        shipping_address: '',
        gst_treatment: '',
        status: 'active',
        uploads_files: null,
      });
      setItems([{ item: '', rate: '', qty: 1, tax: 0.00 }]);
    } catch (err) {
      console.error('Submission error:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold text-gray-800">Create Recurring Invoice</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <select
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.site_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Name *</label>
              <input
                type="text"
                name="profile_name"
                value={formData.profile_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
            <input
              type="text"
              name="order_number"
              value={formData.order_number}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Every *</label>
              <select
                name="repeat_every"
                value={formData.repeat_every}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              >
                <option value="week">Week</option>
                <option value="2week">2 Weeks</option>
                <option value="month">Month</option>
                <option value="2month">2 Months</option>
                <option value="3month">3 Months</option>
                <option value="6month">6 Months</option>
                <option value="year">Year</option>
                <option value="2year">2 Years</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale Person</label>
            <select
              name="sales_person"
              value={formData.sales_person}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Select Sale Person</option>
              {salesPersons.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
              <textarea
                name="billing_address"
                value={formData.billing_address}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows="3"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Treatment</label>
              <input
                type="text"
                name="gst_treatment"
                value={formData.gst_treatment}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <div className="grid grid-cols-5 gap-2 text-sm font-medium text-gray-700">
              <div>Item</div>
              <div>Rate</div>
              <div>Qty</div>
              <div>Tax</div>
              <div>Total</div>
            </div>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 mt-2 items-center">
                <select
                  name="item"
                  value={item.item}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Select Item</option>
                  {itemOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="rate"
                  value={item.rate}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  step="0.01"
                  min="0.01"
                  required
                />
                <input
                  type="number"
                  name="qty"
                  value={item.qty}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  min="1"
                />
                <input
                  type="number"
                  name="tax"
                  value={item.tax}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  step="0.01"
                />
                <div className="flex items-center">
                  <span className="text-sm">{calculateTotal(item)}</span>
                  {index === items.length - 1 ? (
                    <button type="button" onClick={addItem} className="ml-2 text-blue-500">+</button>
                  ) : (
                    <button type="button" onClick={() => removeItem(index)} className="ml-2 text-red-500">-</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uploads File(s) (Max File Size Allowed 1MB)</label>
            <input
              type="file"
              name="uploads_files"
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-[#243158] text-white px-6 py-2 rounded text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringInvoiceForm;