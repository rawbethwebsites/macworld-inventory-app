import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import jsPDF from 'jspdf'

const Invoices = () => {
  const [invoices, setInvoices] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [notification, setNotification] = useState(null)
  const [editingPayment, setEditingPayment] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amountPaid: 0,
    paymentMethod: '',
    paymentStatus: 'unpaid'
  })
  
  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    items: [],
    discount: 0,
    tax: 0,
    notes: '',
    paymentMethod: '',
    amountPaid: 0
  })
  
  const [productSearch, setProductSearch] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchInvoices()
    fetchProducts()
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
      showNotification('Failed to load invoices: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('quantity', 0)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleCustomerChange = (e) => {
    const customerId = e.target.value
    const customer = customers.find(c => c.id === parseInt(customerId))
    
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId,
        customerName: customer.name,
        customerEmail: customer.email || '',
        customerPhone: customer.phone || '',
        customerAddress: customer.address || ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: ''
      }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const addProduct = (product) => {
    const existingItem = formData.items.find(item => item.product_id === product.id)
    
    if (existingItem) {
      // Increase quantity
      if (existingItem.quantity < product.quantity) {
        setFormData(prev => ({
          ...prev,
          items: prev.items.map(item =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price }
              : item
          )
        }))
      } else {
        showNotification('Not enough stock available', 'error')
      }
    } else {
      // Add new item
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          product_id: product.id,
          product_name: product.name,
          product_sku: product.id.toString(),
          quantity: 1,
          unit_price: product.price,
          discount: 0,
          subtotal: product.price,
          max_quantity: product.quantity
        }]
      }))
    }
    setProductSearch('')
  }

  const updateItemQuantity = (index, quantity) => {
    const item = formData.items[index]
    if (quantity > item.max_quantity) {
      showNotification('Not enough stock available', 'error')
      return
    }
    if (quantity < 1) return

    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? { ...item, quantity, subtotal: quantity * item.unit_price - item.discount }
          : item
      )
    }))
  }

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0)
    const discount = parseFloat(formData.discount) || 0
    const tax = parseFloat(formData.tax) || 0
    const total = subtotal - discount + tax
    return { subtotal, total }
  }

  const generateInvoiceNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `INV-${year}-${month}-${random}`
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required'
    if (formData.items.length === 0) newErrors.items = 'Add at least one product'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setSubmitting(true)
      const { subtotal, total } = calculateTotals()
      const amountPaid = parseFloat(formData.amountPaid) || 0
      
      let paymentStatus = 'unpaid'
      if (amountPaid >= total) paymentStatus = 'paid'
      else if (amountPaid > 0) paymentStatus = 'partial'

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: generateInvoiceNumber(),
          customer_id: formData.customerId || null,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          customer_address: formData.customerAddress,
          subtotal,
          discount: parseFloat(formData.discount) || 0,
          tax: parseFloat(formData.tax) || 0,
          total,
          amount_paid: amountPaid,
          payment_status: paymentStatus,
          payment_method: formData.paymentMethod || null,
          notes: formData.notes || null,
          status: paymentStatus === 'paid' ? 'paid' : 'sent'
        }])
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Add invoice items and deduct stock
      for (const item of formData.items) {
        // Insert invoice item
        const { error: itemError } = await supabase
          .from('invoice_items')
          .insert([{
            invoice_id: invoice.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_sku: item.product_sku,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount,
            subtotal: item.subtotal
          }])

        if (itemError) throw itemError

        // Deduct stock
        const { error: stockError } = await supabase.rpc('decrement_product_quantity', {
          product_id: item.product_id,
          decrement_by: item.quantity
        })

        // If RPC doesn't exist, update directly
        if (stockError) {
          const product = products.find(p => p.id === item.product_id)
          await supabase
            .from('products')
            .update({ quantity: product.quantity - item.quantity })
            .eq('id', item.product_id)
        }
      }

      showNotification('Invoice created successfully!', 'success')
      resetForm()
      setShowForm(false)
      fetchInvoices()
      fetchProducts()
    } catch (error) {
      console.error('Error creating invoice:', error)
      showNotification('Failed to create invoice: ' + error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      items: [],
      discount: 0,
      tax: 0,
      notes: '',
      paymentMethod: '',
      amountPaid: 0
    })
    setErrors({})
  }

  const viewInvoiceDetail = (invoice) => {
    setSelectedInvoice(invoice)
    setPaymentData({
      amountPaid: invoice.amount_paid || 0,
      paymentMethod: invoice.payment_method || '',
      paymentStatus: invoice.payment_status || 'unpaid'
    })
    setEditingPayment(false)
    setShowDetailModal(true)
  }

  const handlePaymentDataChange = (e) => {
    const { name, value } = e.target
    setPaymentData(prev => {
      const newData = { ...prev, [name]: value }
      
      // Auto-calculate payment status
      if (name === 'amountPaid') {
        const amountPaid = parseFloat(value) || 0
        const total = selectedInvoice.total
        if (amountPaid >= total) {
          newData.paymentStatus = 'paid'
        } else if (amountPaid > 0) {
          newData.paymentStatus = 'partial'
        } else {
          newData.paymentStatus = 'unpaid'
        }
      }
      
      return newData
    })
  }

  const updateInvoicePayment = async () => {
    try {
      setSubmitting(true)
      
      const amountPaid = parseFloat(paymentData.amountPaid) || 0
      const total = selectedInvoice.total
      
      // Calculate payment status
      let paymentStatus = 'unpaid'
      if (amountPaid >= total) paymentStatus = 'paid'
      else if (amountPaid > 0) paymentStatus = 'partial'
      
      // Update invoice status
      let status = selectedInvoice.status
      if (paymentStatus === 'paid' && status === 'draft') {
        status = 'paid'
      } else if (paymentStatus === 'paid' && status === 'sent') {
        status = 'paid'
      }

      const { error } = await supabase
        .from('invoices')
        .update({
          amount_paid: amountPaid,
          payment_method: paymentData.paymentMethod || null,
          payment_status: paymentStatus,
          status: status
        })
        .eq('id', selectedInvoice.id)

      if (error) throw error

      showNotification('Payment updated successfully!', 'success')
      setEditingPayment(false)
      
      // Update local state
      setSelectedInvoice({
        ...selectedInvoice,
        amount_paid: amountPaid,
        payment_method: paymentData.paymentMethod,
        payment_status: paymentStatus,
        status: status
      })
      
      // Refresh invoices list
      fetchInvoices()
    } catch (error) {
      console.error('Error updating payment:', error)
      showNotification('Failed to update payment: ' + error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const generatePDF = (invoice) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('MACWORLD', 105, 20, { align: 'center' })
    doc.setFontSize(10)
    doc.text('Shop B18-a, Emab Plaza. Wuse ii, Abuja', 105, 27, { align: 'center' })
    doc.text('Phone: +234 816 836 6739', 105, 32, { align: 'center' })
    
    // Invoice details
    doc.setFontSize(16)
    doc.text('INVOICE', 105, 45, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text(`Invoice #: ${invoice.invoice_number}`, 20, 55)
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 60)
    doc.text(`Status: ${invoice.payment_status.toUpperCase()}`, 20, 65)
    
    // Customer details
    doc.text('Bill To:', 20, 75)
    doc.text(invoice.customer_name, 20, 80)
    if (invoice.customer_phone) doc.text(invoice.customer_phone, 20, 85)
    if (invoice.customer_address) doc.text(invoice.customer_address, 20, 90)
    
    // Items table
    let yPos = 105
    doc.setFillColor(59, 130, 246)
    doc.rect(20, yPos, 170, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.text('Item', 25, yPos + 5)
    doc.text('Qty', 120, yPos + 5)
    doc.text('Price', 140, yPos + 5)
    doc.text('Total', 170, yPos + 5)
    
    doc.setTextColor(0, 0, 0)
    yPos += 12
    
    invoice.invoice_items.forEach(item => {
      doc.text(item.product_name, 25, yPos)
      doc.text(item.quantity.toString(), 120, yPos)
      doc.text(`₦${item.unit_price.toLocaleString()}`, 140, yPos)
      doc.text(`₦${item.subtotal.toLocaleString()}`, 170, yPos)
      yPos += 7
    })
    
    // Totals
    yPos += 10
    doc.text(`Subtotal: ₦${invoice.subtotal.toLocaleString()}`, 140, yPos)
    yPos += 7
    if (invoice.discount > 0) {
      doc.text(`Discount: -₦${invoice.discount.toLocaleString()}`, 140, yPos)
      yPos += 7
    }
    if (invoice.tax > 0) {
      doc.text(`Tax: ₦${invoice.tax.toLocaleString()}`, 140, yPos)
      yPos += 7
    }
    doc.setFontSize(12)
    doc.text(`Total: ₦${invoice.total.toLocaleString()}`, 140, yPos)
    yPos += 7
    doc.setFontSize(10)
    doc.text(`Paid: ₦${invoice.amount_paid.toLocaleString()}`, 140, yPos)
    yPos += 7
    const balance = invoice.total - invoice.amount_paid
    if (balance > 0) {
      doc.setTextColor(220, 38, 38)
      doc.text(`Balance: ₦${balance.toLocaleString()}`, 140, yPos)
    }
    
    // Footer
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.text('Thank you for your business!', 105, 280, { align: 'center' })
    
    doc.save(`invoice-${invoice.invoice_number}.pdf`)
  }

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  const { subtotal, total } = calculateTotals()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Invoice Management
          </h1>
          <p className="text-gray-600">
            Create and manage invoices with automatic stock deduction
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

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Total Invoices</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{invoices.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Paid</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {invoices.filter(i => i.payment_status === 'paid').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Unpaid</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {invoices.filter(i => i.payment_status === 'unpaid').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                ₦{invoices.reduce((sum, i) => sum + parseFloat(i.total), 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Create Invoice Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Invoices</h2>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Invoice
          </button>
        </div>

        {/* Create Invoice Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-900">Create New Invoice</h3>
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
                {/* Customer Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Customer (Optional)
                      </label>
                      <select
                        value={formData.customerId}
                        onChange={handleCustomerChange}
                        className="input-base"
                      >
                        <option value="">New Customer</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className={`input-base ${errors.customerName ? 'border-red-500' : ''}`}
                        placeholder="Enter customer name"
                      />
                      {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        className="input-base"
                        placeholder="customer@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        className="input-base"
                        placeholder="+234 816 836 6739"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="customerAddress"
                        value={formData.customerAddress}
                        onChange={handleInputChange}
                        className="input-base"
                        placeholder="Customer address"
                      />
                    </div>
                  </div>
                </div>

                {/* Products Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Products</h4>
                  
                  {/* Product Search */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Type to search..."
                      className="input-base"
                    />
                    {productSearch && filteredProducts.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg">
                        {filteredProducts.slice(0, 5).map(product => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => addProduct(product)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex justify-between"
                          >
                            <span>{product.name}</span>
                            <span className="text-gray-500">₦{product.price.toLocaleString()} | Stock: {product.quantity}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Items */}
                  {formData.items.length > 0 ? (
                    <div className="space-y-2">
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-500">₦{item.unit_price.toLocaleString()} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(index, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(index, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                          <div className="w-32 text-right">
                            <p className="font-semibold text-gray-900">₦{item.subtotal.toLocaleString()}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No products added yet. Search and add products above.</p>
                  )}
                  {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items}</p>}
                </div>

                {/* Totals & Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="input-base"
                      placeholder="Additional notes..."
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Discount:</span>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-32 px-2 py-1 border rounded"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Tax:</span>
                      <input
                        type="number"
                        name="tax"
                        value={formData.tax}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-32 px-2 py-1 border rounded"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-primary-600">₦{total.toLocaleString()}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className="input-base"
                      >
                        <option value="">Select method</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="POS">POS</option>
                        <option value="Mobile Money">Mobile Money</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                      <input
                        type="number"
                        name="amountPaid"
                        value={formData.amountPaid}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="input-base"
                        placeholder="0.00"
                      />
                    </div>
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
                    disabled={submitting || formData.items.length === 0}
                  >
                    {submitting ? 'Creating...' : 'Create Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice Detail Modal */}
        {showDetailModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedInvoice(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {/* Invoice Header */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">{selectedInvoice.invoice_number}</h4>
                      <p className="text-gray-600 mt-1">{new Date(selectedInvoice.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold ${
                      selectedInvoice.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : selectedInvoice.payment_status === 'partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedInvoice.payment_status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-900 mb-2">Customer Information</h5>
                  <p className="text-gray-900">{selectedInvoice.customer_name}</p>
                  {selectedInvoice.customer_email && <p className="text-gray-600">{selectedInvoice.customer_email}</p>}
                  {selectedInvoice.customer_phone && <p className="text-gray-600">{selectedInvoice.customer_phone}</p>}
                  {selectedInvoice.customer_address && <p className="text-gray-600">{selectedInvoice.customer_address}</p>}
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-900 mb-3">Items</h5>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Qty</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Price</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.invoice_items.map(item => (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 py-3 text-gray-900">{item.product_name}</td>
                          <td className="px-4 py-3 text-right text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-900">₦{item.unit_price.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">₦{item.subtotal.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold">₦{selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Discount:</span>
                      <span className="font-semibold text-red-600">-₦{selectedInvoice.discount.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedInvoice.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Tax:</span>
                      <span className="font-semibold">₦{selectedInvoice.tax.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary-600">₦{selectedInvoice.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Information - Editable */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-semibold text-gray-900">Payment Information</h5>
                    {!editingPayment && (
                      <button
                        onClick={() => setEditingPayment(true)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Payment
                      </button>
                    )}
                  </div>

                  {editingPayment ? (
                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount Paid (₦)
                        </label>
                        <input
                          type="number"
                          name="amountPaid"
                          value={paymentData.amountPaid}
                          onChange={handlePaymentDataChange}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Method
                        </label>
                        <select
                          name="paymentMethod"
                          value={paymentData.paymentMethod}
                          onChange={handlePaymentDataChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select method</option>
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="POS">POS</option>
                          <option value="Mobile Money">Mobile Money</option>
                          <option value="Credit Card">Credit Card</option>
                        </select>
                      </div>
                      <div className="p-3 bg-white rounded border">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">New Payment Status:</span>
                          <span className={`font-semibold ${
                            paymentData.paymentStatus === 'paid' ? 'text-green-600' :
                            paymentData.paymentStatus === 'partial' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {paymentData.paymentStatus.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Balance Due:</span>
                          <span className="font-semibold text-red-600">
                            ₦{(selectedInvoice.total - (parseFloat(paymentData.amountPaid) || 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={updateInvoicePayment}
                          disabled={submitting}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
                        >
                          {submitting ? 'Saving...' : 'Save Payment'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingPayment(false)
                            setPaymentData({
                              amountPaid: selectedInvoice.amount_paid || 0,
                              paymentMethod: selectedInvoice.payment_method || '',
                              paymentStatus: selectedInvoice.payment_status || 'unpaid'
                            })
                          }}
                          disabled={submitting}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Amount Paid:</span>
                        <span className="font-semibold text-green-600">
                          ₦{selectedInvoice.amount_paid.toLocaleString()}
                        </span>
                      </div>
                      {selectedInvoice.payment_method && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Payment Method:</span>
                          <span className="font-medium text-gray-900">{selectedInvoice.payment_method}</span>
                        </div>
                      )}
                      {selectedInvoice.total > selectedInvoice.amount_paid && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Balance Due:</span>
                          <span className="font-semibold text-red-600">
                            ₦{(selectedInvoice.total - selectedInvoice.amount_paid).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-6 border-t mt-6">
                  <button
                    onClick={() => generatePDF(selectedInvoice)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoices List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-500 mb-4">Create your first invoice to get started</p>
              <button onClick={() => setShowForm(true)} className="btn-primary">
                Create Invoice
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => viewInvoiceDetail(invoice)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-primary-600">{invoice.invoice_number}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{invoice.customer_name}</div>
                          {invoice.customer_phone && <div className="text-sm text-gray-500">{invoice.customer_phone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">₦{invoice.total.toLocaleString()}</div>
                        {invoice.amount_paid > 0 && (
                          <div className="text-sm text-green-600">Paid: ₦{invoice.amount_paid.toLocaleString()}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.payment_status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.payment_status === 'partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            generatePDF(invoice)
                          }}
                          className="text-blue-600 hover:text-blue-900 p-2"
                          title="Download PDF"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                        </button>
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

export default Invoices

