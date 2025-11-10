import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Generate JWT token for user
 * @param {Object} payload - User data to encode in token
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

