-- Demo requests from the public landing page at /.
--
-- This is the first table in wardOS that ANONYMOUS visitors write to, so its
-- policies are the opposite shape to everything above it: insert is open,
-- reading is closed to everyone.
--
-- Why no select policy at all: a demo request carries a stranger's name and
-- email. Nobody in the app needs to read them from the app, and RLS with no
-- select policy fails closed. The owner reads them in the Supabase table
-- editor, which is the same way people are added today. If a request inbox
-- ever gets built, that is the moment to add a policy, not before.
--
-- The `note` column is the pastoral risk in this table. A stranger describing
-- why they want wardOS is exactly the person most likely to type a family
-- circumstance into a free text box. Three things push against that: the form
-- labels the field as operational only, the column is length-capped so it
-- cannot become a case file, and this comment tells whoever reads the rows
-- next what to do if it happens anyway.

create table if not exists demo_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null,
  email text not null,

  -- Both optional and both free text. A calling and a unit name are
  -- operational facts, not membership records: wardOS is not storing who is in
  -- any ward, only who asked to see the tool.
  calling text,
  unit text,
  note text,

  -- Length caps are the guardrail, not validation theatre. They are generous
  -- enough for a real answer and short enough that the box cannot be mistaken
  -- for somewhere to explain a situation.
  constraint demo_requests_name_length check (char_length(name) between 1 and 120),
  constraint demo_requests_email_length check (char_length(email) between 3 and 254),
  constraint demo_requests_email_shape check (position('@' in email) > 1),
  constraint demo_requests_calling_length check (calling is null or char_length(calling) <= 120),
  constraint demo_requests_unit_length check (unit is null or char_length(unit) <= 120),
  constraint demo_requests_note_length check (note is null or char_length(note) <= 600)
);

comment on table demo_requests is
  'Requests from the public landing page. Anonymous insert, no read policy: rows are read in the Supabase table editor. Contains no ward data and must never be used to store anything pastoral.';

comment on column demo_requests.note is
  'Operational context only. If a row ever arrives carrying pastoral content, delete the content rather than keeping it, and tighten the form.';

create index if not exists demo_requests_created_at_idx
  on demo_requests (created_at desc);

alter table demo_requests enable row level security;

-- Insert is the only thing anyone may do, and it is deliberately open to anon:
-- the whole point is that a stranger with no account can reach it.
create policy "Anyone may request a demo"
  on demo_requests for insert to anon, authenticated
  with check (true);
