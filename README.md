# wardOS

wardOS is a local-first prototype for ward-level operating coordination: Sunday program, lessons, service opportunities, cleaning assignments, signup forms, source links, and follow-up work.

## Current State

- Next.js App Router prototype
- Tailwind CSS v4 styling
- shadcn-style local UI primitives
- Fake data in `lib/data.ts`
- Public routes for Sunday program and signup forms
- Supabase schema in `supabase/migrations`
- Clerk-ready env placeholders, with auth enforcement intentionally disabled until keys are added

## Local Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000/dashboard`.

Public routes:

- `http://localhost:3000/p/oak-hills/program`
- `http://localhost:3000/signup/move-assistance`
- `http://localhost:3000/signup/july-11-cleaning`

## Supabase

Create a Supabase Hobby project, then apply:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Add these values to Vercel and local `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The first schema enables RLS and includes public read/insert policies only for published programs and open signup forms. Internal policies should be tightened after Clerk auth claims are connected.

## Clerk

Add Clerk keys when ready:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

The current proxy deliberately allows all internal routes while the prototype is local. Once Clerk is configured, replace the placeholder in `proxy.ts` with Clerk route protection.

## GitHub / Vercel

The target repository is `flpetho/wardOS`. After installing dependencies and verifying the build:

```bash
git init
git remote add origin git@github.com:flpetho/wardOS.git
git add .
git commit -m "Initial wardOS prototype"
git push -u origin main
```

Then import `flpetho/wardOS` into Vercel and set the same environment variables.
