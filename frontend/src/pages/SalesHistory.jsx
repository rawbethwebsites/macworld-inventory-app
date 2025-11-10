import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useNavigate } from 'react-router-dom'

const SalesHistory = () => {
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, paid, unpaid
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSalesData()
  }, [])

  const fetchSalesData = async () => {
    try {
      setLoading(true)

      // Fetch all invoice items with invoice and product details
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select(`
          *,
          invoice:invoices (
            id,
            invoice_number,
            customer_name,
            payment_status,
            total,
            created_at
          ),
          product:products (
            id,
            name,
            image_url
          )
        `)
        .order('created_at', { ascending: false })

      if (itemsError) throw itemsError

      // Group by product to calculate totals
      const productMap = {}
      
      items?.forEach(item => {
        const productId = item.product_id
        const productName = item.product_name
        
        if (!productMap[productId]) {
          productMap[productId] = {
            product_id: productId,
            product_name: productName,
            product_image: item.product?.image_url || null,
            total_quantity_sold: 0,
            total_revenue: 0,
            total_paid_revenue: 0,
            times_sold: 0,
            times_paid: 0,
            invoices: []
          }
        }

        productMap[productId].total_quantity_sold += item.quantity
        productMap[productId].total_revenue += parseFloat(item.subtotal)
        productMap[productId].times_sold += 1
        
        if (item.invoice?.payment_status === 'paid') {
          productMap[productId].total_paid_revenue += parseFloat(item.subtotal)
          productMap[productId].times_paid += 1
        }

        productMap[productId].invoices.push({
          invoice_id: item.invoice?.id,
          invoice_number: item.invoice?.invoice_number,
          customer_name: item.invoice?.customer_name,
          payment_status: item.invoice?.payment_status,
          quantity: item.quantity,
          subtotal: item.subtotal,
          unit_price: item.unit_price,
          date: item.invoice?.created_at
        })
      })

      // Convert to array and sort by revenue
      const salesArray = Object.values(productMap).sort((a, b) => b.total_revenue - a.total_revenue)
      
      setSalesData(salesArray)
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = salesData.filter(item => {
    // Filter by payment status
    if (filter === 'paid' && item.times_paid === 0) return false
    if (filter === 'unpaid' && item.times_paid >= item.times_sold) return false
    
    // Filter by search term
    if (searchTerm && !item.product_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    return true
  })

  const viewProductDetails = (product) => {
    setSelectedProduct(product)
    setShowDetailModal(true)
  }

  const goToInvoice = (invoiceId) => {
    navigate('/invoices')
    setShowDetailModal(false)
  }

  const totalRevenue = filteredData.reduce((sum, item) => sum + item.total_revenue, 0)
  const totalPaidRevenue = filteredData.reduce((sum, item) => sum + item.total_paid_revenue, 0)
  const totalQuantitySold = filteredData.reduce((sum, item) => sum + item.total_quantity_sold, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sales History
          </h1>
          <p className="text-gray-600">
            Track product sales, revenue, and purchase history
          </p>
        </div>

        {/* Statistics */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Total Products Sold</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{filteredData.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Quantity Sold</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{totalQuantitySold}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                ₦{totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Paid Revenue</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                ₦{totalPaidRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type product name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Payment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({salesData.length})
                </button>
                <button
                  onClick={() => setFilter('paid')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'paid'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setFilter('unpaid')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'unpaid'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Has Unpaid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Detail Modal */}
        {showDetailModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedProduct.product_name}</h3>
                  <p className="text-sm text-gray-600">Sales History & Invoices</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedProduct(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {/* Product Info & Image */}
                <div className="flex items-start gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                  {selectedProduct.product_image && (
                    <img
                      src={selectedProduct.product_image}
                      alt={selectedProduct.product_name}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedProduct.product_name}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Sold</p>
                        <p className="font-semibold text-gray-900">{selectedProduct.total_quantity_sold} units</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Times Sold</p>
                        <p className="font-semibold text-gray-900">{selectedProduct.times_sold} invoices</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Revenue</p>
                        <p className="font-semibold text-green-600">₦{selectedProduct.total_revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Paid Revenue</p>
                        <p className="font-semibold text-purple-600">₦{selectedProduct.total_paid_revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice History */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Invoice History ({selectedProduct.invoices.length})
                  </h5>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedProduct.invoices
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((invoice, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => goToInvoice(invoice.invoice_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-semibold text-blue-600">
                                {invoice.invoice_number}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                invoice.payment_status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : invoice.payment_status === 'partial'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {invoice.payment_status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Customer: {invoice.customer_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(invoice.date).toLocaleDateString('en-NG', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Quantity</p>
                            <p className="text-xl font-bold text-gray-900">{invoice.quantity}</p>
                            <p className="text-sm text-gray-500 mt-1">@ ₦{invoice.unit_price.toLocaleString()}</p>
                            <p className="text-sm font-semibold text-green-600 mt-1">
                              Total: ₦{invoice.subtotal.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sales Data Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading sales data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filter !== 'all' ? 'No products found' : 'No sales yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create an invoice to start tracking sales'}
              </p>
              {!searchTerm && filter === 'all' && (
                <button
                  onClick={() => navigate('/invoices')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Invoice
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity Sold</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Times Sold</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid Revenue</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr
                      key={item.product_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{item.product_name}</div>
                            <div className="text-sm text-gray-500">ID: {item.product_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-gray-900">
                          {item.total_quantity_sold}
                        </span>
                        <p className="text-xs text-gray-500">units</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-gray-900">
                          {item.times_sold}
                        </span>
                        <p className="text-xs text-gray-500">invoices</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-green-600">
                          ₦{item.total_revenue.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-purple-600">
                          ₦{item.total_paid_revenue.toLocaleString()}
                        </div>
                        {item.total_paid_revenue < item.total_revenue && (
                          <div className="text-xs text-red-600 mt-1">
                            Pending: ₦{(item.total_revenue - item.total_paid_revenue).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.times_paid === item.times_sold ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            All Paid
                          </span>
                        ) : item.times_paid === 0 ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            All Unpaid
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Partial
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => viewProductDetails(item)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {!loading && filteredData.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">
                  Showing {filteredData.length} products • {totalQuantitySold} units sold
                </span>
              </div>
              <div className="text-blue-800 font-semibold">
                Total: ₦{totalRevenue.toLocaleString()} (Paid: ₦{totalPaidRevenue.toLocaleString()})
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesHistory

