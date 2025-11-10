import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [notification, setNotification] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState('all') // all, active, inactive
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Abuja',
    state: 'FCT',
    country: 'Nigeria',
    notes: '',
    is_active: true
  })
  
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      // Fetch all customers
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Calculate total purchases for each customer by fetching their invoices
      const customersWithStats = await Promise.all(
        (data || []).map(async (customer) => {
          const { data: invoices } = await supabase
            .from('invoices')
            .select('total, amount_paid')
            .eq('customer_id', customer.id)
          
          const totalPurchases = invoices?.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0) || 0
          const totalPaid = invoices?.reduce((sum, inv) => sum + parseFloat(inv.amount_paid || 0), 0) || 0
          const invoiceCount = invoices?.length || 0
          
          return {
            ...customer,
            total_purchases: totalPurchases,
            total_paid: totalPaid,
            invoice_count: invoiceCount
          }
        })
      )
      
      setCustomers(customersWithStats)
    } catch (error) {
      console.error('Error fetching customers:', error)
      showNotification('Failed to load customers: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Customer name is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: 'Abuja',
      state: 'FCT',
      country: 'Nigeria',
      notes: '',
      is_active: true
    })
    setErrors({})
    setEditingCustomer(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setSubmitting(true)
      
      if (editingCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            notes: formData.notes || null,
            is_active: formData.is_active
          })
          .eq('id', editingCustomer.id)

        if (error) throw error
        showNotification('Customer updated successfully!', 'success')
      } else {
        // Create new customer
        const { error } = await supabase
          .from('customers')
          .insert([{
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            notes: formData.notes || null,
            is_active: formData.is_active
          }])

        if (error) throw error
        showNotification('Customer created successfully!', 'success')
      }

      resetForm()
      setShowForm(false)
      fetchCustomers()
    } catch (error) {
      console.error('Error saving customer:', error)
      showNotification('Failed to save customer: ' + error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || 'Abuja',
      state: customer.state || 'FCT',
      country: customer.country || 'Nigeria',
      notes: customer.notes || '',
      is_active: customer.is_active !== undefined ? customer.is_active : true
    })
    setShowForm(true)
  }

  const handleDelete = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete ${customer.name}? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id)

      if (error) throw error
      showNotification('Customer deleted successfully!', 'success')
      fetchCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      showNotification('Failed to delete customer: ' + error.message, 'error')
    }
  }

  const viewCustomerDetail = (customer) => {
    setSelectedCustomer(customer)
    setShowDetailModal(true)
  }

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
  }

  const filteredCustomers = customers.filter(customer => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchLower) ||
        (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
        (customer.phone && customer.phone.includes(searchTerm))
      
      if (!matchesSearch) return false
    }
    
    // Active filter
    if (filterActive === 'active' && !customer.is_active) return false
    if (filterActive === 'inactive' && customer.is_active) return false
    
    return true
  })

  const activeCustomers = customers.filter(c => c.is_active).length
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_purchases || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Management
          </h1>
          <p className="text-gray-600">
            Manage your customer database and track purchase history
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              notification.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : notification.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
          </div>
        )}

        {/* Statistics */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{customers.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Active Customers</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{activeCustomers}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                ₦{totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Inactive</p>
              <p className="text-3xl font-bold text-gray-400 mt-1">
                {customers.length - activeCustomers}
              </p>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers by name, email, or phone..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Active Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterActive === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterActive === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterActive === 'inactive'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Add Customer Button */}
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </button>
        </div>

        {/* Customer Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`input-base ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter customer name"
                      required
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`input-base ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="customer@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-base"
                      placeholder="+234 816 836 6739"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="input-base"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input-base"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="input-base"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="input-base"
                      placeholder="Country"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="input-base"
                      placeholder="Additional notes about this customer..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Active Customer</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Inactive customers won't appear in invoice customer dropdown
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      resetForm()
                    }}
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Create Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Customer Detail Modal */}
        {showDetailModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedCustomer(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {/* Customer Header */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h4>
                      <p className="text-gray-600 mt-1">
                        Customer since {new Date(selectedCustomer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold ${
                      selectedCustomer.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCustomer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-900 mb-3">Contact Information</h5>
                  <div className="space-y-2">
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-900">{selectedCustomer.email}</span>
                      </div>
                    )}
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-900">{selectedCustomer.phone}</span>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-900">
                          {selectedCustomer.address}
                          {selectedCustomer.city && `, ${selectedCustomer.city}`}
                          {selectedCustomer.state && `, ${selectedCustomer.state}`}
                          {selectedCustomer.country && `, ${selectedCustomer.country}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-900 mb-3">Purchase Statistics</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Invoices</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedCustomer.invoice_count || 0}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Purchases</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₦{(selectedCustomer.total_purchases || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Paid</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ₦{(selectedCustomer.total_paid || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedCustomer.notes && (
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-2">Notes</h5>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedCustomer.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-6 border-t">
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      handleEdit(selectedCustomer)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterActive !== 'all' ? 'No customers found' : 'No customers yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterActive !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first customer to get started'}
              </p>
              {!searchTerm && filterActive === 'all' && (
                <button
                  onClick={() => {
                    resetForm()
                    setShowForm(true)
                  }}
                  className="btn-primary"
                >
                  Add Customer
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Invoices</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Purchases</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => viewCustomerDetail(customer)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        {customer.email && (
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.phone && (
                          <div className="text-sm text-gray-900">{customer.phone}</div>
                        )}
                        {!customer.phone && (
                          <div className="text-sm text-gray-400">No phone</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.city || 'N/A'}
                          {customer.state && `, ${customer.state}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {customer.invoice_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ₦{(customer.total_purchases || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(customer)
                            }}
                            className="text-blue-600 hover:text-blue-900 p-2"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(customer)
                            }}
                            className="text-red-600 hover:text-red-900 p-2"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Customers

