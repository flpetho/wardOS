# STATE

Where wardOS actually stands. Read this first, every session.

**Last updated:** 2026-08-19

---

## Resume here

**`main` is current and deployed.** The branch `design-system-and-core-model` was fast-forwarded into `main` on 2026-08-13 (18 commits, linear history, no merge commit) and pushed. The two refs are identical. **Start new work from `main`** — that branch name stopped describing its contents several features ago.

**wardOS is live.** Authentication works end to end against a real Supabase project, and a real Vercel production deployment serves it.

| | |
|---|---|
| **Live app** | https://ward-os.com |
| **Public bulletin** | https://ward-os.com/p/oak-hills/program |
| **Supabase project** | `pjtagvpucrpybffpjkal`, West US (Oregon) |
| **Vercel project** | `ward-os` / `prj_RMElNvk0284dMMPvKkaovI4OTDp3` |
| **Vercel team** | `team_4RPD9yCS6m1a72dJBeOYfTDj` |
| **Old Vercel URL** | `ward-os-eight.vercel.app` — still assigned to Production, still resolves |

Verified on `ward-os.com` 2026-08-18: `www` 308s to the apex, `/` 307s to `/sign-in?next=%2F`, `/sign-in` 200, bulletin 200, unknown ward slug 404, `/dashboard` and `/budget` 307 to `/sign-in` with `next` preserved, plain HTTP 308s to HTTPS on both hosts, and the Let's Encrypt certificate is valid to 2026-11-17. **Sign-in itself was not re-tested on the new origin** — see "Do these first".

**The next build task is step 3, emphasis on the shared dashboard** — the signed-in seat's work loud, the rest of the presidency's quiet. But see "Do these first" below; several loose ends are cheap now and annoying later.

**Before touching anything, read [`docs/plans/2026-08-11-mental-model-design.md`](docs/plans/2026-08-11-mental-model-design.md).** The core model is not derivable from the code alone, and getting it wrong will produce work that has to be thrown away. For anything touching auth, also read [`docs/plans/2026-08-12-authentication-design.md`](docs/plans/2026-08-12-authentication-design.md). For anything visual, [`DESIGN.md`](DESIGN.md).

### Do these first

Ordered by how cheap they are now versus later. None is large.

1. **Apply migration `202608180001_demo_requests.sql` to the live Supabase project.** The landing page's demo form writes to a table that does not exist in production yet, so **every submission fails until this is applied.** The form degrades to a visible error pointing at an email address rather than looking successful, but a landing page whose only conversion action is broken is worse than no landing page. The migration was verified against a throwaway Postgres 16: all three migrations apply clean in order, and ten assertions pass including anon insert accepted, anon select/update/delete denied, and the note length boundary correct at exactly 600 characters.

2. **Update Supabase → Authentication → URL Configuration.** The domain is attached and verified, but this half was not confirmed in the same sitting. Site URL `https://ward-os.com`; Redirect URLs must include `https://ward-os.com/**`, `https://www.ward-os.com/**`, `https://ward-os-eight.vercel.app/**` and **`http://localhost:3000/**`**. Supabase does not error on an unlisted redirect — it silently sends the person to the Site URL instead, so a wrong entry reads as a dead magic link rather than a misconfiguration. **Until someone signs in at `https://ward-os.com` and lands back there, treat production sign-in as unproven.**

3. **Custom SMTP, via Resend.** Supabase locks the email-template editor unless custom SMTP is configured, so the branded sign-in email in `supabase/templates/` cannot be applied without it. It also lifts the built-in mailer's dev-only rate limit, which has been throttling multi-seat testing all along. Setup: Resend account → verify `ward-os.com` → DNS records → API key → Supabase SMTP settings (host `smtp.resend.com`, port 465, username literally `resend`, password = the API key, sender `signin@ward-os.com`). Full instructions in `supabase/templates/README.md`.

4. **Paste the email template into BOTH "Magic Link" and "Confirm signup".** A person's first sign-in triggers Confirm signup, so customising only Magic Link leaves the stock Supabase email as the first thing anyone ever sees.

5. **Verify the budget exclusion as David** — see Known defects, item 19. This is the one thing claimed but never observed.

### Environment variables

Set in Vercel for Production, Preview and Development; identical to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://pjtagvpucrpybffpjkal.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_WARD_SLUG=oak-hills
```

**These are required at BUILD time, not just runtime.** `supabaseEnv()` throws before `cookies()` is reached, so Next never learns the page is dynamic and treats it as a prerender failure — the build aborts on `/budget`. That is the correct behaviour (it refuses to ship an app with no auth) but the error message points at `.env.local`, which is misleading on Vercel.

There is deliberately **no `SUPABASE_SERVICE_ROLE_KEY`** anywhere. Vercel will warn that a `NEXT_PUBLIC_*` variable containing "KEY" may be unsafe; for the anon key that warning is a name-pattern heuristic and "Mark as Safe" is correct — RLS is what protects the data, and it was verified returning `[]` from seven internal tables. Leave "Sensitive" **off**: every `NEXT_PUBLIC_` value is inlined into the client bundle anyway, so marking it sensitive only hides it from you.

### Running and verifying

```bash
pnpm dev        # port 3000, sometimes 3001
pnpm typecheck  # must pass before any commit
pnpm build      # must pass before any commit
```

`pnpm lint` is broken and stays broken until defect 11 is fixed.

**You must be signed in to see anything**, and as of 2026-08-19 **nothing public links to `/sign-in` any more** — `/` is the landing page and carries no sign-in affordance at all, by the owner's direction. The route works; it is unadvertised, so reach it by typing or bookmarking `https://ward-os.com/sign-in`. Enter an address that has a `people` row and a current membership (see the table under Landed). The magic link arrives by email — Supabase's built-in mailer is rate-limited, so signing in as several seats in quick succession will hit the ceiling.

Key routes: `/` (the public landing page), `/sign-in` (reachable only if you know it), `/dashboard`, `/meetings` (shows the model most clearly), `/leadership/hc` (the scoped liaison seat), `/budget` (404s for the high councilor — the one area exclusion), `/p/oak-hills/program` (the public bulletin, no sign-in needed — view at phone width).

**Background dev servers get reaped in this environment.** Three times on 2026-08-13 the server stopped with no error and a clean cursor-restore escape (`ESC[?25h`). It is not a crash and not caused by concurrent builds — a build finished two minutes before one of the stops and the server kept serving. Just restart it.

### Use the right pnpm

`node_modules` was installed by **pnpm 11**; the `pnpm` on PATH is 10.33.2, and their stores are incompatible. Use `npx pnpm@11 <cmd>` for any install/add/remove, or the operation fails with a store-version error. `package.json` has no `packageManager` field to pin this — adding one would fix it permanently.

### External references

- **Figma — Ward Program bulletin.** File key `DGbXfeBGOuRcNxJ5TvVDzD`, order-of-service node `1:17`, masthead node `1:11`. Reachable through the Figma MCP server, which is configured at **user scope** and already authenticated. The frame holds three variants at identical coordinates and renders blank above ~1,400px; the December 15 variant was treated as canonical. **This was never confirmed with the owner.**
- The bulletin's source typeface is Aktiv Grotesk; the owner chose DM Sans instead. Do not reopen this.

### Questions the owner has not answered

1. Is the December 15 Figma variant the right one?
2. Should the bulletin's two header icons be the exported Figma vectors rather than the lucide substitutes currently in place?
3. Delete `.agents/AGENTS.md`? It is now actively wrong, not merely stale.
4. **Personal commitments.** `held_by_person_id` exists in the schema and one seeded commitment uses it, but the release flow that would surface *"Ferenc personally held 2 items — still valid for his successor?"* is **not built**. The column is inert until it is.
5. **A testing plan is owed.** The owner asked for one covering distinct user types and use cases, ahead of beta with his own presidency, then a second presidency, then the bishopric. Not written.
6. **`app.ward-os.com`, and tenancy in the URL — raised by the owner 2026-08-18, recommended, not built.**

   Recommended: move the app to `app.ward-os.com` and leave the apex to the landing page. It is a DNS and Vercel change with **no code change** (nothing hardcodes a host; the magic-link redirect is derived from `window.location.origin`). Two real gains: the apex stops meaning two things at once, and the session cookie scoped to `app.` stops riding along on every anonymous marketing request, which is the same instinct as rule 3. Cheaper now than after QR codes and printed links exist.

   **Not** recommended yet: a workspace segment in the path (`/w/oak-hills/...`). One workspace exists, the resolver already returns the right one, and building the segment now is speculative. It becomes real when workspace **switching** is built, which it must be eventually — the high councilor commonly serves more than one ward, and the model already allows a person to hold seats in several workspaces.

   When it does become real, the shape is almost certainly a **path** segment on `app.`, not a subdomain per ward: subdomain-per-tenant needs wildcard DNS, a wildcard certificate, and makes the session cookie story materially harder for exactly the person most likely to need two workspaces.

7. **Cross-organisation work — designed but not scheduled.** Recorded in `PRODUCT.md` under Users and "Work that crosses organisations". The cheap half is decided (dated assignment, above); the rest is open: does a ward scope sit above organisation scope, is ward council a meeting type, how is a bishopric seat scoped across workspaces rather than across areas, and what guardrail stops pastoral content entering at the point where it is most likely to. **No schema beyond `workspaces.organization` has been built for this.**

---

## Phase

**Deployed prototype → usable tool.** First real deployment happened 2026-08-13. The app has real authentication and a live production URL, but still no domain persistence. The goal is unchanged: a version the owner's Elders Quorum presidency can use for one full Sunday cycle.

Working today: 18 routes, `pnpm build` and `pnpm typecheck` pass clean, sign-in works end to end against a live Supabase project, every internal route is gated, and identity — workspaces, people, seats, memberships — is persisted with row level security enforcing it.

Not working today: **no domain data persists.** Lessons, service, cleaning, commitments, program, budget and temple all still come from `lib/data.ts`, so every "Add / Publish / Start meeting / New form" button remains inert and any edit dies on refresh. Meeting Mode does not exist.

The honest summary: **wardOS now knows who you are and what you may see, but still cannot remember anything you tell it.**

---

## Landed 2026-08-19

- **The landing page carries no sign-in link, anywhere.** Owner-directed, in two steps: the nav link went first, then the footer link.

  **The reasoning for the nav is that we were walking strangers into a wall.** `signInWithOtp` creates an auth user for any address it is given, so a visitor who accepted the invitation got a real email, a real session, and then `NoAccess`. Nothing leaked — `no-access.tsx` deliberately says nothing about who does have access — but the journey was one we caused, and it competed with the only action the page exists for.

  **The footer link was removed after the tradeoff was raised and the owner reaffirmed.** The cost is recorded rather than argued: nothing public now points at `/sign-in`, so a presidency member setting up a new phone needs the URL from somewhere other than the domain they were handed. That sits against `PRODUCT.md` principle 4, survivable by the next volunteer.

  **This is now the strongest argument for `app.ward-os.com`** (open question 6). A separate host gives the presidency something to bookmark and leaves the marketing page with nothing to hide, which dissolves the tradeoff instead of accepting it.

  **A second consequence, worth planning for and not urgent.** `/sign-in` is publicly reachable and unauthenticated, and its only current protection against being used to send mail to arbitrary addresses is that Supabase's built-in mailer is rate-limited. **Custom SMTP lifts that ceiling.** So the Resend work in "Do these first" quietly converts `/sign-in` into a small abuse surface that does not exist today. A session still grants nothing without a membership, so this is nuisance mail rather than exposure.

## Landed 2026-08-18

- **Public landing page at `/`, with a working demo request form.** wardOS had no marketing surface at all; the apex redirected straight to `/sign-in`, so the domain led to a locked door.

  **A third visual register**, recorded in `DESIGN.md`. Operate is the app, Read is the bulletin, Introduce is this. It reuses Operate's tokens and primitives so the two read as one product, but is composed for a scroll.

  **The constraint that shaped it:** every standard trust lever is forbidden here. No testimonials, no logo wall, no adoption numbers, no endorsement, and rule 4 blocks the one institution the whole audience belongs to. So the page argues from precision about the work, leads with the pastoral boundary as the differentiator, and states the absence of customers outright in "Two things worth saying plainly" rather than leaving a gap a reader would notice anyway.

  **`/` is public by EXACT match, not prefix.** `PUBLIC_EXACT` was added to `proxy.ts` alongside `PUBLIC_PREFIXES`, because `"/anything".startsWith("/")` is true for every path in the app: putting `"/"` in the prefix list would have opened the entire application while looking like a one-word change. Verified after the change that `/dashboard`, `/budget`, `/meetings` and `/admin` still 307 to `/sign-in`.

  **A signed-in person asking for `/` is redirected to `/dashboard` in middleware**, not in the page, so the page needs no database round trip of its own. The redirect is skipped when the request carries `?code=` or `?token_hash=`, otherwise a magic link arriving with a stale session would be swallowed and silently sign the person in as whoever they were before.

  **New table `demo_requests`** (migration `202608180001`) with the opposite policy shape to everything else in the schema: anonymous insert is open, and there is **no select policy at all**, so rows are read in the Supabase table editor. The `note` column is the pastoral risk in this table, and it carries three guardrails: the form labels it operational only, the column is capped at 600 characters so it cannot become a case file, and a table comment tells whoever reads the rows what to do if pastoral content arrives anyway.

  **Verified rather than inferred:** typecheck and build pass; zero horizontal overflow at 390px and 1280px measured through the DevTools Protocol; the migration applies clean to a real Postgres 16 with 10/10 assertions passing; internal routes still gated; `/sign-in` and the bulletin still 200.

  **One defect was caught by looking at it.** The module grid rendered an empty sixth cell as a bare grey rectangle: five articles in a 3-column grid where the first spanned two columns *and* two rows. Dropping the row span makes five articles fill a 3x2 grid exactly.

- **`ward-os.com` attached and canonical.** Both hosts serve from Vercel with valid certificates; `www.ward-os.com` 308s to the apex. The old `ward-os-eight.vercel.app` stays assigned to Production and keeps working, so nothing that already points at it breaks.

  **DNS is hosted at Namecheap, not Vercel** — nameservers `dns1.registrar-servers.com` / `dns2.registrar-servers.com` (BasicDNS). The apex is an **A record to `216.198.79.1`**, Vercel's current anycast address; `www` is a **CNAME to `6ec07e6669dd1a68.vercel-dns-017.com`**. That CNAME target is **account-specific and not derivable** — it is issued per domain, and the only place to recover it is Vercel's Settings → Domains screen after adding the domain. Recorded here because a rebuilt zone needs it and guessing a generic `cname.vercel-dns.com` will not work.

  **No code change was needed.** `components/sign-in-form.tsx` builds `emailRedirectTo` from `window.location.origin`, so the magic-link redirect follows whatever host the visitor is on. There is no site-URL environment variable to update, which is the reason the move cost nothing in the app.

  Vercel's own docs are unreliable on the record values — the CLI examples still print the legacy `76.76.21.21` and `cname.vercel-dns-0.com`. Only the dashboard's per-domain records table is authoritative.

## Landed 2026-08-13 → 2026-08-14

- **First real deployment.** `main` fast-forwarded to the 18-commit branch and pushed; Vercel builds `main` as production. The first build **failed** — missing env vars aborted the prerender of `/budget` — which was the correct failure rather than shipping without auth. After the three variables were added it built clean and production verified green.

- **Vercel MCP server added at user scope** (`https://mcp.vercel.com`), matching the Figma precedent — project scope would write a `.mcp.json` into the repo and hand the config to anyone cloning it. It exposes projects, deployments, build logs, runtime errors, deployment protection, domain purchase and docs search. **It cannot write environment variables or attach domains**, so those stay dashboard work. It paid for itself immediately by returning the failing build's stack trace directly.

- **`ward-os.com` purchased** (attached 2026-08-18, see above). `wardos.com` is held by a reseller at ~$1,500. `wardos.app` taken. `wardos.org` ruled out on rule 4 grounds. `.dev` rejected — non-technical readers parse "dev" as "unfinished", which is corrosive for a tool whose trust model is an emailed sign-in link. `.us` rejected — the usTLD policy forbids WHOIS privacy, so the registrant's home address would be public, and it signals US-only for a global church.

- **Budget exclusion fixed on the dashboard.** The high councilor could still read the quorum budget: the nav item was hidden and `/budget` 404'd, but the dashboard panel printed the remaining balance in full. The two surfaces that were tested passed while the actual leak sat on the most-visited page. The core model says "nav item **and** dashboard panel both"; only one had been built. The gap list is now area-filtered too — it leaks nothing today because `computeGaps()` produces no budget gaps, but it is the identical defect one step away.

## Landed 2026-08-12 → 2026-08-13

- **Authentication — Supabase Auth, magic link. Closes defect 1.**

  Reverses the 2026-08-11 Clerk commitment. The reversal was free: an audit found *no Clerk code at all* — one dependency, one env-var check, and prose. Reasoning in [`docs/plans/2026-08-12-authentication-design.md`](docs/plans/2026-08-12-authentication-design.md).

  **The Supabase project is real and live.** Ref `pjtagvpucrpybffpjkal`, West US (Oregon), linked via the CLI. The migration is applied, identity is seeded.

  **Two gates.** `proxy.ts` refreshes the session cookie and redirects anyone without a session to `/sign-in`, leaving `/p/`, `/signup/`, `/sign-in`, `/auth/` public. `app/(app)/layout.tsx` checks the guest list and renders a no-access page for a session with no current membership. Middleware answers *are you signed in*; the layout answers *are you on the list*, because that needs a query.

  **A session resolves to a person by EMAIL, not a stored auth id.** This was changed mid-build, deliberately. Binding an id at first sign-in creates an ordering trap: sign in before your row exists and you are locked out permanently even after an admin adds you. Email matching has no ordering. `people` carries a unique index on `lower(email)` so two rows cannot claim one address. Resolution happens in `current_person_id()` — the *same* function the RLS policies use, so app and policy cannot disagree about who you are.

  **RLS is live on the four identity tables** and verified: the anon key returns `[]` from all seven internal tables tested. `current_person_id()` and `is_member_of()` are `security definer`, which is load-bearing — a policy on `memberships` that reads `memberships` recurses infinitely otherwise, and Postgres reports it as a stack-depth error that never mentions policies.

  **Identity moved out of `lib/data.ts` into `lib/identity.ts`** and is now async, wrapped in React `cache()` (one query per request however many callers ask). `lib/data.ts` keeps the domain seed plus `seatCopy` — the editorial prose per seat, which has no schema. The database owns what decides access; code owns what is only displayed.

  **`app-shell.tsx` is now presentational.** It used to build its nav at module scope from the seed arrays, which could not survive seats moving to Postgres. `lib/nav.ts` builds the nav on the server, filters it by the seat's areas, and passes it down. Icons cross the boundary as string keys, since a Server Component cannot hand a function to a Client Component.

  **Seeded identity** (`supabase/seed.sql`, idempotent, every name fictional but the owner's). Gmail `+` aliases let one inbox test five seats:

  | Seat | Person | Email |
  |---|---|---|
  | President | Nathan Placeholder | `flpetho+nathan@gmail.com` |
  | First Counselor | Ferenc Petho | the owner's real address |
  | Second Counselor | Marcus Placeholder | `flpetho+marcus@gmail.com` |
  | Secretary | Caleb Placeholder | `flpetho+caleb@gmail.com` |
  | Stake High Councilor | David Placeholder | `flpetho+david@gmail.com` |

  **Verified, by running it rather than inferring:** migration applies clean to a throwaway Postgres 16 with 11/11 constraint assertions passing; applied clean to the real project; anon key blocked on 7 tables; RLS impersonation confirms Ferenc has `budget` and David does not; 7 internal routes redirect to `/sign-in` with `next` preserved; public bulletin and signup still 200; bad ward slug still 404; `GET /auth/sign-out` returns 405; typecheck and build pass. **Sign-in itself was confirmed end-to-end by the owner.**

  **Not verified yet:** signing in as `+david` and seeing Budget actually gone from the nav. The logic is proven at the database and route level; the rendered result is not.

- **Button and accent rework — 2026-08-13, owner-directed.**

  Buttons are now **near-black pills** across the app, the public bulletin, and the sign-in email. Cobalt keeps one job: **wayfinding** (active nav, today's date, links, focus rings). It had been filling buttons *and* marking navigation *and* decorating progress meters, a success tick, and a ward name.

  The bulletin's announcement button was outlined with underlined text; it is now filled with the bulletin's own ink `#404231`, white text, no underline. Fills are near-blacks, not `#000`, so each surface keeps a single ink.

  **[`DESIGN.md`](DESIGN.md) now exists**, documenting the system as built. The direction contract in `app/layout.tsx` is *still not fully discharged* — the formal finish review has not been run.

- **Branded sign-in email** at `supabase/templates/magic-link.html`. Must be pasted into **both** the "Magic Link" *and* "Confirm signup" templates — a person's first sign-in triggers the latter, so customising only the former leaves the stock Supabase email as the first thing anyone sees.

## Landed 2026-08-11 → 2026-08-12

- **Visual redesign — design system landed, not yet documented.** Two rounds of alternative visual worlds were rolled and declined; the owner took the category standard on 2026-08-11. Pinned decisions are recorded in `PRODUCT.md` under Brand Commitments: DM Sans, white field, near-black type, cobalt `#1D4ED8`, Notion as the craft reference.

  Rebuilt: `app/globals.css` (full token system), `app/layout.tsx`, all six `components/ui/` primitives, `status-badge`, `page-heading`, `app-shell` (including a real mobile drawer, replacing the horizontal pill scroller), `dashboard-calendar`, `dashboard-operations`, and the dashboard page. Other pages inherit the new primitives and improved without edits.

  Verified: typecheck and build pass, mechanical design detector returns clean, no horizontal overflow at 390px (`documentElement.scrollWidth` = 390, zero offending elements).

  **Still open:** `DESIGN.md` has not been written, and the formal finish review has not been run. The direction contract in `app/layout.tsx` is not discharged until both are done.

---

- **Temple rail (Gilbert Arizona Temple)** — added 2026-08-11 as a **persistent** right rail, not a dashboard section. It lives in `app/(app)/layout.tsx`, passed to `AppShell` as the `aside` prop, so it appears on every internal route.

  - **Desktop (`xl` / 1280px and up):** fixed full-height rail on the right, 300px, independently scrollable.
  - **Below `xl`:** rendered at the bottom of the mobile navigation drawer, so it stays reachable from any route rather than disappearing. Verified by opening the drawer under device emulation.
  - **Layout cost:** with a 260px left sidebar and a 300px right rail, content is 560px narrower. At 1280px that leaves ~640px of content, which is the tightest the calendar month grid gets. Watch this if more chrome is ever added.

  **Photo** is `img/gilbert-az-temple.png` (owner-supplied, 2164×1507), wired as a **static import** rather than a `/public` path so `next/image` gets real dimensions at build and serves resized modern-format variants plus a blur placeholder. Note the source file is 4.6 MB and is committed to git history as-is.

  Two things still deliberately open:
  - **Closures are empty on purpose.** No verifiable source published them, and inventing closure dates would send someone to a closed temple.
  - **Hours are not authoritative.** Taken from public third-party listings, shown with a visible `hoursVerified` date and a link to the official page. Nothing syncs, and editing these from Admin is not built.

  Not yet in the Supabase schema — needs a `temple_info` table (and a decision on whether the quorum temple night belongs there or in a general events table) when persistence is wired.

- **Schema and types rewritten to the core model — done 2026-08-11.**

  `supabase/migrations/202607060001_initial_schema.sql` was rewritten in place (it had never been applied anywhere) and **verified against a real Postgres 16**: it applies cleanly, and six constraint tests confirmed the model is enforced rather than merely described — invalid seat area rejected, two concurrent holders of one seat rejected, succession accepted, `committed` without an owner or due date rejected, orphaned `source_type` rejected, and a valid personally-held commitment accepted.

  Landed: `seats` (with `areas` scope and `can_administer`), `memberships` (dated, one current holder enforced by a partial unique index), `commitments` (merging `assignments` and `agenda_items`, with `held_by_person_id` and `source_type`/`source_id`), `commitment_appearances`, `temple_info`, `temple_closures`, and `meeting_attendees`. `users` became `people`, since the auth provider owns identity (Supabase Auth as of 2026-08-13).

  Gaps have **no table** and are computed in `lib/data.ts:computeGaps()`. Two former agenda items disappeared entirely because they were duplicates of computable gaps.

  All twelve consumer files were updated. Typecheck and build pass; every route returns 200.

- **Public Sunday bulletin — built 2026-08-12** from the owner's `Ward-Program` Figma file (`DGbXfeBGOuRcNxJ5TvVDzD`, node `1:17`), read via the Figma MCP server.

  This is the only surface in wardOS that is **Read** mode rather than Operate, so it deliberately carries its own typographic identity instead of the dashboard's. That does not contradict the brand commitment in `PRODUCT.md`, which was chosen for the app.

  Design language taken from the source: a single warm-olive ink `#404231` at two weights (the apparent lightness of values is *weight*, not colour), 13px rows at −0.03em, 16px Medium sub-headings, a signature two-part rule (short heavy dash, long hairline), and a 393px phone-first frame.

  **Typeface substituted:** the source is set in Aktiv Grotesk; the owner chose to stay on DM Sans, whose 500/300 map onto Aktiv's Medium/Light.

  **The model had to grow**, because a flat field set cannot express a running order. `SundayProgram` now carries `chorister`, `organist`, hymns as `{ number, title }` (they are set in different weights), a `speakingOrder` list that interleaves speakers, hymns, and musical numbers, and structured `announcements` with optional links. Standing ward info moved to `wardMeetingInfo`.

  **Known deviations from the source:**
  - The two 24×24 icons are lucide `Clock`/`Radio`, **not** the exported Figma vectors.
  - Hero artwork is the existing Gilbert Temple photo, reusing the same import as the temple rail rather than adding a second copy of a 4.6MB file. The source design used seasonal imagery; this is a stand-in the workspace actually owns. It is landscape and the slot is portrait, so `object-cover` keeps full height and crops the sides — the default centre crop keeps the spire and facade, no `object-position` tuning needed. Setting `heroImage: null` falls back to a marked placeholder at the same ratio.
  - No print stylesheet. "Bulletin" implies paper, but printing was never confirmed as a requirement.
  - The source Figma frame contains three variants at identical coordinates and renders blank above ~1,400px; the December 15 variant was used as canonical.

## Next up

Ordered by the core model agreed 2026-08-11. Read [`docs/plans/2026-08-11-mental-model-design.md`](docs/plans/2026-08-11-mental-model-design.md) before starting any of these.

1. ~~**Schema + types rewrite.**~~ **Done 2026-08-11.** See In flight above.
2. ~~**Auth + memberships.**~~ **Done 2026-08-13** with Supabase Auth rather than Clerk. Person → Membership → Seat → Workspace. Workspace switching was deliberately NOT built — one workspace exists, and the resolver already returns the right one, so a switcher is additive. Closes defect 1.
3. **Emphasis on the shared dashboard.** Everyone sees everything; the signed-in seat's work renders loud and the rest quiet. No access control inside a workspace.
4. **Meeting Mode.** The highest-value flow in the PRD (§12 Flow 3) and still entirely unbuilt. Self-building agenda, four-column board, decisions recorded.
5. **Roll the design system across the remaining twelve pages.** They inherited tokens and primitives but keep their original layouts; dates are still raw ISO outside the dashboard.
6. **Persistence (Supabase).** ~~and deploy (Vercel)~~ — **deploy done 2026-08-13.** Persistence is now the single biggest gap: identity is in Postgres, every domain record is still a seed array, so nothing a user types survives a refresh. **When implementing commitments, do not give them a plain `seat_id` column** — see the 2026-08-13 decision on dated assignment.
7. **Reconcile the real Google Sheet.** Deferred by the owner 2026-08-11. Accepted risk: rework when real columns arrive.

Auth was deliberately step 2, not step 1 — the schema had to know what a Membership is before identity had anything to attach to. That sequencing paid off: identity attached to real tables on the first attempt.

---

## Decision log

| Date | Decision |
|---|---|
| 2026-08-19 | **No sign-in link on any public page.** Owner-directed, and reaffirmed after the access cost was raised. A public sign-in invitation walks strangers into the no-access page, because `signInWithOtp` mints an auth user for any address. The presidency reaches `/sign-in` by bookmark. Accepted cost: the domain alone no longer gets a new device into the app, which is in tension with principle 4 and is best resolved by `app.ward-os.com` rather than by restoring the link. |
| 2026-08-18 | **The landing page lives at `/` on the apex, and the app stays there too.** `app.ward-os.com` was raised by the owner and is **recommended but not built** — see the open question below. Building the landing page at `/` works either way: if the app later moves to a subdomain, the apex simply keeps the page and drops the signed-in redirect. |
| 2026-08-18 | **Introduce is a third register, not a restyling of Operate.** It shares tokens, type and pill buttons so the surfaces read as one product, but a marketing page is read by a stranger scrolling, not a member glancing. Recorded because "make the landing page look like the dashboard" and "give the landing page its own look" are both wrong. |
| 2026-08-18 | **The absence of social proof is stated, not hidden.** Rules 4 and 5 forbid testimonials, adoption numbers and any endorsement, which removes every standard trust lever on a landing page. Rather than leave a gap a reader would notice, the page says plainly that wardOS is independent and not in use anywhere yet. Honesty is the only credibility available at this stage, and it is more convincing than a vague claim. |
| 2026-08-18 | **`ward-os.com` is canonical; `www` 308s to it.** Vercel's add-domain flow initially landed the reverse. Flipped on the reasoning already recorded on 2026-08-13 — distribution is QR codes and emailed links, so the shorter host is the one that gets printed, pasted and read aloud. Worth one edit at the time because the canonical host is what goes into Supabase's Site URL and into every sign-in email; changing it later means re-cutting both. |
| 2026-08-13 | **`main` is the truth again.** The feature branch was fast-forwarded in rather than run as production off a branch, because every tool assumes `main` and a branch named `design-system-and-core-model` had long stopped describing its contents. Linear history, no merge commit. |
| 2026-08-13 | **`ward-os.com` purchased.** Hyphen accepted: distribution is QR codes and emailed links, not people typing a URL from memory, so the hyphen costs less than `.org`'s false institutional signal or `.dev`'s "unfinished" read. |
| 2026-08-13 | **Fictional seed data may be publicly reachable.** The bulletin at `/p/oak-hills/program` serves invented content on a public URL. Accepted: nothing internal is exposed now that auth works, the names are invented, and the page is deliberately public. Revisit before real ward data enters. |
| 2026-08-13 | **Vercel MCP at user scope**, not project scope — same reasoning as Figma on 2026-08-12. |
| 2026-08-13 | **No `.org` domain, ever.** In the LDS world `.org` is what official Church properties use (`churchofjesuschrist.org`), so `wardos.org` invites exactly the inference rule 4 forbids. Ruled out by the owner outright. `wardos.com` is held by a reseller at ~$1,500 and is not being bought. `wardos.app` is taken. `ward-os.com` is the leading candidate, undecided. |
| 2026-08-13 | **Custom SMTP is a hard prerequisite, not polish.** Supabase locks the email-template editor unless custom SMTP is configured — their shared mailer would otherwise be a phishing relay. So a designed sign-in email and Supabase's own sender are mutually exclusive. This also fixes the dev-only rate limit that has been throttling multi-seat testing. Send from a subdomain (`send.<domain>`) so a damaged sending reputation never touches the apex. |
| 2026-08-13 | **Two acceptable outcomes, neither committed:** give wardOS to the Church, or make money from it. Recorded in `PRODUCT.md` along with the unresolved problem in the second — ward budget almost certainly cannot buy third-party software, which removes the obvious payer. Not a reason to stop; a reason not to let monetisation shape the product before one presidency has used it for a Sunday. |
| 2026-08-13 | **Auxiliary leaders are the existing area-scoped seat mechanism, not a new one.** Ward Mission Leader and Temple & Family History Leader do not report to the EQ presidency, yet an EQ seat is accountable for the effort. Area-scoped seats already cover the access half. Missing: areas for missionary work and temple/family history, and a link from an area to its accountable seat. Validates building area scope early on 2026-08-11. |
| 2026-08-13 | **Commitment ownership becomes a DATED RELATIONSHIP, not a column — when persistence lands.** Today `commitments.seat_id` is a single current value with no history. That works while the only way ownership changes is a release, because a release moves the person, not the work. It breaks for cross-organisation reassignment, where the work genuinely moves and *the fact that it moved is what oversight needs to see*. The shape mirrors `memberships` exactly: `memberships` is person ↔ seat dated; assignment becomes commitment ↔ seat dated. Transfer is closing one row and opening another, nothing is lost, and "moved three times" becomes computable like carry-over already is. **Free now, expensive to retrofit** — commitments are not persisted yet. Do not implement `seat_id` as a plain column in step 6. |
| 2026-08-13 | **Ward and organisation are separate fields.** `workspaces.name` is the ward ("Oak Hills Ward"); `workspaces.organization` is the organisation ("Elders Quorum"). They were one row's worth of meaning until now, which was harmless with one organisation and wrong with two. Migration `202608130001`. The sidebar leads with the organisation, sets the ward quiet beneath it, and demotes "wardOS" to a small label — once a second organisation exists, the product name is the least useful fact on the panel. |
| 2026-08-13 | **Positioning stays EQ-first.** Ward council and bishopric oversight are a confirmed real need but a v2/v3 expansion, not a change of target user. Chasing the bishopric first means a bigger product and a much longer road to anyone using it at all. |
| 2026-08-13 | **Shared cross-organisation work is two commitments with a shared origin, never one commitment with two owners.** Co-ownership is a reliable way for work to disappear. |
| 2026-08-13 | **Supabase Auth, not Clerk.** Reverses the 2026-08-11 infrastructure commitment, at zero code cost — no Clerk code had ever been written. Clerk's strengths are user management and organisations; wardOS deliberately keeps both as ward data in `memberships`, so its integration cost bought nothing. The Clerk→Supabase RLS wiring was the most expensive task in the plan and Supabase Auth deletes it: `auth.uid()` is native. |
| 2026-08-13 | **Magic link, not Google sign-in.** Zero setup versus a Google Cloud OAuth client. Sessions persist identically — a link is clicked once per device, not once per visit — so the only real difference is that a rare re-authentication means opening an email app. Accepted. |
| 2026-08-13 | **A session resolves to a person by email; no stored auth user id.** Binding an id at first sign-in creates an ordering trap that permanently locks out anyone who signs in before their row exists — a live risk given people are added by hand. Email matching has no ordering. Safe because magic link proves inbox possession before issuing a session. |
| 2026-08-13 | **The guest list is `people` + `memberships`, never the auth provider.** Anyone may obtain a valid session; it grants nothing. Onboarding is two rows in the database, so releasing someone is a date, not an account deletion. |
| 2026-08-13 | **No service-role key, anywhere.** It bypasses RLS entirely and nothing needs it. `lib/supabase.ts` deleted. Closes defect 16 by removing the capability rather than documenting the hazard. |
| 2026-08-13 | **Buttons are near-black pills; cobalt is wayfinding only.** Owner-directed. Refines but does not replace the 2026-08-11 brand commitment — the accent is unchanged, its scope is not. Cobalt had been doing four jobs at once. See `DESIGN.md`. |
| 2026-08-13 | **The bulletin and the app stay visually distinct.** Two registers: Operate (behind sign-in, near-black on white) and Read (the bulletin, one warm olive ink). Recorded because "unifying" them is a tempting and wrong instinct. |
| 2026-08-11 | **Multi-tenant data model, single ward in production.** Workspaces and members are built into schema and auth from day one; only one workspace exists during testing. Adding another presidency later must be configuration, not a rewrite. (Answers `prd` §24 Q1.) |
| 2026-08-11 | **Device agnostic is a hard requirement.** All four usage scenes confirmed equally real: phone at church Sunday, phone during the week, laptop in the bi-monthly presidency meeting, laptop for weekly prep. Neither breakpoint is the "real" design. |
| 2026-08-11 | **Google Sheet reconciliation deferred.** Continue on seed data; accept some schema rework later. |
| 2026-08-11 | **Committed infrastructure:** Supabase Postgres, Clerk (Google sign-in), Vercel. *Superseded 2026-08-13 — see the Supabase Auth entry above.* |
| 2026-08-11 | **Test with the owner's own EQ presidency first,** then pitch to other presidencies in the same ward. |
| 2026-08-11 | **The spine is the commitment loop.** Meeting decides, Sunday delivers, Commitments thread between. Work areas become sources of work, not co-equal domains. |
| 2026-08-11 | **Domain records are the system of record; gaps are derived and never stored.** Kills the four-copies-of-one-fact problem. |
| 2026-08-11 | **Work belongs to the seat, not the person.** Release transfers the queue automatically. |
| 2026-08-11 | **Everyone in a workspace sees everything;** relevance is visual emphasis, not access control. |
| 2026-08-11 | **Five seats, not four** — the stake high councilor joins as a `liaison`-type seat with Participant (non-administering) rights. A person may hold seats in multiple workspaces. |
| 2026-08-11 | **Assignment + AgendaItem merge into one `Commitment`** with lifecycle proposed → on agenda → committed → done. "Carried over" becomes derived, yielding a carry-over count. |
| 2026-08-11 | **Kanban belongs in Meeting Mode only,** where the lifecycle states are the columns. The dashboard stays a list. |
| 2026-08-11 | **Secretary holds full Steward rights,** including publishing the Sunday program. |
| 2026-08-11 | **The high councilor cannot see the quorum budget.** The one area-level exclusion, and an amendment to "everyone sees everything" — which now holds *within the Steward tier*. Visibility is tier-scoped and per-area, never per-record. |
| 2026-08-12 | **Stay on DM Sans.** The source bulletin design is set in Aktiv Grotesk, which is available to the owner through his existing Creative Cloud subscription via Adobe Fonts. He chose DM Sans anyway. Note the tradeoff that decided nothing here: Adobe Fonts webfonts must be served from `use.typekit.net` and cannot be self-hosted, so Aktiv would add an external runtime dependency to a tool used on chapel wifi. DM Sans self-hosts through `next/font` with zero external requests. |
| 2026-08-12 | **Figma MCP added at user scope**, not project scope — project scope would write a `.mcp.json` into this repo and hand the server config to anyone cloning it. Figma's official plugin was skipped because the `claude-plugins-official` marketplace is not registered on this machine. |
| 2026-08-11 | **Gap vs. free-standing Commitment test:** is there a record with a checkable condition? If not, it is a Commitment closed by hand. See the design doc for the classification of all current seed items. |
| 2026-08-11 | **Seats carry an area scope, not a tier label.** Raised by the owner: ward callings outside the quorum (e.g. a Sunday program coordinator) will need access to one area only. The three tiers become configurations of one mechanism — a per-area capability matrix, never per-record rules. Built at schema time because retrofitting it after auth means touching every query. |
| 2026-08-11 | **Deferred:** whether the Sunday program, ward calendar, and building cleaning belong to a ward scope above organisation scope rather than to the Elders Quorum. Answers PRD §24 Q2. Not built; recorded so area-scoped seats do not block it. |

---

## Known defects

Originally from the 2026-08-11 review, added to since. All verified by running the app, not inferred. Struck items are fixed; the rest are live.

### Blocking a real presidency using it

1. ~~**No authentication whatsoever.**~~ **Fixed 2026-08-13.** Supabase Auth gates every internal route; verified that 7 internal paths redirect to `/sign-in` and that the anon key reads nothing from 7 internal tables.
2. ~~**Public program page ignores ward slug and publish status.**~~ **Fixed 2026-08-12.** A mismatched slug now returns 404 (verified: `/p/not-a-real-ward/program` → 404, `/p/oak-hills/program` → 200), and an unpublished program renders a "not published yet" notice instead of the content. Satisfies `prd` §14.7.
3. **Signup form does not gate on status.** `getSignupForm` ignores `status === "Open"`, so a closed form still renders and accepts submissions.

### Correctness

4. ~~**DM Sans is downloaded but never applied.**~~ **Fixed 2026-08-11.** The next/font variable is now `--font-dm-sans`, so it no longer collides with the `--font-sans` declaration in `globals.css`. The app renders in DM Sans.
5. ~~**Build-time dates on statically prerendered pages.**~~ **Fixed 2026-08-11.** Both `dashboard-calendar` and `dashboard-operations` now resolve "today" in a `useEffect`, so nothing compares against the clock during a prerendered render.
6. ~~**Calendar opens on a hardcoded July 2026.**~~ **Fixed 2026-08-11.** The opening month is now derived from the first event in the data. Note this is deliberately not "the current month" — that needs a client-side date, and with all seed data in July an August default would render an empty calendar.
7. **Nav badges still don't react to edits — root cause moved, symptom remains.** Badge counts now compute on the server in `lib/nav.ts` from the model (no more `"needs"` string-matching, and no more module-scope reads), but `DashboardOperations` holds edits in React state, so marking something complete still won't move the sidebar count until a server round trip. Genuinely fixed only when domain data persists and mutations revalidate.
8. **Admin "Save local changes" is misleading.** `components/admin-console.tsx:49` writes to localStorage that nothing reads. `JSON.parse` at line 44 has no try/catch — a corrupt entry white-screens the page.
9. ~~**`data-icon` attribute is used 22 times with no CSS behind it.**~~ **Fixed 2026-08-11.** `globals.css` now implements `[data-icon]` (1rem box, no shrink, optical inline spacing), so the existing 22 call sites work as intended instead of rendering at lucide's 24px default.
10. ~~**Seed data contradicts itself.**~~ **Fixed 2026-08-11.** Service opportunities carried both a free-text `owner` and a conflicting `ownerRole`. There is now a single `seatId`, and the person is resolved from the membership, so the two cannot disagree.

### Tooling and schema

11. **`pnpm lint` is broken.** `next lint` was removed in Next 16; it now reads "lint" as a directory path.
12. **Every dependency is pinned to `"latest"`** in `package.json`. The lockfile protects today; any `pnpm update` can jump majors silently.
13. ~~**Status vocabularies disagree.**~~ **Fixed 2026-08-11.** TypeScript now uses the database's lowercase snake_case values exactly. `components/status-badge.tsx` is the single mapping point to display labels.
14. ~~**Missing `signup_form_id`.**~~ **Fixed 2026-08-11.** Added to both `service_opportunities` and `cleaning_assignments`.
15. **RLS: identity tables done, domain tables still public-policy-only.** The four identity tables have authenticated policies and are verified closed to the anon key. Domain tables deliberately have none — the app still reads them from `lib/data.ts`, so a policy now would be speculative, and "no policy" fails closed. They need policies in the same change that persists them.
16. ~~**`createServiceSupabaseClient` bypasses RLS.**~~ **Fixed 2026-08-13.** `lib/supabase.ts` deleted; the key is absent from `.env.example` and `.env.local`, with a comment saying why. Replaced by `lib/supabase/{env,server,client,middleware}.ts`, all of which carry the caller's session.
17. **No tests and no test framework.**
18. **`prd` has no file extension.** It is markdown; `prd.md` would render on GitHub.

### Added 2026-08-13

19. **The budget exclusion has never been observed in a browser.** Fixed in code 2026-08-13 and proven at two layers — RLS impersonation shows the high councilor's seat carries 7 areas without `budget`, and `/budget` calls `notFound()` for an out-of-scope seat — but nobody has signed in as `flpetho+david@gmail.com` and *looked*. Three things to check: the sidebar footer names David Placeholder / Stake High Councilor, "Budget" is absent from Work Areas, and the dashboard's Service/Cleaning row has no Budget panel. If the footer says David but Budget still appears, there is a second bug in `lib/nav.ts` that has not been found.

20. **`Badge` `default` and `info` are visually identical.** `--info` and `--primary` are both `#1d4ed8`. Now that badges carry state and cobalt means wayfinding, `default` should become `info` and the variant retire.

21. **Only `/budget` and `/admin` guard on area scope.** Every other area page relies on the nav omitting it. Correct today because no current seat is excluded from those areas, and wrong the moment a scoped seat exists — which is exactly what the auxiliary-leader work in `PRODUCT.md` implies.

---

## Notes

- **All work since 2026-08-11 is on the branch `design-system-and-core-model`, pushed 2026-08-13, not merged to `main`.** Design system, temple rail, docs and core model, schema rewrite, bulletin, then authentication and the button/accent rework. `main` still holds the pre-redesign prototype.
- `.agents/AGENTS.md` is now **actively misleading**, not merely stale — it documents `leadershipRoles`, `assignments`, and `agendaItems`, none of which exist after the model rewrite. Recommend deleting.
- Port 3000 is often occupied on the owner's machine; dev sometimes lands on 3001.

### Operational gotchas on this machine

Recording these because they cost real time to discover and are not recoverable from the code.

- **`python3` is broken** (`posix_spawn: Undefined error: 0`). Use shell tools or Node for scripting.
- **Two pnpm majors are installed and they fight.** `node_modules` came from pnpm 11 (store v11); PATH has 10.33.2 (store v10). Any `pnpm add/remove` on the PATH version fails with a store-version error. Use `npx pnpm@11`.
- **Every dependency is pinned to `"latest"`, and it bites on any install.** Removing one package on 2026-08-13 silently took TypeScript 6 → 7, Next 16.2.10 → 16.3.0, and ESLint to 10.8.1. Nothing broke, but that is luck. This is defect 12 in action.
- **The hosted Postgres is only reachable through the session pooler.** `db.<ref>.supabase.co:5432` does not connect from this machine (likely IPv6-only), and neither does the `us-west-1` pooler. What works: `aws-0-us-west-2.pooler.supabase.com:5432` with username `postgres.<ref>`. `psql` is not installed locally — run it via `docker run --rm -i postgres:16-alpine psql "<conn>"`.
- **The official Postgres image starts twice.** `initdb` runs a temporary server on a unix socket, so `pg_isready` reports ready, then the socket vanishes when the real server restarts. Poll an actual query over TCP instead, or the first command after "ready" fails.
- **Supabase silently swallows a bad redirect URL.** If `emailRedirectTo` is not on the allow list it does not error — it redirects to the Site URL instead, so the magic link appears to do nothing. `app/page.tsx` forwards a stray `?code=` to `/auth/callback` as a safety net, but the allow list should still be set.
- **The Supabase CLI keeps its access token in the macOS keychain**, so the Management API cannot be driven non-interactively. Auth settings (redirect URLs, email templates, rate limits) have to be changed in the dashboard by the owner.
- **Chrome's CLI `--screenshot` misreports the viewport.** It lays out at a wider viewport and crops to `--window-size`, which makes a correct responsive layout look like it has horizontal overflow. This produced a false "mobile is broken" diagnosis once. Use the DevTools Protocol with `Emulation.setDeviceMetricsOverride` for any responsive check; scratch scripts `shot.mjs` / `measure.mjs` do this.
- `sips -c` crops from the **centre**, not the top; `--cropOffset` is centre-relative.
- Schema changes can be verified for real: `docker run postgres:16-alpine`, pipe the migration in with `ON_ERROR_STOP=1`, then assert constraints with deliberately invalid inserts. This caught nothing broken but proved the model is enforced.
