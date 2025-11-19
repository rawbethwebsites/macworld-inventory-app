import { supabase } from './supabase'

// Helpers to persist chat sessions + notifications in Supabase

const mapRoleToSender = (role) => {
  if (role === 'assistant') return 'rob'
  if (role === 'user') return 'client'
  return 'rob'
}

export const getOrCreateClient = async ({ name, email, phone }) => {
  if (!email) throw new Error('Client email is required to save a chat session')

  const { data: existing, error: fetchError } = await supabase
    .from('clients')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

  if (existing) {
    return existing
  }

  const { data: created, error: createError } = await supabase
    .from('clients')
    .insert([
      {
        email,
        name,
        phone_number: phone || null,
        is_new: true,
        status: 'active',
      },
    ])
    .select('*')
    .single()

  if (createError) throw createError
  return created
}

export const createChatSession = async ({
  clientId,
  deviceInfo,
  serviceType,
  appointmentTime,
}) => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([
      {
        client_id: clientId,
        device_info: deviceInfo || null,
        service_type: serviceType || null,
        appointment_time: appointmentTime || null,
        appointment_scheduled: Boolean(appointmentTime),
      },
    ])
    .select('*')
    .single()

  if (error) throw error
  return data
}

export const insertMessages = async ({ sessionId, messages }) => {
  if (!messages.length) return
  const payload = messages.map((message) => ({
    session_id: sessionId,
    sender_type: mapRoleToSender(message.role),
    message_text: message.content,
  }))

  const { error } = await supabase.from('chat_messages').insert(payload)
  if (error) throw error
}

export const createAdminNotification = async ({ sessionId, title, message, type }) => {
  const { error } = await supabase.from('admin_notifications').insert([
    {
      session_id: sessionId,
      title,
      message,
      notification_type: type,
    },
  ])

  if (error) throw error
}

export const persistChatSession = async ({
  clientName,
  clientEmail,
  clientPhone,
  device,
  preferredTime,
}, messages) => {
  const client = await getOrCreateClient({ name: clientName, email: clientEmail, phone: clientPhone })
  const session = await createChatSession({
    clientId: client.id,
    deviceInfo: device,
    appointmentTime: preferredTime,
  })

  await insertMessages({ sessionId: session.id, messages })

  await createAdminNotification({
    sessionId: session.id,
    title: `New appointment request from ${clientName}`,
    message: `${clientName} requested help with ${device} around ${preferredTime}.`,
    type: 'appointment_request',
  })

  return session
}
