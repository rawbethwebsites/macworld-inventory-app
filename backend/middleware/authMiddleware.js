import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Middleware to verify JWT token and authenticate user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // Add user info to request object
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      })
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid token.'
    })
  }
}

/**
 * Middleware to check if user has admin role
 * Must be used after authenticateToken middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    })
  }
}

