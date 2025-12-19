import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [parentCategories, setParentCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [notification, setNotification] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [restockAmount, setRestockAmount] = useState('')
  const [restocking, setRestocking] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    parentCategoryId: '',
    categoryId: '',
    image: null,
    imagePreview: null
  })
  
  const [errors, setErrors] = useState({})

  // Fetch categories and products on mount
  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showDetailModal || showForm) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showDetailModal, showForm])

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      setCategories(data || [])
      // Filter parent categories (no parent_id)
      setParentCategories(data.filter(cat => !cat.parent_id))
    } catch (error) {
      console.error('Error fetching categories:', error)
      showNotification('Failed to load categories: ' + error.message, 'warning')
    }
  }

  // Fetch products with category info
  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      // Fetch products with their direct category
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*, category:categories(id, name, parent_id)')
        .order('created_at', { ascending: false })

      if (productsError) throw productsError

      // If products have categories, fetch parent categories
      if (productsData && productsData.length > 0) {
        // Get unique parent_ids that exist
        const parentIds = [...new Set(
          productsData
            .filter(p => p.category?.parent_id)
            .map(p => p.category.parent_id)
        )]

        if (parentIds.length > 0) {
          // Fetch parent categories
          const { data: parentCategoriesData } = await supabase
            .from('categories')
            .select('id, name')
            .in('id', parentIds)

          // Create a map for quick lookup
          const parentMap = {}
          if (parentCategoriesData) {
            parentCategoriesData.forEach(parent => {
              parentMap[parent.id] = parent
            })
          }

          // Add parent data to products
          productsData.forEach(product => {
            if (product.category?.parent_id && parentMap[product.category.parent_id]) {
              product.category.parent = parentMap[product.category.parent_id]
            }
          })
        }
      }

      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      showNotification('Failed to load products: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle parent category change
  const handleParentCategoryChange = (e) => {
    const parentId = e.target.value
    setFormData(prev => ({
      ...prev,
      parentCategoryId: parentId,
      categoryId: '' // Reset subcategory when parent changes
    }))

    // Load subcategories for selected parent
    if (parentId) {
      const subs = categories.filter(cat => cat.parent_id === parseInt(parentId))
      setSubcategories(subs)
    } else {
      setSubcategories([])
    }

    if (errors.categoryId || errors.parentCategoryId) {
      setErrors(prev => ({ ...prev, categoryId: '', parentCategoryId: '' }))
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    
    if (!file) {
      setFormData(prev => ({ ...prev, image: null, imagePreview: null }))
      return
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file (JPG, PNG, WEBP, GIF)' }))
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }))
      return
    }

    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }))
    }

    const previewUrl = URL.createObjectURL(file)
    setFormData(prev => ({ ...prev, image: file, imagePreview: previewUrl }))
  }

  // Upload image to Supabase Storage
  const uploadImage = async (file) => {
    try {
      setUploadingImage(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    } finally {
      setUploadingImage(false)
    }
  }

  // Validate form data
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.quantity || parseInt(formData.quantity) < 0) newErrors.quantity = 'Quantity must be 0 or greater'
    if (!formData.categoryId) newErrors.categoryId = 'Please select a category'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setSubmitting(true)
      let imageUrl = null
      
      if (formData.image) {
        try {
          imageUrl = await uploadImage(formData.image)
          showNotification('Image uploaded successfully!', 'info')
        } catch (error) {
          showNotification('Image upload failed, but product will be created without image', 'warning')
        }
      }

      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name.trim(),
          quantity: parseInt(formData.quantity),
          category_id: parseInt(formData.categoryId),
          image_url: imageUrl
        }])
        .select()

      if (error) throw error

      showNotification('Product added successfully!', 'success')
      
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview)
      }
      
      setFormData({
        name: '',
        quantity: '',
        parentCategoryId: '',
        categoryId: '',
        image: null,
        imagePreview: null
      })
      setSubcategories([])
      setShowForm(false)
      fetchProducts()
    } catch (error) {
      console.error('Error adding product:', error)
      showNotification('Failed to add product: ' + error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
  }

  // Delete product
  const handleDelete = async (product) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase.from('products').delete().eq('id', product.id)
      if (error) throw error

      if (product.image_url) {
        try {
          const urlParts = product.image_url.split('/product-images/')
          if (urlParts.length > 1) {
            const filePath = `products/${urlParts[1]}`
            await supabase.storage.from('product-images').remove([filePath])
          }
        } catch (imgError) {
          console.error('Error deleting image:', imgError)
        }
      }

      showNotification('Product deleted successfully!', 'success')
      setShowDetailModal(false)
      setSelectedProduct(null)
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      showNotification('Failed to delete product: ' + error.message, 'error')
    }
  }

  // Remove image preview
  const removeImagePreview = () => {
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview)
    }
    setFormData(prev => ({ ...prev, image: null, imagePreview: null }))
    setErrors(prev => ({ ...prev, image: '' }))
  }

  // Open product detail modal
  const openProductDetail = (product) => {
    setSelectedProduct(product)
    setShowDetailModal(true)
    setRestockAmount('')
  }

  // Get category display text
  const getCategoryText = (product) => {
    if (!product.category) return 'Uncategorized'
    const subcategory = product.category.name
    const parent = product.category.parent?.name
    return parent ? `${parent} → ${subcategory}` : subcategory
  }

  const handleRestockSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return

    const amount = parseInt(restockAmount, 10)
    if (Number.isNaN(amount) || amount <= 0) {
      showNotification('Enter a quantity greater than 0', 'error')
      return
    }

    try {
      setRestocking(true)
      const { data, error } = await supabase
        .from('products')
        .update({ quantity: (selectedProduct.quantity || 0) + amount })
        .eq('id', selectedProduct.id)
        .select('id, quantity')
        .single()

      if (error) throw error

      setSelectedProduct(prev => prev ? { ...prev, quantity: data.quantity } : prev)
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, quantity: data.quantity } : p))
      setRestockAmount('')
      showNotification(`Added ${amount} unit${amount === 1 ? '' : 's'} to stock. New quantity: ${data.quantity}`, 'success')
    } catch (error) {
      console.error('Error restocking product:', error)
      showNotification('Failed to update stock: ' + error.message, 'error')
    } finally {
      setRestocking(false)
    }
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
        ))}
      </div>
    </div>
  )

  const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0)
  const lowStockCount = products.filter((p) => {
    const threshold = typeof p.low_stock_threshold === 'number' ? p.low_stock_threshold : 5
    return (p.quantity || 0) <= threshold
  }).length
  const categoryCount = new Set(
    products
      .map((p) => {
        if (p.category?.parent) {
          return `${p.category.parent.name} → ${p.category.name}`
        }
        return p.category?.name || null
      })
      .filter(Boolean)
  ).size

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Products Management
          </h1>
          <p className="text-gray-600">
            Manage your inventory and track stock levels
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
                : notification.type === 'warning'
                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Across {categoryCount} category{categoryCount === 1 ? '' : 'ies'}
                  </p>
                </div>
                <div className="bg-primary-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Stock</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {totalStock}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Low Stock Items</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {lowStockCount}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Threshold uses item rule or 5 units by default
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Product List</h2>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Table view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* Add Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    if (formData.imagePreview) URL.revokeObjectURL(formData.imagePreview)
                    setFormData({
                      name: '',
                      quantity: '',
                      parentCategoryId: '',
                      categoryId: '',
                      image: null,
                      imagePreview: null
                    })
                    setSubcategories([])
                    setErrors({})
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`input-base ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="e.g., iPhone 14"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* Parent Category */}
                  <div>
                    <label htmlFor="parentCategoryId" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="parentCategoryId"
                      name="parentCategoryId"
                      value={formData.parentCategoryId}
                      onChange={handleParentCategoryChange}
                      className={`input-base ${errors.parentCategoryId ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select category...</option>
                      {parentCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.parentCategoryId && <p className="text-red-500 text-sm mt-1">{errors.parentCategoryId}</p>}
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory *
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className={`input-base ${errors.categoryId ? 'border-red-500' : ''}`}
                      disabled={!formData.parentCategoryId}
                    >
                      <option value="">
                        {formData.parentCategoryId ? 'Select subcategory...' : 'Select category first'}
                      </option>
                      {subcategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
                  </div>


                  {/* Quantity */}
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="0"
                      className={`input-base ${errors.quantity ? 'border-red-500' : ''}`}
                      placeholder="0"
                    />
                    {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image (Optional)
                  </label>
                  
                  {!formData.imagePreview ? (
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Choose Image
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-sm text-gray-500">Max size: 5MB</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeImagePreview}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1"><strong>Selected:</strong> {formData.image?.name}</p>
                        <p className="text-sm text-gray-500">Size: {(formData.image?.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  )}
                  {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      if (formData.imagePreview) URL.revokeObjectURL(formData.imagePreview)
                      setFormData({
                        name: '',
                        quantity: '',
                        parentCategoryId: '',
                        categoryId: '',
                        image: null,
                        imagePreview: null
                      })
                      setSubcategories([])
                      setErrors({})
                    }}
                    className="btn-secondary"
                    disabled={submitting || uploadingImage}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-2"
                    disabled={submitting || uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : submitting ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Detail Modal */}
        {showDetailModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
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
                {/* Product Image */}
                {selectedProduct.image_url ? (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          selectedProduct.quantity === 0
                            ? 'bg-red-100 text-red-800'
                            : selectedProduct.quantity < 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {selectedProduct.quantity === 0 ? 'Out of Stock' : selectedProduct.quantity < 10 ? 'Low Stock' : 'In Stock'}
                      </span>
                      {selectedProduct.category && (
                        <span className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                          {getCategoryText(selectedProduct)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Quantity on Hand</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedProduct.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Low Stock Threshold</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedProduct.low_stock_threshold ?? 5}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      Sale price is captured during invoicing so you can enter the negotiated amount at checkout.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Added On</p>
                    <p className="text-gray-900">
                      {new Date(selectedProduct.created_at).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Restock */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Add Stock</h4>
                      <p className="text-sm text-gray-600">Increase available units without recreating the product.</p>
                    </div>
                  </div>
                  <form onSubmit={handleRestockSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
                    <input
                      type="number"
                      min="1"
                      value={restockAmount}
                      onChange={(e) => setRestockAmount(e.target.value)}
                      className="input-base sm:max-w-[160px]"
                      placeholder="e.g., 10"
                    />
                    <button
                      type="submit"
                      disabled={restocking}
                      className="btn-primary sm:w-auto"
                    >
                      {restocking ? 'Updating...' : 'Add to Stock'}
                    </button>
                  </form>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-6 border-t mt-6">
                  <button
                    onClick={() => handleDelete(selectedProduct)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Display */}
        <div>
          {loading ? (
            <LoadingSkeleton />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first product</p>
              <button onClick={() => setShowForm(true)} className="btn-primary">
                Add Your First Product
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => openProductDetail(product)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gray-100 relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.quantity === 0
                            ? 'bg-red-100 text-red-800'
                            : product.quantity < 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {product.quantity === 0 ? 'Out' : product.quantity < 10 ? 'Low' : 'In Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                    {product.category && (
                      <p className="text-xs text-gray-500 mb-2">{getCategoryText(product)}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Stock</p>
                        <p className="text-xl font-bold text-gray-900">{product.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Low Stock</p>
                        <p className="text-xl font-bold text-gray-900">
                          {product.low_stock_threshold ?? 5}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-500">Pricing</p>
                      <p className="text-sm font-semibold text-gray-800">
                        Set sale price during invoicing.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Table View
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock Threshold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        onClick={() => openProductDetail(product)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getCategoryText(product)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.low_stock_threshold ?? 5}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.quantity === 0
                                ? 'bg-red-100 text-red-800'
                                : product.quantity < 10
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {product.quantity === 0 ? 'Out of Stock' : product.quantity < 10 ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(product)
                            }}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete product"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && products.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
