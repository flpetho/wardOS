-- wardOS initial schema.
--
-- Rewritten 2026-08-11 to match the core model in
-- docs/plans/2026-08-11-mental-model-design.md. This migration has never been
-- applied to any project, so it is edited in place rather than stacked with a
-- migration that would drop tables it had just created.
--
-- Model summary:
--   * Work belongs to a SEAT (a calling), never to a person. Release transfers
--     the queue automatically.
--   * A MEMBERSHIP says which person occupies which seat, in which workspace,
--     for which period. History survives; release is a date, not a delete.
--   * COMMITMENTS merge the old assignments and agenda_items into one object
--     with a lifecycle: proposed -> on_agenda -> committed -> done | dropped.
--   * GAPS ("this lesson has no teacher") are COMPUTED from domain records and
--     deliberately have no table. Storing them lets them contradict reality.
--   * All enumerated values are lowercase snake_case. The app maps to display
--     labels on read.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Workspaces, people, seats, memberships
-- ---------------------------------------------------------------------------

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- "people" rather than "users": Supabase Auth owns identity in auth.users, this
-- table owns the human. It is also the guest list -- a valid session grants
-- nothing without a row here plus a current membership.
--
-- The link to auth.users is the EMAIL, not a stored auth user id. A stored id
-- would have to be bound at first sign-in, which creates an ordering trap: a
-- person who signs in before their row exists never gets bound, and is then
-- locked out even after an admin adds them. Matching on email has no such
-- ordering -- add the row, they refresh, they are in.
--
-- Magic-link sign-in is what makes this safe: possession of the inbox is proven
-- before a session is issued, so the email in the JWT is not a self-asserted
-- claim.
create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Email resolves a session to exactly one person, so duplicates must be
-- impossible rather than merely discouraged. Case-insensitive because mail
-- systems are, and a row typed as "Flpetho@" must not shadow "flpetho@".
create unique index if not exists people_email_unique
  on people (lower(email))
  where email is not null;

-- Areas a seat may be scoped to are enumerated inline in the check below.
-- They name the app's own modules, not user data, so they are a fixed list.
create table if not exists seats (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  key text not null,
  title text not null,
  nav_label text not null,
  seat_type text not null check (seat_type in ('presidency', 'secretary', 'liaison', 'specialist')),
  -- Area scope. A steward seat lists every area; the high councilor lists every
  -- area except budget; a future program coordinator lists only 'program'.
  areas text[] not null default '{}' check (
    areas <@ array[
      'lessons', 'service', 'cleaning', 'signups',
      'program', 'budget', 'meetings', 'sources', 'admin'
    ]::text[]
  ),
  can_administer boolean not null default false,
  summary text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, key)
);

create table if not exists seat_responsibilities (
  id uuid primary key default gen_random_uuid(),
  seat_id uuid not null references seats(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Who occupies which seat, when. Release closes a row; sustaining opens one.
create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  seat_id uuid not null references seats(id) on delete cascade,
  active_from date not null default current_date,
  active_until date,
  created_at timestamptz not null default now(),
  check (active_until is null or active_until >= active_from)
);

-- At most one person may currently hold a given seat.
create unique index if not exists memberships_one_current_holder
  on memberships (seat_id)
  where active_until is null;

create index if not exists memberships_person_idx on memberships (person_id);

-- ---------------------------------------------------------------------------
-- Sources
-- ---------------------------------------------------------------------------

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  source_type text not null,
  name text not null,
  url text,
  sensitivity text not null check (sensitivity in ('safe', 'review', 'sensitive', 'excluded')),
  treatment text not null default 'link_only',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Meetings and decisions
-- ---------------------------------------------------------------------------

create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  meeting_date date not null,
  title text not null,
  cadence text,
  status text not null check (status in ('draft', 'open', 'completed')),
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

create table if not exists meeting_attendees (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  person_id uuid references people(id) on delete set null,
  seat_id uuid references seats(id) on delete set null,
  present boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  meeting_id uuid references meetings(id) on delete set null,
  title text not null,
  description text,
  -- Recorded for minutes: who held the seat when this was decided.
  decided_by_seat_id uuid references seats(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Commitments: the merged assignment + agenda item
-- ---------------------------------------------------------------------------

create table if not exists commitments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  detail text,

  -- Ownership is by SEAT. A release therefore transfers the queue with no
  -- reassignment step and nothing orphaned.
  seat_id uuid references seats(id) on delete set null,

  -- Optionally, the person who personally took it on. The seat still owns the
  -- item; this exists so a release can FLAG personally-held work for review
  -- rather than silently handing "call Brother Porter, I know him from work"
  -- to a successor who has never met him.
  held_by_person_id uuid references people(id) on delete set null,

  state text not null default 'proposed'
    check (state in ('proposed', 'on_agenda', 'committed', 'done', 'dropped')),

  responsibility text,
  due_date date,

  -- Set when this Commitment was promoted from a computed Gap. Closing the
  -- source record closes the commitment, so the two can never disagree.
  source_type text check (source_type in ('lesson', 'cleaning', 'service', 'program', 'signup')),
  source_id uuid,

  source_document_id uuid references sources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A committed item must have an owner and a due date; that is what makes it
  -- a commitment rather than a proposal.
  check (state <> 'committed' or (seat_id is not null and due_date is not null)),
  check ((source_type is null) = (source_id is null))
);

create index if not exists commitments_seat_idx on commitments (seat_id) where state in ('proposed', 'on_agenda', 'committed');
create index if not exists commitments_source_idx on commitments (source_type, source_id);

-- Which meetings a commitment has appeared on. Carry-over is DERIVED from this
-- (count of appearances while still open), never stored as a status.
create table if not exists commitment_appearances (
  id uuid primary key default gen_random_uuid(),
  commitment_id uuid not null references commitments(id) on delete cascade,
  meeting_id uuid not null references meetings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (commitment_id, meeting_id)
);

-- ---------------------------------------------------------------------------
-- Domain records: the system of record. Gaps are computed from these.
-- ---------------------------------------------------------------------------

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lesson_date date not null,
  topic text,
  source_material text,
  teacher text,
  backup_teacher text,
  status text not null default 'needs_topic'
    check (status in ('needs_topic', 'needs_teacher', 'assigned', 'prepared', 'completed')),
  notes text,
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
  quantity_needed integer not null default 1 check (quantity_needed > 0),
  sort_order integer not null default 0,
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

create table if not exists service_opportunities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  description text,
  service_date date,
  location text,
  seat_id uuid references seats(id) on delete set null,
  responsibility text,
  needed text,
  status text not null default 'draft'
    check (status in ('draft', 'open', 'filled', 'completed', 'archived')),
  -- Was missing: the app links service to its signup form and the PRD lists it.
  signup_form_id uuid references signup_forms(id) on delete set null,
  source_id uuid references sources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cleaning_assignments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  cleaning_date date not null,
  start_time text,
  families_needed integer not null default 0 check (families_needed >= 0),
  assigned_families text[] not null default '{}',
  confirmed_families text[] not null default '{}',
  notes text,
  status text not null default 'needs_families'
    check (status in ('needs_families', 'partially_filled', 'filled', 'completed', 'archived')),
  seat_id uuid references seats(id) on delete set null,
  responsibility text,
  signup_form_id uuid references signup_forms(id) on delete set null,
  source_id uuid references sources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sunday_programs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  program_date date not null,
  status text not null default 'draft'
    check (status in ('draft', 'ready_for_review', 'published', 'archived')),
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
  updated_at timestamptz not null default now(),
  unique (workspace_id, program_date)
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

create table if not exists ward_organizations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  short_name text not null,
  status text not null check (status in ('active', 'planned', 'later')),
  leader_name text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Temple reference data for the rail. Hours are workspace-editable and carry a
-- verification date; wardOS never syncs a temple schedule.
create table if not exists temple_info (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade unique,
  name text not null,
  district text,
  address text,
  city_state_zip text,
  photo_url text,
  photo_credit text,
  official_url text,
  regular_hours jsonb not null default '[]',
  hours_verified date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists temple_closures (
  id uuid primary key default gen_random_uuid(),
  temple_info_id uuid not null references temple_info(id) on delete cascade,
  label text not null,
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

-- ---------------------------------------------------------------------------
-- Import review (PRD section 15)
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- Row level security
--
-- Two sets of policies are defined here:
--
--   * PUBLIC (role anon) -- published programs and open signup forms only.
--   * IDENTITY (role authenticated) -- the four tables the app reads to answer
--     "who is signed in and what seat do they hold".
--
-- The domain tables (lessons, service, cleaning, commitments, budget, ...) are
-- deliberately left with no authenticated policy. The app still reads them from
-- seed data in lib/data.ts, so a policy now would be speculative, and "no
-- policy" fails closed rather than open.
-- ---------------------------------------------------------------------------

alter table workspaces enable row level security;
alter table people enable row level security;
alter table seats enable row level security;
alter table seat_responsibilities enable row level security;
alter table memberships enable row level security;
alter table sources enable row level security;
alter table meetings enable row level security;
alter table meeting_sections enable row level security;
alter table meeting_attendees enable row level security;
alter table decisions enable row level security;
alter table commitments enable row level security;
alter table commitment_appearances enable row level security;
alter table lessons enable row level security;
alter table service_opportunities enable row level security;
alter table cleaning_assignments enable row level security;
alter table signup_forms enable row level security;
alter table signup_slots enable row level security;
alter table signup_responses enable row level security;
alter table sunday_programs enable row level security;
alter table budget_categories enable row level security;
alter table ward_organizations enable row level security;
alter table temple_info enable row level security;
alter table temple_closures enable row level security;
alter table import_batches enable row level security;
alter table import_candidates enable row level security;

-- ---------------------------------------------------------------------------
-- Identity helpers
--
-- Both are SECURITY DEFINER, and that is load-bearing rather than incidental.
--
-- is_member_of() reads memberships. The policy ON memberships calls
-- is_member_of(). Evaluated as the calling user that is infinite recursion, and
-- Postgres reports it as a stack-depth error that does not mention policies at
-- all. Running as the function owner bypasses RLS on the read inside the
-- function, which breaks the cycle. Same reasoning for current_person_id()
-- reading people.
--
-- search_path is pinned because a SECURITY DEFINER function without it can be
-- hijacked by a caller-controlled search_path.
-- ---------------------------------------------------------------------------

create or replace function public.current_person_id()
  returns uuid
  language sql
  stable
  security definer
  set search_path = public
as $$
  select id
  from people
  where email is not null
    and lower(email) = lower(auth.jwt() ->> 'email')
  limit 1;
$$;

create or replace function public.is_member_of(target_workspace uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
as $$
  select exists (
    select 1
    from memberships
    where memberships.workspace_id = target_workspace
      and memberships.person_id = public.current_person_id()
      -- A released person keeps their history but loses access the same day.
      and memberships.active_until is null
  );
$$;

revoke execute on function public.current_person_id() from anon;
revoke execute on function public.is_member_of(uuid) from anon;
grant execute on function public.current_person_id() to authenticated;
grant execute on function public.is_member_of(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Identity policies. Read-only: nothing in the app writes identity yet, and
-- people are added by hand in the Supabase table editor.
-- ---------------------------------------------------------------------------

create policy "Members read their own workspaces"
  on workspaces for select to authenticated
  using (public.is_member_of(id));

create policy "Members read seats in their workspaces"
  on seats for select to authenticated
  using (public.is_member_of(workspace_id));

create policy "Members read responsibilities of seats they can see"
  on seat_responsibilities for select to authenticated
  using (
    exists (
      select 1 from seats
      where seats.id = seat_responsibilities.seat_id
        and public.is_member_of(seats.workspace_id)
    )
  );

create policy "Members read memberships in their workspaces"
  on memberships for select to authenticated
  using (public.is_member_of(workspace_id));

-- People are not workspace-scoped -- membership is what ties a person to a
-- workspace -- so visibility is "someone I share a workspace with", plus
-- yourself. The self clause matters: without it a signed-in person with no
-- membership could not read their own row, and the no-access page would have
-- no name to show.
create policy "Members read people they share a workspace with"
  on people for select to authenticated
  using (
    id = public.current_person_id()
    or exists (
      select 1 from memberships m
      where m.person_id = people.id
        and public.is_member_of(m.workspace_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Public policies (role anon)
-- ---------------------------------------------------------------------------

create policy "Public can read published programs"
  on sunday_programs for select
  using (status = 'published');

create policy "Public can read open signup forms"
  on signup_forms for select
  using (status = 'open');

create policy "Public can read slots on open forms"
  on signup_slots for select
  using (
    exists (
      select 1 from signup_forms
      where signup_forms.id = signup_slots.signup_form_id
        and signup_forms.status = 'open'
    )
  );

-- Insert only. There is deliberately no public SELECT policy on responses, so
-- one member cannot read another's submission.
create policy "Public can submit signup responses"
  on signup_responses for insert
  with check (
    exists (
      select 1 from signup_forms
      where signup_forms.id = signup_responses.signup_form_id
        and signup_forms.status = 'open'
    )
  );
