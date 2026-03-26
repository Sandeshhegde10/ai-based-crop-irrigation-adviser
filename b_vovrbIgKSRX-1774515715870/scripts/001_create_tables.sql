-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  farm_name text,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create gardens table (fields/plots for farmers)
create table if not exists public.gardens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  location text,
  area_hectares numeric,
  soil_type text,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create plants table (plant database)
create table if not exists public.plants (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  scientific_name text,
  water_needs_ml_per_day numeric,
  optimal_soil_moisture numeric,
  growth_stage text,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create garden_plants table (junction table for plants in a garden)
create table if not exists public.garden_plants (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete cascade,
  quantity integer default 1,
  planting_date date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create irrigation schedules table
create table if not exists public.irrigation_schedules (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  garden_plant_id uuid references public.garden_plants(id) on delete cascade,
  scheduled_date date not null,
  scheduled_time time,
  water_amount_ml numeric,
  frequency_days integer,
  is_active boolean default true,
  last_executed timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create weather_logs table
create table if not exists public.weather_logs (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  temperature numeric,
  humidity numeric,
  rainfall_mm numeric,
  wind_speed_kmh numeric,
  weather_condition text,
  logged_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create chat_history table for AI interactions
create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  garden_id uuid references public.gardens(id) on delete cascade,
  message text not null,
  response text,
  message_type text, -- 'irrigation_advice', 'plant_health', 'general'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create ml_predictions table for ML model integration
create table if not exists public.ml_predictions (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  garden_plant_id uuid references public.garden_plants(id) on delete cascade,
  predicted_water_amount_ml numeric,
  soil_moisture_percentage numeric,
  confidence_score numeric,
  model_version text,
  prediction_date date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.gardens enable row level security;
alter table public.plants enable row level security;
alter table public.garden_plants enable row level security;
alter table public.irrigation_schedules enable row level security;
alter table public.weather_logs enable row level security;
alter table public.chat_history enable row level security;
alter table public.ml_predictions enable row level security;

-- Create RLS policies for profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Create RLS policies for gardens
create policy "gardens_select_own" on public.gardens for select using (auth.uid() = user_id);
create policy "gardens_insert_own" on public.gardens for insert with check (auth.uid() = user_id);
create policy "gardens_update_own" on public.gardens for update using (auth.uid() = user_id);
create policy "gardens_delete_own" on public.gardens for delete using (auth.uid() = user_id);

-- Create RLS policies for plants (public read, admin write)
create policy "plants_select_all" on public.plants for select using (true);

-- Create RLS policies for garden_plants
create policy "garden_plants_select_own" on public.garden_plants for select using (
  garden_id in (select id from public.gardens where auth.uid() = user_id)
);
create policy "garden_plants_insert_own" on public.garden_plants for insert with check (
  garden_id in (select id from public.gardens where auth.uid() = user_id)
);
create policy "garden_plants_update_own" on public.garden_plants for update using (
  garden_id in (select id from public.gardens where auth.uid() = user_id)
);
create policy "garden_plants_delete_own" on public.garden_plants for delete using (
  garden_id in (select id from public.gardens where auth.uid() = user_id)
);

-- Create RLS policies for irrigation_schedules
create policy "schedules_select_own" on public.irrigation_schedules for select using (
  garden_id in (select id from public.gardens where auth.uid() = user_id)
);
create policy "schedules_insert_own" on public.irrigation_schedules for insert with check (
  garden_id in (select id from public.gardens where auth.uid() = user_id)
);
create policy "schedules_update_own" on public.irrigation_schedules for update using (
  garden_id in (select id from public.gardens where auth.uid() = user_id)
);
create policy "schedules_delete_own" on public.irrigation_schedules for delete using (
  garden_id in (select id from public.gardens where auth.uid() = user_id)
);

-- Create RLS policies for weather_logs
create policy "weather_select_own" on public.weather_logs for select using (
  garden_id in (select id from public.gardens where auth.uid() = user_id)
);
create policy "weather_insert_own" on public.weather_logs for insert with check (
  garden_id in (select id from public.gardens where auth.uid() = user_id)
);

-- Create RLS policies for chat_history
create policy "chat_select_own" on public.chat_history for select using (auth.uid() = user_id);
create policy "chat_insert_own" on public.chat_history for insert with check (auth.uid() = user_id);

-- Create RLS policies for ml_predictions
create policy "ml_predictions_select_own" on public.ml_predictions for select using (
  garden_id in (select id from public.gardens where auth.uid() = user_id)
);
create policy "ml_predictions_insert_own" on public.ml_predictions for insert with check (
  garden_id in (select id from public.gardens where auth.uid() = user_id)
);
