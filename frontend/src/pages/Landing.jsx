import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

// Public-facing landing page that speaks to MacWORLD clients rather than internal users
const Landing = () => {
  // Pull the OpenRouter key from env (supports both Vite + legacy prefixes just in case)
  const openRouterApiKey = import.meta.env.VITE_REACT_APP_OPENROUTER_API_KEY || import.meta.env.REACT_APP_OPENROUTER_API_KEY || ''
  const adminEmailEnv = import.meta.env.VITE_REACT_APP_ADMIN_EMAIL || import.meta.env.REACT_APP_ADMIN_EMAIL || ''
  const supportEmailEnv = import.meta.env.VITE_REACT_APP_SUPPORT_EMAIL || import.meta.env.REACT_APP_SUPPORT_EMAIL || ''
  const storageKey = 'macworld_rob_chat_state'
  const cookieKey = 'macworld_rob_client'
  // System instruction keeps Rob on-brand for every request (updated with explicit MacWORLD context)
  const systemPrompt = `
You are Rob, a MacWORLD Gallery Ltd. assistant based at Shop B18-a, Emab Plaza, Wuse II, Abuja (open Mon-Sat, 9am-7pm).
You only recommend MacWORLD products and services: Apple phones, laptops, tablets, accessories, curated lifestyle gear, plus certified repairs, replacements, diagnostics, and corporate procurement.
Never mention competitors or third-party repair shops.
When customers ask about services or issues (e.g., screen replacements, battery swaps, device trade-ins), confirm MacWORLD can help, mention common devices supported (iPhone, Samsung, Google Pixel, MacBook, iPad), and immediately ask for their device model to verify stock.
Always offer to schedule an appointment or pickup through this chat—collect preferred date, time, contact phone/email, and note any special requests. Confirm the details back to the customer.
Pricing: explain that quotes depend on device condition but diagnostics are free; offer to prepare an estimate once you know the device model.
If someone wants to purchase, reserve, or pick up a product, walk them through setting an appointment or courier pickup and confirm their contact info.
Keep each reply to one or two short sentences and ask only one question at a time.
Stay friendly, human, and knowledgeable. Never say you are a bot.`
  // Maintain chat history so each request carries prior context
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi, I’m Rob from MacWORLD. What device make and model would you like help with today?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')
  const [conversationStep, setConversationStep] = useState('device')
  const [deviceInfo, setDeviceInfo] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [appointmentLog, setAppointmentLog] = useState(null)
  const [emailStatus, setEmailStatus] = useState({ status: 'idle', message: '' })

  const getCookie = (name) => {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  const setCookie = (name, value, days = 7) => {
    if (typeof document === 'undefined') return
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `${name}=${value}; expires=${expires}; path=/`
  }

  // Lightweight verification log to ensure the API key is detected during development
  useEffect(() => {
    console.log('Rob OpenRouter key detected:', Boolean(openRouterApiKey))
  }, [openRouterApiKey])

  // Load chat state from localStorage/cookie so visitors don't lose context on refresh
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(storageKey)
      if (savedState) {
        const parsed = JSON.parse(savedState)
        if (parsed.messages) setChatMessages(parsed.messages)
        if (parsed.conversationStep) setConversationStep(parsed.conversationStep)
        if (parsed.deviceInfo) setDeviceInfo(parsed.deviceInfo)
        if (parsed.contactInfo) setContactInfo(parsed.contactInfo)
        if (parsed.clientName) setClientName(parsed.clientName)
        if (parsed.clientPhone) setClientPhone(parsed.clientPhone)
        if (parsed.clientEmail) setClientEmail(parsed.clientEmail)
        if (parsed.preferredTime) setPreferredTime(parsed.preferredTime)
        if (parsed.appointmentLog) setAppointmentLog(parsed.appointmentLog)
        if (parsed.emailStatus) setEmailStatus(parsed.emailStatus)
      } else {
        const cookieData = getCookie(cookieKey)
        if (cookieData) {
          const info = JSON.parse(decodeURIComponent(cookieData))
          if (info.clientName) setClientName(info.clientName)
          if (info.clientEmail) setClientEmail(info.clientEmail)
          if (info.clientPhone) setClientPhone(info.clientPhone)
          if (info.preferredTime) setPreferredTime(info.preferredTime)
          if (info.device) setDeviceInfo(info.device)
        }
      }
    } catch (error) {
      console.error('Failed to parse stored chat state', error)
    }
  }, [])

  // Persist chat state whenever it changes
  useEffect(() => {
    const stateToStore = {
      messages: chatMessages,
      conversationStep,
      deviceInfo,
      contactInfo,
      clientName,
      clientPhone,
      clientEmail,
      preferredTime,
      appointmentLog,
      emailStatus,
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(stateToStore))
    } catch (error) {
      console.warn('Unable to persist chat state', error)
    }
  }, [
    chatMessages,
    conversationStep,
    deviceInfo,
    contactInfo,
    clientName,
    clientPhone,
    clientEmail,
    preferredTime,
    appointmentLog,
    emailStatus,
  ])

  // Compose a workflow hint so Rob knows which detail to ask for next
  const getWorkflowInstruction = (device, contact, email, time, nextStep) => {
    return `
Current appointment capture status:
- Device info: ${device || 'pending'}
- Contact info: ${contact || 'pending'}
- Email: ${email || 'pending'}
- Preferred time: ${time || 'pending'}
Next required step: ${nextStep}.
If device info is pending, ask for make/model.
If contact info is pending, thank them for the device info and ask for their full name plus phone number in one sentence.
If the email is pending, ask for the best email to send confirmations.
If preferred time is pending, offer morning, afternoon, or evening (or specific time) options.
Once every field is collected, confirm the summary and tell the client you will relay it to admin. Keep answers under two sentences.`
  }

  // Updated feature blurbs written in direct, action-focused language for clients
  const features = [
    {
      title: 'Inventory Intelligence',
      body: 'Discover exactly what’s in stock, anytime. Easily check real‑time device and accessory counts. Search, filter, and review your company’s assets with analytics-ready data and powerful insights—no spreadsheets required.'
    },
    {
      title: 'Invoice Automation',
      body: 'Invoice your buyers in seconds. Create polished invoices and digital receipts instantly with one click. Speed up your sales process, share documents online, and track every transaction for complete peace of mind.'
    },
    {
      title: 'Team Access',
      body: 'Empower your entire team. Assign roles for admins, sales, and support so everyone stays aligned. Invite your staff, manage permissions, and collaborate smoothly—all inside the platform.'
    },
  ]

  // Send confirmation emails via backend helper route
  const sendAppointmentEmails = async (details, messageHistory) => {
    if (!details.clientEmail) return
    try {
      setEmailStatus({ status: 'loading', message: 'Sending confirmations...' })
      const conversationSummary = messageHistory
        .map((msg) => `${msg.role === 'assistant' ? 'Rob' : 'Client'}: ${msg.content}`)
        .join('\n')

      await api.post('/send-email', {
        clientName: details.clientName,
        clientEmail: details.clientEmail,
        clientPhone: details.clientPhone,
        deviceInfo: details.device,
        preferredTime: details.preferredTime,
        adminEmail: adminEmailEnv,
        supportEmail: supportEmailEnv,
        conversationSummary,
      })

      setEmailStatus({
        status: 'success',
        message: 'Your appointment request has been sent! Check your email for confirmation.',
      })
    } catch (error) {
      console.error('Failed to send appointment emails:', error)
      setEmailStatus({
        status: 'error',
        message: 'We could not send confirmation emails right now. Our admin team will follow up manually.',
      })
    }
  }

  // Send the visitor's message to OpenRouter and stream back Rob's reply
  const handleChatSubmit = async (event) => {
    event.preventDefault()
    if (!chatInput.trim() || !openRouterApiKey) return

    const userText = chatInput.trim()
    const newUserMessage = { role: 'user', content: userText }
    const updatedHistory = [...chatMessages, newUserMessage]
    setChatMessages(updatedHistory)
    setChatInput('')
    setChatLoading(true)
    setChatError('')

    // Track info collection in local copies so we can guide Rob's next question
    let updatedDeviceInfo = deviceInfo
    let updatedContactInfo = contactInfo
    let updatedClientName = clientName
    let updatedClientPhone = clientPhone
    let updatedClientEmail = clientEmail
    let updatedPreferredTime = preferredTime
    let nextStep = conversationStep

    if (conversationStep === 'device' && !deviceInfo) {
      updatedDeviceInfo = userText
      nextStep = 'contact'
    } else if (conversationStep === 'contact' && !contactInfo) {
      updatedContactInfo = userText
      const [namePart, ...rest] = userText.split(',')
      if (!clientName && namePart) {
        updatedClientName = namePart.trim()
      }
      if (!clientPhone) {
        const joined = rest.join(',').trim()
        if (joined) {
          updatedClientPhone = joined
        } else {
          const fallbackDigits = userText.match(/(\+?\d[\d\s-]{6,})/)
          if (fallbackDigits) {
            updatedClientPhone = fallbackDigits[0].trim()
          }
        }
      }
      const emailMatch = userText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
      if (!clientEmail && emailMatch) {
        updatedClientEmail = emailMatch[0]
        nextStep = 'time'
      } else {
        nextStep = 'email'
      }
    } else if (conversationStep === 'email' && !clientEmail) {
      updatedClientEmail = userText
      nextStep = 'time'
    } else if (conversationStep === 'time' && !preferredTime) {
      updatedPreferredTime = userText
      nextStep = 'complete'
    }

    setDeviceInfo(updatedDeviceInfo)
    setContactInfo(updatedContactInfo)
    setClientName(updatedClientName)
    setClientPhone(updatedClientPhone)
    setClientEmail(updatedClientEmail)
    setPreferredTime(updatedPreferredTime)
    setConversationStep(nextStep)

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterApiKey}`,
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'system', content: getWorkflowInstruction(updatedDeviceInfo, updatedContactInfo, updatedClientEmail, updatedPreferredTime, nextStep) },
            ...updatedHistory,
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('OpenRouter request failed')
      }

      const data = await response.json()
      const aiMessage = data?.choices?.[0]?.message

      if (!aiMessage?.content) {
        throw new Error('Rob did not return a message')
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', content: aiMessage.content.trim() }])

      // Once all required info is captured, surface a quick log for admins
      if (nextStep === 'complete') {
        const appointmentDetails = {
          device: updatedDeviceInfo,
          contact: updatedContactInfo,
          clientName: updatedClientName || 'MacWORLD Client',
          clientPhone: updatedClientPhone || 'Not provided',
          clientEmail: updatedClientEmail,
          preferredTime: updatedPreferredTime,
          capturedAt: new Date().toISOString(),
        }
        console.log('Rob appointment request:', appointmentDetails)
        setAppointmentLog(appointmentDetails)
        try {
          setCookie(cookieKey, encodeURIComponent(JSON.stringify(appointmentDetails)))
        } catch (error) {
          console.warn('Unable to store appointment cookie', error)
        }
        if (updatedClientEmail) {
          await sendAppointmentEmails(appointmentDetails, [...updatedHistory, { role: 'assistant', content: aiMessage.content.trim() }])
        } else {
          setEmailStatus({
            status: 'error',
            message: 'Need an email address to send confirmations. Please share your email when you can.',
          })
        }
      }
    } catch (error) {
      console.error('Rob chat error:', error)
      setChatError('Rob is unavailable right now. Please try again shortly.')
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark/5 via-white to-primary-50">
      {/* Hero section introducing MacWORLD to prospective customers */}
      <header className="max-w-6xl mx-auto px-4 py-16 sm:py-24 grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.4em] text-brand-yellow uppercase">RC 1755259</p>
            <h1 className="text-4xl sm:text-5xl font-black text-brand-dark leading-tight">
              <span className="text-brand-gray">Mac</span>
              <span>WORLD</span> Gallery Ltd.
            </h1>
            <p className="text-brand-red font-semibold tracking-[0.45em] uppercase text-xs">Premium Apple Lifestyle Partner</p>
          </div>
          <p className="text-lg text-gray-600 max-w-xl">
            From the latest Apple devices to concierge-grade support, MacWORLD helps individuals and businesses stay inspired, connected, and productive.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/coming-soon"
              className="btn-primary shadow-lg shadow-primary-200"
            >
              Client Login
            </Link>
            {/* Explicit admin portal button so staff can still access the dashboard */}
            <Link
              to="/login"
              className="btn-secondary border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white"
            >
              Admin Login
            </Link>
            <a
              href="tel:+2348168366739"
              className="btn-secondary border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white"
            >
              Call Us
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4">
            {/* Quick stats to build trust with new customers */}
            {[
              { label: 'Years Serving Abuja', value: '10+' },
              { label: 'Happy Clients', value: '4k+' },
              { label: 'Corporate Deployments', value: '120+' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/80 border border-gray-100 p-4 shadow-sm">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-brand-dark">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat assistant area now wired to OpenRouter with graceful fallback */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col gap-6 border border-gray-100">
          <div>
            <p className="text-sm font-semibold text-brand-red uppercase tracking-[0.3em]">AI Concierge</p>
            <h2 className="text-2xl font-bold text-brand-dark">Need bespoke support?</h2>
            <p className="text-gray-600">Chat with Rob to ask about device availability, corporate packages, or appointments.</p>
          </div>
          {openRouterApiKey ? (
            <>
              <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 p-4 flex flex-col gap-4">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {chatMessages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          message.role === 'assistant'
                            ? 'bg-white text-brand-dark border border-gray-100'
                            : 'bg-brand-dark text-white'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <span className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></span>
                      Rob is typing...
                    </div>
                  )}
                </div>
                {chatError && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {chatError}
                  </div>
                )}
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Rob about inventory, invoices..."
                    className="flex-1 input-base"
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    className="btn-primary flex-shrink-0"
                    disabled={chatLoading}
                  >
                    Send
                  </button>
                </form>
              </div>
              {/* Simple preview panel so admins can see what was collected during demo */}
              {appointmentLog && (
                <div className="rounded-2xl border border-brand-dark/20 bg-white p-4 text-sm text-brand-dark space-y-1">
                  <p className="font-semibold mb-2">Latest appointment request</p>
                  <p><span className="font-medium">Client:</span> {appointmentLog.clientName}</p>
                  <p><span className="font-medium">Email:</span> {appointmentLog.clientEmail || 'Not provided yet'}</p>
                  <p><span className="font-medium">Phone:</span> {appointmentLog.clientPhone}</p>
                  <p><span className="font-medium">Device:</span> {appointmentLog.device}</p>
                  <p><span className="font-medium">Preferred time:</span> {appointmentLog.preferredTime}</p>
                  {emailStatus.status !== 'idle' && (
                    <p
                      className={
                        emailStatus.status === 'success'
                          ? 'text-green-600'
                          : emailStatus.status === 'loading'
                            ? 'text-brand-dark'
                            : 'text-red-600'
                      }
                    >
                      {emailStatus.message}
                    </p>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-400">
                Rob uses OpenRouter to answer as a MacWORLD specialist.
              </p>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
              Rob chat will appear here once the `REACT_APP_OPENROUTER_API_KEY` environment variable is configured.
            </div>
          )}
        </div>
      </header>

      {/* Client-facing feature cards with refreshed copy */}
      <section className="max-w-6xl mx-auto px-4 pb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-brand-dark">{feature.title}</h3>
            <p className="mt-3 text-gray-600">{feature.body}</p>
          </article>
        ))}
      </section>

      {/* Lifestyle narrative to keep the landing page client-facing */}
      <section className="bg-brand-dark text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm tracking-[0.4em] text-brand-yellow uppercase">Experience Centre</p>
            <h2 className="text-3xl font-bold">Visit us at Emab Plaza, Wuse II</h2>
            <p className="text-white/80">
              Explore curated Apple setups, attend product walk-throughs, and get one-on-one consultations from our specialists.
            </p>
            <p className="text-white/80">
              Whether you are building a creative studio, equipping a sales crew, or gifting yourself a new device, we are here to help.
            </p>
            <a
              href="https://maps.app.goo.gl/"
              className="inline-flex items-center gap-2 text-brand-yellow font-semibold"
            >
              Schedule a showroom visit →
            </a>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-semibold">What we can help you with</h3>
            <ul className="space-y-3 text-white/80">
              <li>• Device procurement & financing plans</li>
              <li>• Same-day diagnostics & repair intake</li>
              <li>• Corporate deployment playbooks</li>
              <li>• Accessory curation and lifestyle upgrades</li>
            </ul>
            <p className="text-sm text-white/60">
              Need something specific? Reach our concierge line: <a href="tel:+2348168366739" className="text-brand-yellow">+234 816 836 6739</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing
