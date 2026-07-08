create extension if not exists "pgcrypto";

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique,
  name text not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('admin', 'presidency_member', 'viewer')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists leadership_roles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  role_key text not null check (role_key in ('eqp', 'eq1', 'eq2', 'eqs')),
  title text not null,
  person_name text,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, role_key)
);

create table if not exists leadership_responsibilities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  leadership_role_id uuid not null references leadership_roles(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  type text not null,
  name text not null,
  url text,
  sensitivity text not null check (sensitivity in ('safe', 'review', 'sensitive', 'excluded')),
  treatment text not null default 'link_only',
  created_at timestamptz not null default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  date date not null,
  topic text not null,
  source_material text,
  teacher text,
  backup_teacher text,
  status text not null,
  notes text,
  source_id uuid references sources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  description text,
  owner text,
  owner_role text check (owner_role in ('eqp', 'eq1', 'eq2', 'eqs')),
  due_date date,
  status text not null,
  related_type text,
  related_id uuid,
  responsibility text,
  source_id uuid references sources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists service_opportunities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  description text,
  service_date date,
  location text,
  owner text,
  owner_role text check (owner_role in ('eqp', 'eq1', 'eq2', 'eqs')),
  responsibility text,
  needed text,
  status text not null,
  source_id uuid references sources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cleaning_assignments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  cleaning_date date not null,
  start_time text,
  families_needed integer not null default 0,
  assigned_families text[] not null default '{}',
  confirmed_families text[] not null default '{}',
  notes text,
  status text not null,
  owner_role text check (owner_role in ('eqp', 'eq1', 'eq2', 'eqs')),
  responsibility text,
  source_id uuid references sources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists signup_forms (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  description text,
  public_slug text not null unique,
  related_type text not null check (related_type in ('service', 'cleaning', 'activity')),
  related_id uuid,
  status text not null check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists signup_slots (
  id uuid primary key default gen_random_uuid(),
  signup_form_id uuid not null references signup_forms(id) on delete cascade,
  title text not null,
  description text,
  quantity_needed integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists signup_responses (
  id uuid primary key default gen_random_uuid(),
  signup_form_id uuid not null references signup_forms(id) on delete cascade,
  signup_slot_id uuid references signup_slots(id) on delete set null,
  name text not null,
  email text,
  phone text,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  meeting_date date not null,
  title text not null,
  cadence text,
  status text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists meeting_sections (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists agenda_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  meeting_id uuid references meetings(id) on delete set null,
  title text not null,
  detail text,
  owner_role text check (owner_role in ('eqp', 'eq1', 'eq2', 'eqs')),
  responsibility text,
  status text not null check (status in ('proposed', 'on_agenda', 'carried_over', 'decided', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  meeting_id uuid references meetings(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists budget_categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  year integer not null,
  name text not null,
  allocated numeric(10, 2) not null default 0,
  spent numeric(10, 2) not null default 0,
  pending numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sunday_programs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  program_date date not null,
  status text not null check (status in ('draft', 'ready_for_review', 'published', 'archived')),
  presiding text,
  conducting text,
  opening_hymn text,
  opening_prayer text,
  ward_business text,
  sacrament_hymn text,
  speakers text[] not null default '{}',
  intermediate_hymn text,
  closing_hymn text,
  closing_prayer text,
  announcements text[] not null default '{}',
  upcoming_events text[] not null default '{}',
  lesson_schedule text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists import_batches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  source_id uuid references sources(id) on delete set null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists import_candidates (
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid not null references import_batches(id) on delete cascade,
  candidate_type text not null,
  raw_data jsonb not null default '{}',
  mapped_data jsonb not null default '{}',
  status text not null check (status in ('pending_review', 'approved', 'ignored', 'marked_sensitive', 'needs_editing')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table workspaces enable row level security;
alter table users enable row level security;
alter table workspace_members enable row level security;
alter table leadership_roles enable row level security;
alter table leadership_responsibilities enable row level security;
alter table sources enable row level security;
alter table lessons enable row level security;
alter table assignments enable row level security;
alter table service_opportunities enable row level security;
alter table cleaning_assignments enable row level security;
alter table signup_forms enable row level security;
alter table signup_slots enable row level security;
alter table signup_responses enable row level security;
alter table meetings enable row level security;
alter table meeting_sections enable row level security;
alter table agenda_items enable row level security;
alter table decisions enable row level security;
alter table budget_categories enable row level security;
alter table sunday_programs enable row level security;
alter table import_batches enable row level security;
alter table import_candidates enable row level security;

create policy "Public can read published programs"
  on sunday_programs for select
  using (status = 'published');

create policy "Public can read open signup forms"
  on signup_forms for select
  using (status = 'open');

create policy "Public can read open signup slots"
  on signup_slots for select
  using (
    exists (
      select 1 from signup_forms
      where signup_forms.id = signup_slots.signup_form_id
      and signup_forms.status = 'open'
    )
  );

create policy "Public can submit signup responses"
  on signup_responses for insert
  with check (
    exists (
      select 1 from signup_forms
      where signup_forms.id = signup_responses.signup_form_id
      and signup_forms.status = 'open'
    )
  );
