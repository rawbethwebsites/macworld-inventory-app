import { supabase } from './supabase'

/**
 * Database helper functions for Supabase
 * These are example functions that you can use as a reference
 * Modify table names and fields according to your database schema
 */

// ============================================
// INVENTORY OPERATIONS (Example)
// ============================================

/**
 * Fetch all inventory items for the current user
 * @returns {Promise<{data, error}>}
 */
export const fetchInventoryItems = async () => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Fetch a single inventory item by ID
 * @param {string} id - Item ID
 * @returns {Promise<{data, error}>}
 */
export const fetchInventoryItem = async (id) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', id)
    .single()

  return { data, error }
}

/**
 * Create a new inventory item
 * @param {object} item - Item data
 * @returns {Promise<{data, error}>}
 */
export const createInventoryItem = async (item) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('inventory')
    .insert([{
      ...item,
      user_id: user?.id
    }])
    .select()
    .single()

  return { data, error }
}

/**
 * Update an existing inventory item
 * @param {string} id - Item ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateInventoryItem = async (id, updates) => {
  const { data, error } = await supabase
    .from('inventory')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

/**
 * Delete an inventory item
 * @param {string} id - Item ID
 * @returns {Promise<{error}>}
 */
export const deleteInventoryItem = async (id) => {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id)

  return { error }
}

/**
 * Search inventory items by name or description
 * @param {string} searchTerm - Search term
 * @returns {Promise<{data, error}>}
 */
export const searchInventoryItems = async (searchTerm) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Filter inventory items by category
 * @param {string} category - Category name
 * @returns {Promise<{data, error}>}
 */
export const fetchInventoryByCategory = async (category) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Get low stock items (quantity below threshold)
 * @param {number} threshold - Stock threshold (default: 10)
 * @returns {Promise<{data, error}>}
 */
export const fetchLowStockItems = async (threshold = 10) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .lt('quantity', threshold)
    .order('quantity', { ascending: true })

  return { data, error }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS (Example)
// ============================================

/**
 * Subscribe to inventory changes
 * @param {function} onInsert - Callback for INSERT events
 * @param {function} onUpdate - Callback for UPDATE events
 * @param {function} onDelete - Callback for DELETE events
 * @returns {object} Subscription object (call .unsubscribe() to clean up)
 */
export const subscribeToInventory = (onInsert, onUpdate, onDelete) => {
  const subscription = supabase
    .channel('inventory_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'inventory' },
      (payload) => onInsert && onInsert(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'inventory' },
      (payload) => onUpdate && onUpdate(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'inventory' },
      (payload) => onDelete && onDelete(payload.old)
    )
    .subscribe()

  return subscription
}

// ============================================
// GENERIC CRUD OPERATIONS
// ============================================

/**
 * Generic fetch all from a table
 * @param {string} tableName - Table name
 * @param {string} orderBy - Field to order by
 * @param {boolean} ascending - Sort order
 * @returns {Promise<{data, error}>}
 */
export const fetchAll = async (tableName, orderBy = 'created_at', ascending = false) => {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order(orderBy, { ascending })

  return { data, error }
}

/**
 * Generic fetch by ID
 * @param {string} tableName - Table name
 * @param {string} id - Record ID
 * @returns {Promise<{data, error}>}
 */
export const fetchById = async (tableName, id) => {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', id)
    .single()

  return { data, error }
}

/**
 * Generic create record
 * @param {string} tableName - Table name
 * @param {object} record - Record data
 * @returns {Promise<{data, error}>}
 */
export const createRecord = async (tableName, record) => {
  const { data, error } = await supabase
    .from(tableName)
    .insert([record])
    .select()
    .single()

  return { data, error }
}

/**
 * Generic update record
 * @param {string} tableName - Table name
 * @param {string} id - Record ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateRecord = async (tableName, id, updates) => {
  const { data, error } = await supabase
    .from(tableName)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

/**
 * Generic delete record
 * @param {string} tableName - Table name
 * @param {string} id - Record ID
 * @returns {Promise<{error}>}
 */
export const deleteRecord = async (tableName, id) => {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id)

  return { error }
}

// ============================================
// FILE STORAGE OPERATIONS (Example)
// ============================================

/**
 * Upload a file to Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @param {File} file - File object to upload
 * @returns {Promise<{data, error}>}
 */
export const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  return { data, error }
}

/**
 * Download a file from Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @returns {Promise<{data, error}>}
 */
export const downloadFile = async (bucket, path) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)

  return { data, error }
}

/**
 * Get public URL for a file
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @returns {string} Public URL
 */
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Delete a file from Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @returns {Promise<{error}>}
 */
export const deleteFile = async (bucket, path) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  return { error }
}

/**
 * List files in a storage bucket
 * @param {string} bucket - Storage bucket name
 * @param {string} path - Folder path (optional)
 * @returns {Promise<{data, error}>}
 */
export const listFiles = async (bucket, path = '') => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path)

  return { data, error }
}

export default {
  // Inventory operations
  fetchInventoryItems,
  fetchInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  searchInventoryItems,
  fetchInventoryByCategory,
  fetchLowStockItems,
  subscribeToInventory,
  
  // Generic CRUD
  fetchAll,
  fetchById,
  createRecord,
  updateRecord,
  deleteRecord,
  
  // File storage
  uploadFile,
  downloadFile,
  getPublicUrl,
  deleteFile,
  listFiles
}

