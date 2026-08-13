-- wardOS identity seed.
--
-- ###########################################################################
-- #  EVERY NAME AND EMAIL BELOW IS FICTIONAL EXCEPT FERENC PETHO, the       #
-- #  product owner. "Oak Hills Ward" is invented. None of this describes a  #
-- #  real ward, and none of it may be presented as real ward data or        #
-- #  carried into a production workspace. See CLAUDE.md, rule 2.            #
-- ###########################################################################
--
-- Seeds only the four IDENTITY tables. Lessons, service, cleaning,
-- commitments, program, budget and temple data still live in lib/data.ts and
-- move to Postgres in a later step.
--
-- Ids, names, seat keys, area scopes and membership dates mirror lib/data.ts
-- exactly so nothing shifts underfoot. Emails are new: seed people carried
-- none, and email is what resolves a session to a person.
--
-- The four placeholder addresses use Gmail "+" addressing on the owner's own
-- account, so he can sign in as any seat and every message lands in one inbox.
-- That is how the high councilor's budget exclusion gets verified against a
-- real session rather than asserted.
--
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- Workspace
-- ---------------------------------------------------------------------------

insert into workspaces (id, name, slug) values
  ('a0000000-0000-4000-8000-000000000001', 'Oak Hills Ward', 'oak-hills')
on conflict (id) do update set name = excluded.name, slug = excluded.slug;

-- ---------------------------------------------------------------------------
-- Seats
--
-- Stewards reach every area. The liaison seat is scoped away from budget (the
-- one area-level exclusion in the core model) and from admin.
--
-- Note what is NOT here: responsibilities, handbook focus and guardrails.
-- Those are editorial copy rather than authorization data, they have no
-- columns in this schema, and they stay in lib/data.ts keyed by seat key. The
-- database owns what decides access; code owns what is merely displayed.
-- ---------------------------------------------------------------------------

insert into seats (id, workspace_id, key, title, nav_label, seat_type, areas, can_administer, summary, sort_order) values
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   'eqp', 'President', 'President', 'presidency',
   array['lessons','service','cleaning','signups','program','budget','meetings','sources','admin']::text[],
   true,
   'Coordinates quorum direction, bishopric alignment, ministering oversight, and presidency decisions.',
   1),

  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001',
   'eq1', 'First Counselor', 'First Counselor', 'presidency',
   array['lessons','service','cleaning','signups','program','budget','meetings','sources','admin']::text[],
   true,
   'Owns Family History and Service Assignments, with agenda items and follow-up work grouped here.',
   2),

  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001',
   'eq2', 'Second Counselor', 'Second Counselor', 'presidency',
   array['lessons','service','cleaning','signups','program','budget','meetings','sources','admin']::text[],
   true,
   'Owns lessons, activities support, and cleaning coordination until the presidency refines domains.',
   3),

  ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001',
   'eqs', 'Secretary', 'Secretary', 'secretary',
   array['lessons','service','cleaning','signups','program','budget','meetings','sources','admin']::text[],
   true,
   'Owns meeting notes, agenda hygiene, action item tracking, and source links.',
   4),

  ('c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001',
   'hc', 'Stake High Councilor', 'High Councilor', 'liaison',
   array['lessons','service','cleaning','signups','program','meetings','sources']::text[],
   false,
   'Stake officer assigned to the quorum. Participates in presidency meetings and carries work back to the stake.',
   5)
on conflict (id) do update set
  key            = excluded.key,
  title          = excluded.title,
  nav_label      = excluded.nav_label,
  seat_type      = excluded.seat_type,
  areas          = excluded.areas,
  can_administer = excluded.can_administer,
  summary        = excluded.summary,
  sort_order     = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- People -- the guest list
--
-- A valid Supabase session grants nothing on its own. Access requires a row
-- here whose email matches the signed-in address, PLUS a current membership
-- below. Adding someone to wardOS means adding those two rows, never touching
-- the auth provider.
-- ---------------------------------------------------------------------------

insert into people (id, name, email) values
  ('b0000000-0000-4000-8000-000000000001', 'Nathan Placeholder', 'flpetho+nathan@gmail.com'),
  ('b0000000-0000-4000-8000-000000000002', 'Ferenc Petho',       'flpetho@gmail.com'),
  ('b0000000-0000-4000-8000-000000000003', 'Marcus Placeholder', 'flpetho+marcus@gmail.com'),
  ('b0000000-0000-4000-8000-000000000004', 'Caleb Placeholder',  'flpetho+caleb@gmail.com'),
  ('b0000000-0000-4000-8000-000000000005', 'David Placeholder',  'flpetho+david@gmail.com')
on conflict (id) do update set name = excluded.name, email = excluded.email;

-- ---------------------------------------------------------------------------
-- Memberships
--
-- active_until null means currently serving. A release sets that date rather
-- than deleting the row, so history survives and open commitments -- which are
-- owned by the seat, never the person -- stay exactly where they are.
-- ---------------------------------------------------------------------------

insert into memberships (id, workspace_id, person_id, seat_id, active_from, active_until) values
  ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', '2025-03-02', null),

  ('d0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001',
   'b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', '2025-03-02', null),

  ('d0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001',
   'b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003', '2025-03-02', null),

  ('d0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001',
   'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000004', '2025-06-15', null),

  ('d0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001',
   'b0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000005', '2026-01-11', null)
on conflict (id) do update set
  workspace_id = excluded.workspace_id,
  person_id    = excluded.person_id,
  seat_id      = excluded.seat_id,
  active_from  = excluded.active_from,
  active_until = excluded.active_until;
