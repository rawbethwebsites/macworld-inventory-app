import nodemailer from 'nodemailer'

// Create a singleton transporter using SMTP credentials from the environment
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

/**
 * Send an email via the configured transporter
 * @param {Object} options nodemailer sendMail options
 * @returns {Promise}
 */
export const sendEmail = async (options) => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    throw new Error('Email transport is not configured. Check EMAIL_HOST/EMAIL_USER env vars.')
  }

  return transporter.sendMail({
    from: process.env.SUPPORT_EMAIL || 'support@macworld.com',
    ...options,
  })
}
