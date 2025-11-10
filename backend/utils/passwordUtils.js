import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
  } catch (error) {
    throw new Error('Error hashing password')
  }
}

/**
 * Compare plain text password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match
 */
export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    throw new Error('Error comparing passwords')
  }
}

