import React, { useState } from 'react';
import { Plus, FileText, Calendar, User, FileSearch, CheckCircle2, XCircle, DollarSign, MoreVertical, Search } from 'lucide-react';

const CreditNotes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [creditNotes, setCreditNotes] = useState([]); // Empty array for "no data" state

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    DRAFT: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Credit Notes</h1>
          
          <button className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Credit Note
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search credit notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="DRAFT">Draft</option>
              </select>
              <CheckCircle2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <input
                type="date"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        {creditNotes.length > 0 ? (
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-8 bg-gray-100 p-3 font-medium text-gray-700 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                DATE
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                CREDIT NOTES
              </div>
              <div className="flex items-center">
                <FileSearch className="h-4 w-4 mr-2" />
                REFERENCES
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                CUSTOMER NAME
              </div>
              <div>INVOICE NUMBER</div>
              <div>STATUS</div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                AMOUNT
              </div>
              <div>BALANCE</div>
            </div>
            
            {/* Table Rows would go here */}
          </div>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center bg-white rounded-lg shadow p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No credit notes found</h3>
            <p className="text-gray-500 mt-1">Create your first credit note to get started</p>
            <button className="mt-4 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Create Credit Note
            </button>
          </div>
        )}

        {/* Mobile Cards */}
        {creditNotes.length > 0 ? (
          <div className="md:hidden space-y-4">
            {/* Credit note cards would go here */}
          </div>
        ) : (
          <div className="md:hidden flex flex-col items-center justify-center bg-white rounded-lg shadow p-8 text-center">
            <FileText className="h-10 w-10 text-gray-400 mb-3" />
            <h3 className="text-md font-medium text-gray-900">No credit notes</h3>
            <p className="text-gray-500 mt-1 text-sm">Get started by creating a new credit note</p>
          </div>
        )}

        {/* Empty state for mobile */}
        {creditNotes.length === 0 && (
          <div className="fixed bottom-6 right-6 md:hidden">
            <button className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition duration-200">
              <Plus className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditNotes;