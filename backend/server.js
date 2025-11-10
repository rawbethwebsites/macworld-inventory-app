import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

// Import routes (will be created later)
// import authRoutes from './routes/authRoutes.js'
// import productRoutes from './routes/productRoutes.js'
// import invoiceRoutes from './routes/invoiceRoutes.js'
// import customerRoutes from './routes/customerRoutes.js'
// import dashboardRoutes from './routes/dashboardRoutes.js'

// Load environment variables
dotenv.config()

// Initialize express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet()) // Security headers
app.use(cors()) // Enable CORS
app.use(express.json()) // Parse JSON bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Macworld Inventory API is running',
    timestamp: new Date().toISOString()
  })
})

// API Routes (will be uncommented when routes are created)
// app.use('/api/auth', authRoutes)
// app.use('/api/products', productRoutes)
// app.use('/api/invoices', invoiceRoutes)
// app.use('/api/customers', customerRoutes)
// app.use('/api/dashboard', dashboardRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Start server (commented out as per instructions)
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`)
//   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
// })

export default app

