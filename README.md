# wardOS

wardOS is an operating dashboard for an elders quorum presidency: Sunday program,
lessons, service opportunities, cleaning assignments, signup forms, source links,
and follow-up work.

New here? Read [`CLAUDE.md`](CLAUDE.md) for the non-negotiables and
[`STATE.md`](STATE.md) for where the work actually stands.

## Current state

- Next.js 16 App Router, Tailwind CSS v4, shadcn-style local UI primitives
- **Supabase Auth (magic link) gating every internal route**
- Identity — workspaces, people, seats, memberships — persisted in Postgres
- All domain data still seeded from `lib/data.ts`
- Public routes for the Sunday bulletin and signup forms

## Local setup

```bash
pnpm install
pnpm dev
```

`.env.local` needs exactly two values, both from the Supabase dashboard under
**Project Settings → API Keys**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon / publishable key>
NEXT_PUBLIC_WARD_SLUG=oak-hills
```

The Project URL is always `https://<project-ref>.supabase.co`, and the project
ref is the last segment of the dashboard URL in your address bar.

**There is deliberately no `SUPABASE_SERVICE_ROLE_KEY`.** It bypasses row level
security entirely and nothing in wardOS needs it. Leaving it out is a security
decision, not an oversight.

Open `http://localhost:3000` — you will be redirected to sign in.

Public routes, reachable with no account:

- `http://localhost:3000/p/oak-hills/program`
- `http://localhost:3000/signup/move-assistance`

## Database

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Then seed identity. The Supabase CLI only applies `seed.sql` to a local stack, so
for a hosted project run it directly:

```bash
docker run --rm -i postgres:16-alpine \
  psql "postgresql://postgres.<ref>:<db-password>@aws-0-<region>.pooler.supabase.com:5432/postgres" \
  -v ON_ERROR_STOP=1 < supabase/seed.sql
```

`supabase/seed.sql` is idempotent. **Every name in it is fictional except the
owner's** — see rule 2 in `CLAUDE.md`.

### Verifying schema changes offline

The migration can be checked without touching a real project:

```bash
docker run -d --name pg -e POSTGRES_PASSWORD=x postgres:16-alpine
# stub the auth schema (auth.users, auth.jwt), pipe the migration in with
# ON_ERROR_STOP=1, then assert constraints with deliberately invalid inserts
```

This catches syntax and constraint errors before they reach the hosted database.

## Authentication

Supabase Auth with magic-link sign-in. **Supabase owns identity and nothing
else** — it never holds callings, which change constantly and differ per ward.

Two gates:

- `proxy.ts` refreshes the session cookie and redirects anyone without a session
  to `/sign-in`, leaving `/p/`, `/signup/`, `/sign-in` and `/auth/` public.
- `app/(app)/layout.tsx` checks the **guest list** and renders a no-access page
  for a session with no current membership.

### Adding someone

A valid session grants nothing on its own. Access needs two rows:

1. A `people` row whose `email` matches the address they will sign in with.
2. A `memberships` row joining that person to a seat, with `active_until` null.

Add both in the Supabase table editor. There is no admin UI yet. Because
resolution is by email rather than a stored auth id, order does not matter: if
they sign in first they see the no-access page, and refreshing after you add the
rows lets them straight in.

**Releasing someone** is setting `active_until` on their membership. They lose
access that day; their history survives, and commitments stay with the seat.

### Email templates

`supabase/templates/magic-link.html` is a branded sign-in email. Paste it into
**Authentication → Emails** under **both** "Magic Link" *and* "Confirm signup" —
a person's first sign-in triggers the latter, so customising only the former
leaves the stock Supabase email as the first thing anyone ever sees.

Also set **Authentication → URL Configuration**:

- Site URL: your deployment origin (`http://localhost:3000` in development)
- Redirect URLs: add `http://localhost:3000/**` and your production origin

If a redirect target is not on the allow list, Supabase does not error — it
quietly falls back to the Site URL, and the link appears to do nothing.

> Supabase's built-in email service is rate-limited and intended for development
> only. Configure custom SMTP before real members rely on this.

## Commands

```bash
pnpm dev         # dev server, port 3000 (sometimes 3001)
pnpm build       # must pass before any commit
pnpm typecheck   # must pass before any commit
```

`pnpm lint` is broken: `next lint` was removed in Next 16.

## Deployment

Live on Vercel, production branch `main`.

| | |
|---|---|
| App | https://ward-os-eight.vercel.app |
| Public bulletin | https://ward-os-eight.vercel.app/p/oak-hills/program |
| Vercel project | `ward-os` |
| Domain owned, not yet attached | `ward-os.com` |

The same three environment variables must be set in Vercel for **Production,
Preview and Development**.

**They are required at build time, not just runtime.** `supabaseEnv()` throws
before `cookies()` is reached, so Next never learns the page is dynamic and
treats it as a prerender failure — the build aborts on `/budget` with an error
that points at `.env.local`, which is misleading on Vercel. This is deliberate:
the build refuses to ship an app that cannot authenticate.

Vercel warns that a `NEXT_PUBLIC_*` variable containing "KEY" may be unsafe.
For the anon key that is a name-pattern heuristic, not an evaluation — row level
security is what protects the data, verified returning nothing from seven
internal tables. Leave **Sensitive off**: every `NEXT_PUBLIC_` value is inlined
into the client bundle regardless, so marking it sensitive only hides it from
you.

When attaching `ward-os.com`, update **Supabase → Authentication → URL
Configuration** in the same sitting: Site URL to the new origin, and add
`https://ward-os.com/**` to Redirect URLs **while keeping**
`http://localhost:3000/**`. Otherwise production magic links redirect people to
localhost.
