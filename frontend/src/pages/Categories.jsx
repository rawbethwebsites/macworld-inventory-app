import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [parentCategories, setParentCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [notification, setNotification] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    isActive: true
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error

      setCategories(data || [])
      setParentCategories(data.filter(cat => !cat.parent_id))
    } catch (error) {
      console.error('Error fetching categories:', error)
      showNotification('Failed to load categories: ' + error.message, 'error')
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
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setSubmitting(true)

      const categoryData = {
        name: formData.name.trim(),
        parent_id: formData.parentId ? parseInt(formData.parentId) : null,
        is_active: formData.isActive
      }

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)

        if (error) throw error
        showNotification('Category updated successfully!', 'success')
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([categoryData])

        if (error) throw error
        showNotification('Category created successfully!', 'success')
      }

      setFormData({ name: '', parentId: '', isActive: true })
      setEditingCategory(null)
      setShowForm(false)
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      showNotification('Failed to save category: ' + error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      parentId: category.parent_id || '',
      isActive: category.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (category) => {
    // Check if category has subcategories
    const hasSubcategories = categories.some(cat => cat.parent_id === category.id)
    if (hasSubcategories) {
      showNotification('Cannot delete category with subcategories. Delete subcategories first.', 'error')
      return
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)

      if (error) throw error

      showNotification('Category deleted successfully!', 'success')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      showNotification('Failed to delete category: ' + error.message, 'error')
    }
  }

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
  }

  const getCategoryTree = () => {
    return parentCategories.map(parent => ({
      ...parent,
      subcategories: categories.filter(cat => cat.parent_id === parent.id)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Category Management
          </h1>
          <p className="text-gray-600">
            Manage product categories and subcategories
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
              <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Parent Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {parentCategories.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Subcategories</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {categories.filter(c => c.parent_id).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm font-medium">Total Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {categories.length}
              </p>
            </div>
          </div>
        )}

        {/* Add Category Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
          <button
            onClick={() => {
              setEditingCategory(null)
              setFormData({ name: '', parentId: '', isActive: true })
              setShowForm(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>

        {/* Category Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingCategory(null)
                    setFormData({ name: '', parentId: '', isActive: true })
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
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input-base ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="e.g., Electronics"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category (Optional)
                  </label>
                  <select
                    id="parentId"
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleInputChange}
                    className="input-base"
                  >
                    <option value="">None (Make it a parent category)</option>
                    {parentCategories
                      .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to create a parent category, or select a parent to create a subcategory
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active (visible in product forms)
                  </label>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingCategory(null)
                      setFormData({ name: '', parentId: '', isActive: true })
                      setErrors({})
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
                    {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first category</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Add Your First Category
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {getCategoryTree().map(parent => (
                <div key={parent.id} className="border rounded-lg overflow-hidden">
                  {/* Parent Category */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <div>
                        <h3 className="font-semibold text-gray-900">{parent.name}</h3>
                        <p className="text-xs text-gray-500">
                          {parent.subcategories.length} subcategor{parent.subcategories.length === 1 ? 'y' : 'ies'}
                        </p>
                      </div>
                      {!parent.is_active && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Inactive</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(parent)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(parent)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {parent.subcategories.length > 0 && (
                    <div className="divide-y">
                      {parent.subcategories.map(sub => (
                        <div key={sub.id} className="px-4 py-3 pl-12 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-gray-900">{sub.name}</span>
                            {!sub.is_active && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Inactive</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(sub)}
                              className="text-blue-600 hover:text-blue-800 p-2"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(sub)}
                              className="text-red-600 hover:text-red-800 p-2"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Categories

