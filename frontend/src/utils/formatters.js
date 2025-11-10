/**
 * Format currency to Naira
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

/**
 * Format datetime to readable string
 * @param {string|Date} datetime - DateTime to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (datetime) => {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(datetime))
}

/**
 * Generate invoice number
 * @param {number} lastInvoiceNumber - Last invoice number used
 * @returns {string} New invoice number in format INV-YYYY-MM-0001
 */
export const generateInvoiceNumber = (lastInvoiceNumber = 0) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const number = String(lastInvoiceNumber + 1).padStart(4, '0')
  return `INV-${year}-${month}-${number}`
}

