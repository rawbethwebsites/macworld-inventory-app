import { sendEmail } from '../utils/emailService.js'

/**
 * Handle POST /api/send-email
 * Accepts appointment + client metadata and sends notifications to admin and the client.
 */
export const handleSendEmail = async (req, res, next) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      deviceInfo,
      preferredTime,
      adminEmail,
      supportEmail,
      conversationSummary,
    } = req.body

    if (!clientName || !clientEmail || !deviceInfo || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required appointment details.',
      })
    }

    const adminRecipient = adminEmail || process.env.ADMIN_EMAIL
    const supportSender = supportEmail || process.env.SUPPORT_EMAIL

    if (!adminRecipient) {
      return res.status(400).json({
        success: false,
        message: 'Admin email is not configured.',
      })
    }

    // Email body helpers
    const summaryLines = [
      `Client: ${clientName}`,
      `Email: ${clientEmail}`,
      clientPhone ? `Phone: ${clientPhone}` : null,
      `Device: ${deviceInfo}`,
      `Preferred time: ${preferredTime}`,
      conversationSummary ? `Notes:\n${conversationSummary}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    await sendEmail({
      to: adminRecipient,
      from: supportSender || undefined,
      subject: `New MacWORLD appointment request from ${clientName}`,
      text: `A client scheduled an appointment:\n\n${summaryLines}`,
    })

    await sendEmail({
      to: clientEmail,
      from: supportSender || undefined,
      subject: 'MacWORLD appointment request received',
      text: `Hi ${clientName},\n\nThanks for reaching out. We have your ${deviceInfo} request for ${preferredTime}. Our admin team will confirm shortly. If you need to update anything, reply to this email or call +234 816 836 6739.\n\n- MacWORLD Gallery Ltd.`,
    })

    res.json({
      success: true,
      message: 'Notification emails sent.',
    })
  } catch (error) {
    console.error('Email send error:', error)
    next(error)
  }
}
