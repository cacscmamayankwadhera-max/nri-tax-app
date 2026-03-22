-- ═══ NRI Tax Suite Database Schema ═══
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ═══ Users / Team ═══
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text check (role in ('admin','partner','senior','preparer','client')) default 'preparer',
  firm_name text default 'MKW Advisors',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══ Cases ═══
create table public.cases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  -- Client info
  client_name text not null,
  client_email text,
  client_phone text,
  country text not null,
  
  -- Filing context
  fy text not null default '2025-26',
  ay text not null default '2026-27',
  classification text check (classification in ('Green','Amber','Red')) default 'Green',
  status text check (status in ('intake','in_progress','review','findings_ready','filing','filed','closed')) default 'intake',
  
  -- Intake form data (full JSON)
  intake_data jsonb not null default '{}',
  
  -- Computed fields
  modules_completed integer default 0,
  service_tier text,
  pricing_band text,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  filed_at timestamptz
);

alter table public.cases enable row level security;
create policy "Users can view own cases" on public.cases for select using (auth.uid() = user_id);
create policy "Users can create cases" on public.cases for insert with check (auth.uid() = user_id);
create policy "Users can update own cases" on public.cases for update using (auth.uid() = user_id);

-- ═══ Module Outputs ═══
create table public.module_outputs (
  id uuid default uuid_generate_v4() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  module_id text not null, -- 'intake', 'residency', 'income', etc.
  output_text text not null,
  output_data jsonb default '{}', -- structured data from computation
  status text check (status in ('draft','reviewed','approved')) default 'draft',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  
  unique(case_id, module_id)
);

alter table public.module_outputs enable row level security;
create policy "Users can view outputs for own cases" on public.module_outputs 
  for select using (
    case_id in (select id from public.cases where user_id = auth.uid())
  );
create policy "Users can create outputs for own cases" on public.module_outputs 
  for insert with check (
    case_id in (select id from public.cases where user_id = auth.uid())
  );
create policy "Users can update outputs for own cases" on public.module_outputs 
  for update using (
    case_id in (select id from public.cases where user_id = auth.uid())
  );

-- ═══ Deliverables ═══
create table public.deliverables (
  id uuid default uuid_generate_v4() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  type text not null, -- 'cg_sheet', 'memo', 'position_report', 'engagement_quote'
  title text not null,
  file_path text, -- storage path for generated DOCX
  content_html text, -- rendered HTML for preview
  content_data jsonb default '{}', -- structured computation data
  status text check (status in ('draft','final','delivered')) default 'draft',
  delivered_at timestamptz,
  created_at timestamptz default now()
);

alter table public.deliverables enable row level security;
create policy "Users can view deliverables for own cases" on public.deliverables 
  for select using (
    case_id in (select id from public.cases where user_id = auth.uid())
  );
create policy "Users can manage deliverables for own cases" on public.deliverables 
  for all using (
    case_id in (select id from public.cases where user_id = auth.uid())
  );

-- ═══ Activity Log ═══
create table public.activity_log (
  id uuid default uuid_generate_v4() primary key,
  case_id uuid references public.cases(id) on delete cascade,
  user_id uuid references public.profiles(id),
  action text not null,
  details jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.activity_log enable row level security;
create policy "Users can view activity for own cases" on public.activity_log 
  for select using (
    case_id in (select id from public.cases where user_id = auth.uid())
  );

-- ═══ Indexes ═══
create index idx_cases_user on public.cases(user_id);
create index idx_cases_status on public.cases(status);
create index idx_cases_fy on public.cases(fy);
create index idx_module_outputs_case on public.module_outputs(case_id);
create index idx_deliverables_case on public.deliverables(case_id);
create index idx_activity_case on public.activity_log(case_id);

-- ═══ Updated_at trigger ═══
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cases_updated_at before update on public.cases
  for each row execute function update_updated_at();

-- ═══ Storage bucket for deliverables ═══
insert into storage.buckets (id, name, public) 
values ('deliverables', 'deliverables', false)
on conflict do nothing;

create policy "Users can upload deliverables" on storage.objects
  for insert with check (bucket_id = 'deliverables' and auth.role() = 'authenticated');
create policy "Users can view own deliverables" on storage.objects
  for select using (bucket_id = 'deliverables' and auth.role() = 'authenticated');
