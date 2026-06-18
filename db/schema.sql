create table if not exists signup_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 3 and 80),
  email text not null unique check (char_length(email) <= 254),
  phone text not null check (char_length(phone) <= 32),
  wants_alerts boolean not null default true,
  wants_promos boolean not null default true,
  wants_fake_promo_warnings boolean not null default true,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
