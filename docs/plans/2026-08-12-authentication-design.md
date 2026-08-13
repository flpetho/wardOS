# wardOS authentication and the identity slice

**Date:** 2026-08-12
**Status:** Agreed with the owner. Supersedes the Clerk commitment in the 2026-08-11 decision log.
**Why now:** Step 2 of the build order in `2026-08-11-mental-model-design.md`. The schema knows what a Membership is, so identity finally has something to attach to. Known defect 1 — no authentication of any kind — blocks deployment until this lands.

---

## The decision that changed

The 2026-08-11 log committed to **Clerk** for authentication. That is reversed here, in favour of **Supabase Auth with magic-link sign-in**.

The reversal cost nothing to make and would have grown more expensive every session. An audit on 2026-08-12 found no Clerk code in the project at all: one dependency in `package.json`, one environment-variable check in `proxy.ts`, and prose in four documents. Nothing imported it.

**Why Supabase Auth wins here:**

| | Clerk | Supabase Auth |
|---|---|---|
| Services to run and pay for | two | one |
| Row level security | needs Clerk's JWT wired into Supabase as a third-party provider; every policy reads a foreign claim | `auth.uid()` is native; policies are one line |
| User management UI | strong | weak |
| Organisations | built in | none |

The last two rows are Clerk's real strengths, and wardOS needs neither. Seats and memberships are deliberately **ours** — the core model is explicit that an auth provider must never hold callings, because callings change constantly and the same person holds different seats in different wards. So Clerk's org features would sit unused while its integration cost stayed fully priced.

The decisive point is the second row. Wiring Clerk into Supabase RLS was the single fiddliest task in the plan, and choosing Supabase Auth deletes it rather than solving it.

**Why magic link over Google sign-in.** Both were on the table. Google requires creating an OAuth client in Google Cloud Console; magic link requires nothing. Sessions persist identically either way — this is the point that decided it, because "magic link" wrongly suggests re-authenticating on every visit. It does not: a link is clicked once per device, and the session is then refreshed in the background indefinitely. The one genuine difference is that a rare re-authentication means opening an email app rather than tapping an existing Google session. Accepted, in exchange for zero setup.

---

## Scope

### In

- Supabase project stood up, migration applied, identity tables seeded.
- Magic-link sign-in, sign-out, and session refresh.
- Every internal route gated. Public routes stay public.
- The signed-in person resolves to a **seat**, and the seat's **area scope** drives navigation and page access.
- Row level security policies for the four identity tables.

### Out — deliberately, with reasons

| Not building | Why |
|---|---|
| Workspace switcher UI | One workspace exists. The resolver returns the correct workspace, so a switcher is additive later. Building a picker for a set of one is speculative. |
| Admin UI for adding people | The owner chose hand-added rows for now. Documented in `README.md` instead. |
| Moving domain data to Supabase | Stays step 6. Lessons, service, cleaning, commitments, program, budget and temple all remain on seed arrays. |
| Dashboard emphasis | Step 3. Needs this work as its foundation but is a separate concern. |
| Removing seats from the sidebar | The core model calls for it (`EQ Leadership` becomes a filter, not a destination), but that is step 3. Doing it here would blur two steps. |
| Release flow for personally-held commitments | Still an open question with the owner. `held_by_person_id` stays inert. |

---

## The identity chain

```
auth.users (Supabase)          — proves the email is really theirs
      │  matched on verified email, case-insensitively
      ▼
people                         — the human. The guest list.
      │  current membership (active_until is null)
      ▼
memberships ──▶ seats          — the calling, carrying areas + can_administer
      │
      ▼
workspaces                     — Oak Hills Ward
```

**The guest list is `people` + `memberships`, not the auth provider.** Anyone may request a magic link and obtain a valid Supabase session; that alone grants nothing. Access requires a `people` row whose email matches and a membership with `active_until is null`. Onboarding therefore happens in wardOS data, never in the auth provider's dashboard — the same principle that keeps callings out of Clerk.

---

## Architecture

### Data split

`lib/data.ts` keeps every domain record, synchronous and unchanged. A new `lib/identity.ts` owns what moves to Postgres: `workspaces`, `people`, `seats`, `memberships`.

Seats move to the database rather than staying as code constants. They are five rarely-changing rows, so constants would be tempting, but the schema already models them as workspace-scoped data and a future program-coordinator seat must be addable without a deploy.

The consequence is that `getSeat()`, `getHolder()` and `getSeatsWithHolders()` become async. The identity query is wrapped in React's `cache()` so any server component may call it freely while still issuing one query per request.

### The session object

```ts
type ActiveSession = {
  person: Person;
  seat: Seat;          // resolved via the current membership
  workspace: Workspace;
  areas: Area[];
  canAdminister: boolean;
};
```

`getActiveSession()` returns `null` in three distinct cases, kept separable for diagnosis even though they present identically:

1. No Supabase auth user — not signed in.
2. An auth user whose email matches no `people` row — a stranger.
3. A person with no membership where `active_until is null` — released, or never seated.

### Two gates, at different layers

**`proxy.ts`** (Next 16's renamed middleware) refreshes the session cookie, which `@supabase/ssr` requires on every request. It allows `/p/`, `/signup/`, `/sign-in` and `/auth/callback` through, and redirects everything else to `/sign-in` when no session exists.

**`app/(app)/layout.tsx`** performs the membership check, rendering a plain no-access page when `getActiveSession()` returns null.

The split is deliberate: middleware answers *are you signed in*, cheaply and without a database round trip on every request. The layout answers *are you on the guest list*, which needs a query.

### Area scoping

`AppShell` receives `areas` and omits nav items outside that scope, so the high councilor never sees Budget — the one area-level exclusion in the core model.

**Hiding a nav item is not access control.** `/budget` also carries a server-side guard returning 404 for an out-of-scope seat. A hidden link that still serves the page on direct navigation is a leak, not a permission.

### The app-shell refactor

`components/app-shell.tsx` is a client component that today calls `getSeatsWithHolders()` at **module scope** (line 55) to build `navGroups`. That cannot survive: a client component cannot query Postgres, and module-level code evaluates once at import, so the nav would be frozen at build time regardless.

It becomes presentational. The server layout resolves identity and passes `navGroups`, `session` and badge counts down as props. Drawer state stays where it is; the component simply stops deciding what the nav contains.

This is prop-threading, not redesign — the rendered output should be pixel-identical. It also removes the root cause of known defect 7, where nav badges read module-level data that could not react to edits held in component state.

### Routes added

| Route | Purpose |
|---|---|
| `/sign-in` | Email field; sends the magic link |
| `/auth/callback` | Exchanges the emailed code for a session |
| `/no-access` | Signed in, but not on the guest list |

---

## Row level security

RLS is enabled on every table today with public policies only (known defect 15), which correctly means nothing internal is readable. Now that `auth.uid()` exists, the four identity tables get authenticated policies: a signed-in user may read rows in workspaces where they hold a current membership.

**The recursion footgun.** A policy on `memberships` that itself queries `memberships` recurses infinitely — a well-known Supabase failure that surfaces as a confusing runtime error rather than a clear one. The fix is to route the lookup through a `security definer` helper function, which executes outside the caller's policy context:

```sql
create function current_person_id() returns uuid
  language sql stable security definer set search_path = public
as $$
  select id from people
  where email is not null
    and lower(email) = lower(auth.jwt() ->> 'email')
  limit 1;
$$;
```

`is_member_of(workspace_id)` follows the same shape. This is flagged prominently because it is the most likely place in this work to lose time.

Domain tables keep their existing public-only policies. They hold no live data yet, and writing authenticated policies for tables the app still reads from seed arrays would be speculative.

### Deliberate absence of the service role key

`lib/supabase.ts` currently exports `createServiceSupabaseClient`, which uses the service-role key and bypasses RLS entirely — harmless while unused, a total data leak if it ever reached a client component (known defect 16).

Nothing in this design needs it. The key is omitted from `.env.local` and the function is removed, closing defect 16 by deleting the capability rather than by documenting the hazard.

---

## Seed data

`supabase/seed.sql` creates one workspace, five seats, five people and five memberships. Ids, names, seat keys, area scopes and membership dates match `lib/data.ts` exactly so nothing shifts underfoot. Emails are **new** — the seed people currently carry none, and the guest list needs them.

**Every name is fictional except the owner's**, per CLAUDE.md rule 2, and the file carries that statement in a header comment. This is the first time the fictional seed reaches a hosted database, which is why the labelling matters more than it did in a local module.

Emails use Gmail's `+` addressing so the owner can sign in as any seat and all mail arrives in one inbox:

| Seat | Person | Email |
|---|---|---|
| President | Nathan Placeholder | `flpetho+nathan@gmail.com` |
| First Counselor | Ferenc Petho | the owner's real address |
| Second Counselor | Marcus Placeholder | `flpetho+marcus@gmail.com` |
| Secretary | Caleb Placeholder | `flpetho+caleb@gmail.com` |
| Stake High Councilor | David Placeholder | `flpetho+david@gmail.com` |

Signing in as `+david` is how the budget exclusion gets verified against a real session rather than asserted.

---

## Schema and dependency changes

| Change | Detail |
|---|---|
| `people.clerk_user_id` **dropped entirely** | See the amendment below. The migration has never been applied anywhere, so it is edited in place rather than stacked. |
| new unique index on `lower(email)` | Email now resolves a session to a person, so two rows claiming one address must be impossible rather than merely discouraged. |

### Amended during implementation, 2026-08-12: no stored auth id

This spec originally renamed `clerk_user_id` to `auth_user_id` and bound it to
`auth.users` on first sign-in. **That was wrong, and the column was dropped.**

Binding at first sign-in creates an ordering trap. Someone signs in before their
`people` row exists — perfectly likely, since the owner adds people by hand —
the binding never happens, and they stay locked out even after the row is added.
Recovery would need manual intervention nobody would know to perform.

Matching on email has no ordering at all: they sign in, see the no-access page,
the row is added, they refresh, they are in. That directly matches the owner's
stated workflow.

What makes it safe is magic-link sign-in: possession of the inbox is proven
before a session is issued, so the email in the JWT is not a self-asserted claim.

Resolution happens in the database, in `current_person_id()` — the same function
the RLS policies use, so the app and the policies cannot disagree about who you
are. It is `security definer`, which is also what breaks the policy recursion
described above.

| `Person.clerkUserId` removed | `lib/types.ts`. Email is the link; there is no stored auth id. |
| add `@supabase/ssr` | Required for cookie-based sessions in the App Router. Only `supabase-js` is installed today. |
| remove `@clerk/nextjs` | Unused. |
| `lib/supabase.ts` → `lib/supabase/{server,client,middleware}.ts` | The current single file predates the App Router split and creates plain browser clients that cannot carry a server session. |

Documents to correct, since they currently commit the project to Clerk: `PRODUCT.md`, `STATE.md` (decision log and Next up), `README.md`, and the Clerk references in `2026-08-11-mental-model-design.md`.

---

## Verification

Every row below is executed against the running app, not inferred from a passing build.

| Check | Expected |
|---|---|
| Signed out → `/dashboard` | redirects to `/sign-in` |
| Magic link to the owner's address | dashboard renders, seat reads First Counselor |
| Signed in as `+david` | Budget absent from nav |
| Signed in as `+david` → `/budget` directly | 404, not a rendered page |
| Sign in with an address on no `people` row | no-access page; no internal route reachable |
| Signed out → `/p/oak-hills/program` | still 200 |
| Signed out → `/signup/<id>` | still reachable |
| Anon key selects from `people` | zero rows |
| Sign out | session cleared; `/dashboard` redirects again |
| `pnpm typecheck` and `pnpm build` | pass |
| 390px viewport, signed in | no horizontal overflow, per the standing responsive check |

The last row is included because `app-shell.tsx` was rebuilt during the 2026-08-11 design work and verified clean at 390px. This work touches it, so that verification is re-run rather than assumed to hold.

---

## Open questions this does not close

1. **Personal commitments.** `held_by_person_id` stays inert. The release flow that would surface *"Ferenc personally held 2 items — still valid for his successor?"* remains unbuilt and undecided.
2. **Workspace scope above organisation scope.** Deferred 2026-08-11. Nothing here blocks it; the workspace resolver is a single function to change.
3. **Rotating the database password.** It sat briefly in a git-ignored file and was shared in a chat transcript. No leak occurred, but rotation before any second person has repository access is prudent.
