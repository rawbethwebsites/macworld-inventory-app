# Custom Supabase Hooks Guide

This guide explains how to use the custom React hooks created for Supabase operations.

## Available Hooks

### 1. `useSupabaseQuery`

Fetch data from a Supabase table with automatic loading and error states.

**Usage:**

```javascript
import { useSupabaseQuery } from '../hooks/useSupabase'

function MyComponent() {
  const { data, loading, error, refetch } = useSupabaseQuery('inventory', {
    select: '*',
    filter: { category: 'Electronics' },
    orderBy: 'created_at',
    ascending: false,
    limit: 10,
    enabled: true // Set to false to disable auto-fetch
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}
```

**Options:**
- `select` - Columns to select (default: '*')
- `filter` - Object with field: value pairs to filter by
- `orderBy` - Field to order by (default: 'created_at')
- `ascending` - Sort order (default: false)
- `limit` - Max number of records
- `enabled` - Whether to fetch automatically (default: true)

---

### 2. `useSupabaseSubscription`

Subscribe to real-time changes on a table.

**Usage:**

```javascript
import { useSupabaseSubscription } from '../hooks/useSupabase'

function MyComponent() {
  const [items, setItems] = useState([])

  useSupabaseSubscription('inventory', {
    onInsert: (newItem) => {
      setItems(prev => [...prev, newItem])
      console.log('New item added:', newItem)
    },
    onUpdate: (updatedItem) => {
      setItems(prev => prev.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ))
      console.log('Item updated:', updatedItem)
    },
    onDelete: (deletedItem) => {
      setItems(prev => prev.filter(item => item.id !== deletedItem.id))
      console.log('Item deleted:', deletedItem)
    }
  }, true) // Set to false to disable subscription

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

---

### 3. `useSupabaseMutation`

Perform CRUD operations with loading and error states.

**Usage:**

```javascript
import { useSupabaseMutation } from '../hooks/useSupabase'

function MyComponent() {
  const { create, update, remove, loading, error } = useSupabaseMutation('inventory')

  const handleAdd = async () => {
    const result = await create({
      name: 'New Item',
      quantity: 10,
      price: 29.99
    })

    if (result.error) {
      console.error('Error:', result.error)
    } else {
      console.log('Created:', result.data)
    }
  }

  const handleUpdate = async (id) => {
    const result = await update(id, {
      quantity: 15
    })

    if (result.error) {
      console.error('Error:', result.error)
    } else {
      console.log('Updated:', result.data)
    }
  }

  const handleDelete = async (id) => {
    const result = await remove(id)

    if (result.error) {
      console.error('Error:', result.error)
    } else {
      console.log('Deleted successfully')
    }
  }

  return (
    <div>
      {loading && <div>Processing...</div>}
      {error && <div>Error: {error.message}</div>}
      <button onClick={handleAdd}>Add Item</button>
    </div>
  )
}
```

---

### 4. `useInventory`

Complete inventory management with CRUD operations and real-time updates.

**Usage:**

```javascript
import { useInventory } from '../hooks/useSupabase'

function InventoryList() {
  const { 
    items, 
    loading, 
    error, 
    addItem, 
    updateItem, 
    deleteItem, 
    refetch 
  } = useInventory()

  const handleAdd = async () => {
    const result = await addItem({
      name: 'MacBook Pro',
      description: '16-inch, M3 Max',
      quantity: 5,
      price: 2499.99,
      category: 'Laptops'
    })

    if (result.error) {
      alert('Error adding item')
    }
  }

  const handleUpdate = async (id) => {
    const result = await updateItem(id, {
      quantity: 10
    })

    if (result.error) {
      alert('Error updating item')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      const result = await deleteItem(id)
      
      if (result.error) {
        alert('Error deleting item')
      }
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <button onClick={handleAdd}>Add Item</button>
      <button onClick={refetch}>Refresh</button>
      
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Price: ${item.price}</p>
          <button onClick={() => handleUpdate(item.id)}>Update</button>
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
```

**Features:**
- Automatic real-time updates
- Optimistic UI updates
- Error handling
- User-specific data (automatically adds user_id)

---

### 5. `useSupabaseSearch`

Search with debouncing for better performance.

**Usage:**

```javascript
import { useState } from 'react'
import { useSupabaseSearch } from '../hooks/useSupabase'

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const { results, loading, error } = useSupabaseSearch(
    'inventory',              // table name
    searchTerm,               // search term
    ['name', 'description'],  // fields to search in
    300                       // debounce delay in ms
  )

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      
      {loading && <div>Searching...</div>}
      {error && <div>Error: {error.message}</div>}
      
      {results.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

---

### 6. `useSupabasePagination`

Paginate large datasets efficiently.

**Usage:**

```javascript
import { useSupabasePagination } from '../hooks/useSupabase'

function PaginatedList() {
  const {
    data,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    goToPage,
    refetch
  } = useSupabasePagination('inventory', 10) // 10 items per page

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      
      <div>
        <button onClick={prevPage} disabled={!hasPrev}>
          Previous
        </button>
        
        <span>
          Page {page + 1} of {totalPages} ({totalCount} total items)
        </span>
        
        <button onClick={nextPage} disabled={!hasNext}>
          Next
        </button>
        
        {/* Jump to specific page */}
        <input
          type="number"
          min="1"
          max={totalPages}
          onChange={(e) => goToPage(parseInt(e.target.value) - 1)}
        />
      </div>
    </div>
  )
}
```

---

## Combining Hooks

You can combine multiple hooks for more complex functionality:

```javascript
import { useState } from 'react'
import { 
  useSupabaseQuery, 
  useSupabaseSubscription,
  useSupabaseSearch 
} from '../hooks/useSupabase'

function AdvancedInventory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState(null)
  
  // Fetch filtered data
  const { data, loading, error, refetch } = useSupabaseQuery('inventory', {
    filter: category ? { category } : {},
    enabled: !searchTerm // Disable when searching
  })
  
  // Search functionality
  const { results: searchResults, loading: searching } = useSupabaseSearch(
    'inventory',
    searchTerm,
    ['name', 'description']
  )
  
  // Real-time updates
  useSupabaseSubscription('inventory', {
    onInsert: () => refetch(),
    onUpdate: () => refetch(),
    onDelete: () => refetch()
  })
  
  const displayData = searchTerm ? searchResults : data
  
  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      
      <select onChange={(e) => setCategory(e.target.value || null)}>
        <option value="">All Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Laptops">Laptops</option>
      </select>
      
      {(loading || searching) && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      
      {displayData?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

---

## Best Practices

### 1. Handle Loading States

Always show loading indicators:

```javascript
if (loading) return <div>Loading...</div>
```

### 2. Handle Errors Gracefully

```javascript
if (error) {
  return (
    <div className="error">
      <p>Something went wrong: {error.message}</p>
      <button onClick={refetch}>Try Again</button>
    </div>
  )
}
```

### 3. Clean Up Subscriptions

Subscriptions are automatically cleaned up, but you can disable them:

```javascript
const [enabled, setEnabled] = useState(true)

useSupabaseSubscription('inventory', {
  onInsert: handleInsert
}, enabled)

// Disable when component unmounts or when needed
useEffect(() => {
  return () => setEnabled(false)
}, [])
```

### 4. Optimize Re-renders

Use React.memo for list items:

```javascript
const InventoryItem = React.memo(({ item }) => (
  <div>{item.name}</div>
))

// In parent component
{items.map(item => (
  <InventoryItem key={item.id} item={item} />
))}
```

### 5. Error Boundaries

Wrap components using hooks with error boundaries:

```javascript
import { ErrorBoundary } from 'react-error-boundary'

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <InventoryList />
    </ErrorBoundary>
  )
}
```

---

## TypeScript Support

If using TypeScript, you can type your data:

```typescript
interface InventoryItem {
  id: string
  name: string
  description?: string
  quantity: number
  price: number
  category?: string
  created_at: string
  updated_at: string
  user_id: string
}

const { data, loading, error } = useSupabaseQuery<InventoryItem>('inventory')
```

---

## Testing

Mock hooks in tests:

```javascript
jest.mock('../hooks/useSupabase', () => ({
  useInventory: () => ({
    items: [
      { id: '1', name: 'Test Item', quantity: 10, price: 99.99 }
    ],
    loading: false,
    error: null,
    addItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    refetch: jest.fn()
  })
}))
```

---

## Performance Tips

1. **Use `enabled` option** to prevent unnecessary queries
2. **Implement pagination** for large datasets
3. **Debounce search input** (already built into `useSupabaseSearch`)
4. **Use React.memo** to prevent unnecessary re-renders
5. **Batch updates** when possible
6. **Consider virtual scrolling** for very long lists

---

## Troubleshooting

### Hook returns no data
- Check that the table name is correct
- Verify Row Level Security policies allow reading
- Check browser console for errors
- Ensure user is authenticated if RLS requires it

### Real-time updates not working
- Enable Realtime in Supabase dashboard for the table
- Check that RLS policies allow the subscription
- Verify the table name matches exactly

### Performance issues
- Implement pagination for large datasets
- Use `limit` option in queries
- Consider server-side filtering
- Add database indexes for frequently queried fields

---

## Additional Resources

- [Example Components](./src/components/InventoryExample.jsx)
- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Database Utilities](./src/utils/supabaseDb.js)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)

