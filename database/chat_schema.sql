-- Clients table stores unique customer identities based on email
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  phone_number text,
  address text,
  status text not null default 'active',
  is_new boolean not null default true,
  created_at timestamptz not null default now()
);

-- Chat sessions capture a single conversation thread with Rob/admin
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  status text not null default 'active',
  appointment_scheduled boolean not null default false,
  appointment_date timestamptz,
  appointment_time text,
  device_info text,
  service_type text,
  notes text
);

create index if not exists chat_sessions_client_id_idx on public.chat_sessions (client_id);

-- Individual chat messages for the session
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  sender_type text not null check (sender_type in ('client','rob','admin')),
  message_text text not null,
  sent_at timestamptz not null default now(),
  read_by_admin boolean not null default false
);

create index if not exists chat_messages_session_id_idx on public.chat_messages (session_id);

-- Notifications surfaced to admins for new clients, appointments, etc.
create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions(id) on delete set null,
  notification_type text not null check (notification_type in ('new_client','new_message','appointment_request','appointment_confirmed')),
  title text not null,
  message text,
  priority text not null default 'medium',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists admin_notifications_is_read_idx on public.admin_notifications (is_read);
