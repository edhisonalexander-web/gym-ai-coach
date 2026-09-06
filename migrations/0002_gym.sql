create table if not exists profiles (
  user_id text primary key,
  display_name text,
  age integer,
  sex text,
  height_cm double precision,
  weight_kg double precision,
  goal text,
  experience text,
  days_per_week integer not null default 3,
  equipment text not null default 'peso corporal',
  is_premium boolean not null default false,
  onboarding_complete boolean not null default false,
  voice_cues boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workouts (
  id serial primary key,
  user_id text not null,
  exercise_slug text not null,
  exercise_name text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_sec integer not null default 0,
  reps integer not null default 0,
  form_score integer not null default 0,
  calories integer not null default 0,
  issues text not null default '[]',
  muscles text not null default '[]',
  source text not null default 'camera'
);
create index if not exists workouts_user_id_idx on workouts (user_id);
create index if not exists workouts_user_started_idx on workouts (user_id, started_at desc);

create table if not exists training_plans (
  id serial primary key,
  user_id text not null,
  title text not null,
  summary text not null default '',
  days text not null,
  created_at timestamptz not null default now()
);
create index if not exists training_plans_user_id_idx on training_plans (user_id);

create table if not exists body_logs (
  id serial primary key,
  user_id text not null,
  logged_at date not null default current_date,
  weight_kg double precision,
  notes text
);
create index if not exists body_logs_user_id_idx on body_logs (user_id);
