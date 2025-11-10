import { useEffect } from 'react'

/**
 * Notification component for displaying success/error messages
 * @param {string} type - 'success' or 'error'
 * @param {string} message - Message to display
 * @param {function} onClose - Callback when notification closes
 */
const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    // Auto-close notification after 5 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800'
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500'

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full ${bgColor} border-l-4 p-4 rounded-lg shadow-lg animate-slide-in`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <svg className={`h-6 w-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className={`h-6 w-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`ml-3 inline-flex ${textColor} hover:opacity-75 transition-base`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Notification

