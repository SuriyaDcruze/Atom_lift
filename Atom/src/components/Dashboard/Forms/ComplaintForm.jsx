import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { X, Edit, Trash2 } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const ComplaintForm = ({ isEdit, initialData, onClose, onSubmitSuccess, onSubmitError, apiBaseUrl, dropdownOptions }) => {
  const [formData, setFormData] = useState({
    reference: '',
    type: 'Service Request',
    date: new Date().toISOString().split('T')[0],
    customer: '',
    contactPersonName: '',
    contactPersonMobile: '',
    blockWing: '',
    assignTo: '',
    priority: 'Medium',
    subject: '',
    message: '',
    customerSignature: '',
    technicianRemark: '',
    technicianSignature: '',
    solution: '',
  });

  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeModal, setEmployeeModal] = useState({ isOpen: false, value: '', isEditing: false, editId: null });
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState({ customers: true, employees: true });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('Please log in to continue.');
          window.location.href = '/login';
          return;
        }

        // Fetch customers
        const customerResponse = await axios.get(`${apiBaseUrl}/sales/customer-list/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomers(customerResponse.data);
        setOptionsLoading((prev) => ({ ...prev, customers: false }));

        // Fetch employees
        const employeeResponse = await axios.get(`${apiBaseUrl}/auth/employees/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(employeeResponse.data);
        setOptionsLoading((prev) => ({ ...prev, employees: false }));

        // Fetch complaints to generate reference ID (only for create mode)
        if (!isEdit) {
          const complaintResponse = await axios.get(`${apiBaseUrl}/auth/complaint-list/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const complaints = complaintResponse.data || [];
          let newRefId = 'CMP1001';
          if (complaints.length > 0) {
            const lastComplaint = complaints[complaints.length - 1];
            const lastId = parseInt(lastComplaint.reference.replace('CMP', '')) || 1000;
            newRefId = `CMP${String(lastId + 1)}`;
          }
          setFormData((prev) => ({
            ...prev,
            reference: newRefId,
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data.');
        setOptionsLoading((prev) => ({ ...prev, customers: false, employees: false }));
      }
    };

    fetchData();
  }, [isEdit]);

  useEffect(() => {
    if (!optionsLoading.customers && !optionsLoading.employees && isEdit && initialData) {
      const selectedCustomer = customers.find(c => c.site_name === initialData.customer) || {};
      const selectedEmployee = employees.find(e => e.name === initialData.assign_to?.name) || {};

      setFormData({
        reference: initialData.reference || '',
        type: initialData.type || 'Service Request',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        customer: selectedCustomer.id || '',
        contactPersonName: initialData.contact_person_name || selectedCustomer.contact_person_name || '',
        contactPersonMobile: initialData.contact_person_mobile || selectedCustomer.phone || '',
        blockWing: initialData.block_wing || selectedCustomer.site_address || '',
        assignTo: selectedEmployee.id || '',
        priority: initialData.priority || 'Medium',
        subject: initialData.subject || '',
        message: initialData.message || '',
        customerSignature: initialData.customer_signature || '',
        technicianRemark: initialData.technician_remark || '',
        technicianSignature: initialData.technician_signature || '',
        solution: initialData.solution || '',
      });
    }
  }, [isEdit, initialData, customers, employees, optionsLoading.customers, optionsLoading.employees]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (e) => {
    const value = e.target.value;
    const selected = customers.find(c => c.id === parseInt(value));
    setFormData(prev => ({
      ...prev,
      customer: value,
      contactPersonName: selected ? selected.contact_person_name : '',
      contactPersonMobile: selected ? selected.phone : '',
      blockWing: selected ? selected.site_address : '',
    }));
  };

  const openEmployeeModal = (isEditing = false, editId = null, editValue = '') => {
    setEmployeeModal({ isOpen: true, value: editValue, isEditing, editId });
  };

  const closeEmployeeModal = () => {
    setEmployeeModal({ isOpen: false, value: '', isEditing: false, editId: null });
  };

  const handleAddEmployee = async () => {
    const value = employeeModal.value.trim();
    if (!value) {
      toast.error('Please enter an employee name.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const isEditing = employeeModal.isEditing;
      const editId = employeeModal.editId;

      let response;
      if (isEditing) {
        response = await axios.put(`${apiBaseUrl}/auth/edit-employee/${editId}/`, { name: value }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Employee updated successfully.');
      } else {
        response = await axios.post(`${apiBaseUrl}/auth/add-employee/`, { name: value }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Employee added successfully.');
        setFormData(prev => ({ ...prev, assignTo: response.data.id }));
      }

      // Refresh employees list
      const employeesResponse = await axios.get(`${apiBaseUrl}/auth/employees/`, { headers: { Authorization: `Bearer ${token}` } });
      setEmployees(employeesResponse.data);
      closeEmployeeModal();
    } catch (error) {
      console.error('Error handling employee:', error);
      toast.error(error.response?.data?.error || `Failed to ${employeeModal.isEditing ? 'update' : 'add'} employee.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${apiBaseUrl}/auth/delete-employee/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Employee deleted successfully.');

      // Refresh employees list
      const employeesResponse = await axios.get(`${apiBaseUrl}/auth/employees/`, { headers: { Authorization: `Bearer ${token}` } });
      setEmployees(employeesResponse.data);
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(error.response?.data?.error || 'Failed to delete employee.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const url = isEdit
        ? `${apiBaseUrl}/auth/edit-complaint/${initialData.id}/`
        : `${apiBaseUrl}/auth/add-complaint/`;
      const method = isEdit ? 'put' : 'post';

      await axios({
        method,
        url,
        headers: { Authorization: `Bearer ${token}` },
        data: {
          ...formData,
          customer: formData.customer || null,
          assign_to: formData.assignTo || null,
        },
      });

      onSubmitSuccess(isEdit ? 'Complaint updated successfully!' : 'Complaint created successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      onSubmitError(error.response?.data?.error || (isEdit ? 'Failed to update complaint' : 'Failed to create complaint'));
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2D3A6B] to-[#243158] p-6">
          <h2 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Complaint' : 'Create Complaint'}
          </h2>
          <p className="text-white">
            Fill in all required fields (<span className="text-red-300">*</span>)
          </p>
        </div>
        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Complaint Details</h3>
                {/* Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    REFERENCE <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    readOnly
                  />
                </div>
                {/* Complaint Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    COMPLAINT TYPE <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="Site Inspection">Site Inspection</option>
                    <option value="Spec Checking">Spec Checking</option>
                    <option value="Break Down Calls">Break Down Calls</option>
                    <option value="Service Request">Service Request</option>
                    <option value="New Installation">New Installation</option>
                  </select>
                </div>
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DATE <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                {/* Customer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CUSTOMER
                  </label>
                  <select
                    name="customer"
                    value={formData.customer}
                    onChange={handleCustomerChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.site_name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Contact Person Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CONTACT PERSON NAME
                  </label>
                  <input
                    type="text"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                {/* Contact Person Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CONTACT PERSON MOBILE
                  </label>
                  <input
                    type="text"
                    name="contactPersonMobile"
                    value={formData.contactPersonMobile}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                {/* Block/Wing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BLOCK/WING
                  </label>
                  <input
                    type="text"
                    name="blockWing"
                    value={formData.blockWing}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              {/* Right Column */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Assignment & Details</h3>
                {/* Assign To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ASSIGN TO
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      name="assignTo"
                      value={formData.assignTo}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openEmployeeModal()}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                    >
                      +
                    </button>
                  </div>
                </div>
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PRIORITY
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SUBJECT
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MESSAGE
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows="3"
                    placeholder="Additional notes..."
                  />
                </div>
                {/* Customer Signature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CUSTOMER SIGNATURE
                  </label>
                  <textarea
                    name="customerSignature"
                    value={formData.customerSignature}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows="2"
                    placeholder="Additional notes..."
                  />
                </div>
                {/* Technician Remark */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TECHNICIAN REMARK
                  </label>
                  <textarea
                    name="technicianRemark"
                    value={formData.technicianRemark}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows="2"
                    placeholder="Additional notes..."
                  />
                </div>
                {/* Technician Signature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TECHNICIAN SIGNATURE
                  </label>
                  <textarea
                    name="technicianSignature"
                    value={formData.technicianSignature}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows="2"
                    placeholder="Additional notes..."
                  />
                </div>
                {/* Solution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SOLUTION
                  </label>
                  <textarea
                    name="solution"
                    value={formData.solution}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows="2"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-[#2D3A6B] to-[#243158] rounded-lg text-white font-medium hover:from-[#213066] hover:to-[#182755] transition-all duration-200 shadow-md"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Complaint' : 'Create Complaint'}
            </button>
          </div>
        </form>
      </div>

      {employeeModal.isOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {employeeModal.isEditing ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <input
              type="text"
              value={employeeModal.value}
              onChange={(e) => setEmployeeModal(prev => ({ ...prev, value: e.target.value }))}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 mb-4"
              placeholder="Enter employee name"
            />
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Employees</h4>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length > 0 ? (
                      employees.map((option) => (
                        <tr key={option.id} className="border-t">
                          <td className="p-2">{option.name}</td>
                          <td className="p-2 text-right">
                            <button
                              onClick={() => openEmployeeModal(true, option.id, option.name)}
                              className="text-blue-500 hover:text-blue-700 mr-2"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(option.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="p-2 text-center text-gray-500">
                          No employees found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeEmployeeModal}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                disabled={!employeeModal.value.trim() || loading}
                className={`px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-medium transition-all duration-200 ${
                  !employeeModal.value.trim() || loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-blue-700'
                }`}
              >
                {loading ? 'Saving...' : employeeModal.isEditing ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintForm;