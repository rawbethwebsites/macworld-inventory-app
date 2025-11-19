import { Link } from 'react-router-dom'

// Simple placeholder page while the client portal is under construction
const ComingSoon = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-dark/10 via-white to-primary-50 text-center px-4">
      <p className="text-xs tracking-[0.4em] text-brand-yellow uppercase mb-4">MacWORLD Client Portal</p>
      <h1 className="text-4xl font-black text-brand-dark mb-4">Coming Soon</h1>
      <p className="text-gray-600 max-w-xl mb-8">
        We&apos;re crafting a dedicated space for MacWORLD clients to manage purchases, repairs, and invoices online. In the meantime, chat with Rob or contact support to book appointments.
      </p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  )
}

export default ComingSoon
