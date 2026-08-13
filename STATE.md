# STATE

Where wardOS actually stands. Read this first, every session.

**Last updated:** 2026-08-13

---

## Resume here

**All work lives on the branch `design-system-and-core-model`, pushed to `origin` on 2026-08-13 but not merged.** `main` still holds the original pre-redesign prototype. Merging is a decision the owner has not made yet; do not merge without asking.

**Authentication is done.** Supabase Auth with magic-link sign-in gates every internal route; identity is persisted in Postgres. **The next task is step 3, emphasis on the shared dashboard** — the signed-in seat's work loud, the rest of the presidency's quiet.

**Before touching anything, read [`docs/plans/2026-08-11-mental-model-design.md`](docs/plans/2026-08-11-mental-model-design.md).** The core model is not derivable from the code alone, and getting it wrong will produce work that has to be thrown away. For anything touching auth, also read [`docs/plans/2026-08-12-authentication-design.md`](docs/plans/2026-08-12-authentication-design.md). For anything visual, [`DESIGN.md`](DESIGN.md).

**Deployment: half-configured, and currently wrong.** Defect 1 is closed *on this branch*. The owner connected `flpetho/wardOS` to Vercel on 2026-08-13, but **this branch has never been pushed**, so Vercel is building `main` — the pre-redesign prototype whose `proxy.ts` returns `NextResponse.next()` on both paths. An unauthenticated dashboard is therefore live on a public URL. The data is fictional, so nothing sensitive leaked, but this must not stay true.

Before production works at all: push this branch, point Vercel's production branch at it (or merge), set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_WARD_SLUG` in Vercel, and add the deployed origin to Supabase's Site URL and redirect allow list. **Without the env vars every request 500s** — `proxy.ts` calls `supabaseEnv()`, which throws when they are missing. Without the redirect URL, production magic links bounce to localhost.

### Running and verifying

```bash
pnpm dev        # port 3000, sometimes 3001
pnpm typecheck  # must pass before any commit
pnpm build      # must pass before any commit
```

`pnpm lint` is broken and stays broken until defect 11 is fixed.

**You must be signed in to see anything.** `/` redirects to `/sign-in`; enter an address that has a `people` row and a current membership (see the table under Landed). The magic link arrives by email — Supabase's built-in mailer is rate-limited, so signing in as several seats in quick succession will hit the ceiling.

Key routes: `/dashboard`, `/meetings` (shows the model most clearly), `/leadership/hc` (the scoped liaison seat), `/budget` (404s for the high councilor — the one area exclusion), `/p/oak-hills/program` (the public bulletin, no sign-in needed — view at phone width).

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
6. **Cross-organisation work — designed but not scheduled.** Recorded in `PRODUCT.md` under Users and "Work that crosses organisations". The cheap half is decided (dated assignment, above); the rest is open: does a ward scope sit above organisation scope, is ward council a meeting type, how is a bishopric seat scoped across workspaces rather than across areas, and what guardrail stops pastoral content entering at the point where it is most likely to. **No schema beyond `workspaces.organization` has been built for this.**

---

## Phase

**Prototype → first real deployment.** The app is a clickable prototype that now has real authentication but still no domain persistence. The goal is a version the owner's Elders Quorum presidency can use for one full Sunday cycle.

Working today: 18 routes, `pnpm build` and `pnpm typecheck` pass clean, sign-in works end to end against a live Supabase project, every internal route is gated, and identity — workspaces, people, seats, memberships — is persisted with row level security enforcing it.

Not working today: **no domain data persists.** Lessons, service, cleaning, commitments, program, budget and temple all still come from `lib/data.ts`, so every "Add / Publish / Start meeting / New form" button remains inert and any edit dies on refresh. Meeting Mode does not exist.

The honest summary: **wardOS now knows who you are and what you may see, but still cannot remember anything you tell it.**

---

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
6. **Persistence (Supabase) and deploy (Vercel).** Not before auth exists.
7. **Reconcile the real Google Sheet.** Deferred by the owner 2026-08-11. Accepted risk: rework when real columns arrive.

Auth was deliberately step 2, not step 1 — the schema had to know what a Membership is before identity had anything to attach to. That sequencing paid off: identity attached to real tables on the first attempt.

---

## Decision log

| Date | Decision |
|---|---|
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

Found in the 2026-08-11 review. All verified by running the app, not inferred. None are fixed yet.

### Blocking deployment

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
