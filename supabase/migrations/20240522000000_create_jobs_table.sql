-- Create jobs table
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text not null check (type in ('MAGNET', 'DIRECT')),
  status text not null default 'PENDING' check (status in ('PENDING', 'DOWNLOADING', 'UPLOADING', 'COMPLETED', 'FAILED')),
  source_url text not null,
  bunny_video_id text,
  progress integer default 0,
  metadata jsonb default '{}'::jsonb,
  error_message text,
  user_id uuid references auth.users not null
);

-- Enable Realtime
alter publication supabase_realtime add table public.jobs;

-- Policies (Example: Allow authenticated users to view/create jobs)
alter table public.jobs enable row level security;

create policy "Enable read access for authenticated users"
on public.jobs for select
to authenticated
using (true);

create policy "Enable insert for authenticated users"
on public.jobs for insert
to authenticated
with check (true);

create policy "Enable update for service role"
on public.jobs for update
to service_role
using (true);
