import { Router } from 'express'
import { handleSendEmail } from '../controllers/emailController.js'

const router = Router()

// Simple POST endpoint for Rob chat to trigger appointment emails
router.post('/send-email', handleSendEmail)

export default router
