import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../hooks/useAuth'

const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

const AdminNotifications = () => {
  const { isAdmin } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [messageLoading, setMessageLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAdmin()) return
    fetchNotifications()
  }, [isAdmin])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*, session:chat_sessions(*, client:clients(*))')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
      if (data?.length && !selectedNotification) {
        handleSelectNotification(data[0])
      }
    } catch (err) {
      console.error('Failed to load notifications', err)
      setError('Unable to load notifications right now.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectNotification = async (notification) => {
    setSelectedNotification(notification)
    if (notification?.session?.id) {
      await fetchMessages(notification.session.id)
    } else {
      setMessages([])
    }

    if (!notification.is_read) {
      await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notification.id)
      setNotifications((prev) =>
        prev.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item))
      )
    }
  }

  const fetchMessages = async (sessionId) => {
    try {
      setMessageLoading(true)
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('sent_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      console.error('Failed to load messages', err)
      setError('Unable to load chat history.')
    } finally {
      setMessageLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedNotification?.session?.id) return
    try {
      setSending(true)
      setError('')
      const sessionId = selectedNotification.session.id
      const newMessage = {
        session_id: sessionId,
        sender_type: 'admin',
        message_text: replyText.trim(),
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([newMessage])
        .select('*')
        .single()

      if (error) throw error

      await supabase
        .from('admin_notifications')
        .insert([
          {
            session_id: sessionId,
            notification_type: 'new_message',
            title: 'Admin replied to a client',
            message: replyText.trim(),
          },
        ])

      setMessages((prev) => [...prev, data])
      setReplyText('')
    } catch (err) {
      console.error('Failed to send reply', err)
      setError('Unable to send reply. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Admin access required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-brand-yellow">Admin Inbox</p>
            <h1 className="text-2xl font-bold text-brand-dark">Client Conversations</h1>
            <p className="text-gray-600 text-sm">Monitor appointment requests and continue conversations in one place.</p>
          </div>
          <button
            onClick={fetchNotifications}
            className="btn-secondary border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold">Notifications</span>
              <span className="text-xs text-gray-500">{notifications.length} total</span>
            </div>
            <div className="max-h-[520px] overflow-y-auto divide-y divide-gray-100">
              {loading ? (
                <p className="p-4 text-sm text-gray-500">Loading...</p>
              ) : notifications.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">No notifications yet.</p>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleSelectNotification(notification)}
                    className={`w-full text-left p-4 transition ${
                      selectedNotification?.id === notification.id ? 'bg-brand-dark/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-brand-dark">{notification.title}</span>
                      {!notification.is_read && <span className="text-xs text-brand-red">New</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(notification.created_at)}</p>
                    {notification.message && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{notification.message}</p>
                    )}
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col min-h-[520px]">
            {selectedNotification?.session ? (
              <>
                <header className="border-b border-gray-100 pb-4 mb-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-brand-yellow">Client</p>
                  <h2 className="text-xl font-bold text-brand-dark">
                    {selectedNotification.session.client?.name || 'MacWORLD Client'}
                  </h2>
                  <div className="text-sm text-gray-600">
                    <p>{selectedNotification.session.client?.email}</p>
                    {selectedNotification.session.client?.phone_number && <p>{selectedNotification.session.client.phone_number}</p>}
                    {selectedNotification.session.device_info && (
                      <p className="mt-1">Device: {selectedNotification.session.device_info}</p>
                    )}
                    {selectedNotification.session.appointment_time && (
                      <p>Preferred time: {selectedNotification.session.appointment_time}</p>
                    )}
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {messageLoading ? (
                    <p className="text-sm text-gray-500">Loading chat...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-sm text-gray-500">No messages logged yet.</p>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow ${
                            message.sender_type === 'admin'
                              ? 'bg-brand-dark text-white'
                              : message.sender_type === 'rob'
                                ? 'bg-white border border-gray-100 text-brand-dark'
                                : 'bg-primary-50 text-brand-dark'
                          }`}
                        >
                          <p className="font-semibold text-xs mb-1">
                            {message.sender_type === 'admin' ? 'Admin' : message.sender_type === 'rob' ? 'Rob' : 'Client'}
                          </p>
                          <p>{message.message_text}</p>
                          <p className="text-[10px] text-gray-200 mt-1">{formatDateTime(message.sent_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    placeholder="Type a reply to the client..."
                    className="w-full input-base"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleSendReply}
                      disabled={sending || !replyText.trim()}
                      className="btn-primary disabled:opacity-50"
                    >
                      {sending ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a notification to view the conversation.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default AdminNotifications
