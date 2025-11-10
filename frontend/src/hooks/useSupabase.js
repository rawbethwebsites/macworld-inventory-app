import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

/**
 * Custom hook for fetching data from Supabase
 * @param {string} tableName - Name of the table to query
 * @param {object} options - Query options
 * @returns {object} { data, loading, error, refetch }
 */
export function useSupabaseQuery(tableName, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const {
    select = '*',
    filter = {},
    orderBy = 'created_at',
    ascending = false,
    limit = null,
    enabled = true
  } = options

  const fetchData = async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from(tableName)
        .select(select)
        .order(orderBy, { ascending })

      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      // Apply limit
      if (limit) {
        query = query.limit(limit)
      }

      const { data: result, error: queryError } = await query

      if (queryError) throw queryError

      setData(result)
    } catch (err) {
      setError(err)
      console.error('Supabase query error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [tableName, JSON.stringify(options)])

  return { data, loading, error, refetch: fetchData }
}

/**
 * Custom hook for real-time subscriptions
 * @param {string} tableName - Name of the table to subscribe to
 * @param {object} callbacks - Event callbacks { onInsert, onUpdate, onDelete }
 * @param {boolean} enabled - Whether subscription is enabled
 */
export function useSupabaseSubscription(tableName, callbacks = {}, enabled = true) {
  const { onInsert, onUpdate, onDelete } = callbacks

  useEffect(() => {
    if (!enabled) return

    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: tableName },
        (payload) => onInsert && onInsert(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: tableName },
        (payload) => onUpdate && onUpdate(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: tableName },
        (payload) => onDelete && onDelete(payload.old)
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [tableName, enabled])
}

/**
 * Custom hook for CRUD operations with loading states
 * @param {string} tableName - Name of the table
 * @returns {object} CRUD operations with loading states
 */
export function useSupabaseMutation(tableName) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const create = async (record) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: createError } = await supabase
        .from(tableName)
        .insert([record])
        .select()
        .single()

      if (createError) throw createError

      return { data, error: null }
    } catch (err) {
      setError(err)
      console.error('Create error:', err)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const update = async (id, updates) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      return { data, error: null }
    } catch (err) {
      setError(err)
      console.error('Update error:', err)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      return { error: null }
    } catch (err) {
      setError(err)
      console.error('Delete error:', err)
      return { error: err }
    } finally {
      setLoading(false)
    }
  }

  return {
    create,
    update,
    remove,
    loading,
    error
  }
}

/**
 * Example: Hook for inventory operations with real-time updates
 * @returns {object} Inventory data and operations
 */
export function useInventory() {
  const [items, setItems] = useState([])
  const { data, loading, error, refetch } = useSupabaseQuery('inventory', {
    orderBy: 'created_at',
    ascending: false
  })
  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation('inventory')

  // Update items when data changes
  useEffect(() => {
    if (data) {
      setItems(data)
    }
  }, [data])

  // Subscribe to real-time changes
  useSupabaseSubscription('inventory', {
    onInsert: (newItem) => {
      setItems((prev) => [newItem, ...prev])
    },
    onUpdate: (updatedItem) => {
      setItems((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      )
    },
    onDelete: (deletedItem) => {
      setItems((prev) => prev.filter((item) => item.id !== deletedItem.id))
    }
  })

  const addItem = async (item) => {
    const { data: { user } } = await supabase.auth.getUser()
    const result = await create({
      ...item,
      user_id: user?.id
    })
    return result
  }

  const updateItem = async (id, updates) => {
    const result = await update(id, {
      ...updates,
      updated_at: new Date().toISOString()
    })
    return result
  }

  const deleteItem = async (id) => {
    const result = await remove(id)
    return result
  }

  return {
    items,
    loading: loading || mutationLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refetch
  }
}

/**
 * Hook for searching with debounce
 * @param {string} tableName - Table name
 * @param {string} searchTerm - Search term
 * @param {array} searchFields - Fields to search in
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @returns {object} { results, loading, error }
 */
export function useSupabaseSearch(tableName, searchTerm, searchFields = ['name'], debounceMs = 300) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!searchTerm) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        // Build OR query for multiple fields
        const orQuery = searchFields
          .map((field) => `${field}.ilike.%${searchTerm}%`)
          .join(',')

        const { data, error: searchError } = await supabase
          .from(tableName)
          .select('*')
          .or(orQuery)

        if (searchError) throw searchError

        setResults(data || [])
      } catch (err) {
        setError(err)
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, tableName, JSON.stringify(searchFields), debounceMs])

  return { results, loading, error }
}

/**
 * Hook for pagination
 * @param {string} tableName - Table name
 * @param {number} pageSize - Items per page
 * @returns {object} Paginated data and controls
 */
export function useSupabasePagination(tableName, pageSize = 10) {
  const [page, setPage] = useState(0)
  const [data, setData] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPage = async (pageNumber) => {
    setLoading(true)
    setError(null)

    try {
      const from = pageNumber * pageSize
      const to = from + pageSize - 1

      // Get total count
      const { count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      setTotalCount(count || 0)

      // Get page data
      const { data: pageData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setData(pageData || [])
      setPage(pageNumber)
    } catch (err) {
      setError(err)
      console.error('Pagination error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPage(0)
  }, [tableName, pageSize])

  const nextPage = () => {
    if ((page + 1) * pageSize < totalCount) {
      fetchPage(page + 1)
    }
  }

  const prevPage = () => {
    if (page > 0) {
      fetchPage(page - 1)
    }
  }

  const goToPage = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber * pageSize < totalCount) {
      fetchPage(pageNumber)
    }
  }

  return {
    data,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    hasNext: (page + 1) * pageSize < totalCount,
    hasPrev: page > 0,
    nextPage,
    prevPage,
    goToPage,
    refetch: () => fetchPage(page)
  }
}

export default {
  useSupabaseQuery,
  useSupabaseSubscription,
  useSupabaseMutation,
  useInventory,
  useSupabaseSearch,
  useSupabasePagination
}

