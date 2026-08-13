# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — the Elders Quorum organisation of a single ward, five seats:** President, First Counselor, Second Counselor, Secretary, and the assigned **stake high councilor**. Unpaid volunteers with full-time jobs and families, serving in a calling they did not apply for and will eventually be released from. They received no training on any tool, and turnover is a permanent condition of the role: any member may be replaced at any time, and the replacement must be able to pick up the work without a handoff document.

The high councilor is a **stake officer assigned to the quorum, not a member of the presidency.** He attends presidency meetings and takes work back to the stake. He commonly serves more than one ward, so a person must be able to hold seats in multiple workspaces.

**Secondary — quorum and ward members**, who never sign in. They meet wardOS only through two public surfaces: a signup form they were texted a link to, and a Sunday program they reached by scanning a QR code in the chapel foyer.

**Future — other ward presidencies.** The product owner intends to test with his own presidency first, then pitch to other presidencies in the same ward (Relief Society, Young Men, Young Women, Primary, bishopric). This is a confirmed intent, not a shipped capability.

**Future — the bishopric, as an oversight user.** Raised by the owner 2026-08-13 after a stake presidency meeting attended with his ward EQ presidency. If several organisations use wardOS, the bishopric's need is not to run any of them but to see that **work agreed in ward council actually lands somewhere and is not lost when it moves.** That is a genuinely different job from the presidency's, and it is the strongest argument yet for a ward scope above organisation scope.

**Positioning stays EQ-first — decided 2026-08-13.** Ward council capability is a v2/v3 expansion, not a repositioning. The success criterion is unchanged: one presidency uses this for one full Sunday cycle and prefers it to the spreadsheet. Chasing the bishopric first would mean a bigger product, a top-down adoption path, and a much longer road to anyone using it at all.

### Work that crosses organisations — confirmed need, not yet built

Observed in real ward council practice and recorded 2026-08-13:

1. **Shared origin.** A ward council topic produces action items for two organisations at once — Primary and Elders Quorum, or Elders Quorum and Relief Society.
2. **Reassignment.** Something first given to Young Men turns out to belong to Elders Quorum, and has to move without vanishing.
3. **Oversight.** The bishopric needs to follow items across those moves and see what is being avoided.

Two product positions follow, both taken 2026-08-13:

- **Shared work is two commitments with a shared origin, not one commitment with two owners.** Co-ownership is a reliable way for work to disappear: if two organisations own an item, neither does. Distinct owners linked to the ward council item that spawned them keep accountability sharp while preserving the thread.
- **A transfer must leave a trace.** "This item has moved between three organisations" is exactly the signal a bishopric wants, because work that keeps moving is work nobody has accepted. That is the same reasoning that made carry-over count derived rather than stored.

**Pastoral risk rises here, and must be designed for rather than assumed.** An EQ presidency meeting is mostly logistics. Ward council is not — it discusses families, individuals and circumstances. The operational/pastoral boundary currently holds easily because the content is lessons and cleaning rotations. Ward council support raises the odds of someone typing something that must never be stored, so it needs visible guardrails at the point of entry, not a principle in a document. See rule 1 in `CLAUDE.md`.

## Product Purpose

wardOS replaces a scattered set of Google Sheets tabs, Docs, calendars, emails, and text threads with one operating dashboard for presidency work.

The core promise: **open one dashboard and know what the presidency needs to teach, plan, assign, follow up on, and publish next.**

Success is defined narrowly and behaviorally: the presidency uses it for one full Sunday cycle and prefers it to the spreadsheet.

## Positioning

wardOS is calling-specific. A general project manager or shared spreadsheet can hold the same rows, but it cannot encode the thing that makes this domain hard — **the boundary between operational coordination and confidential pastoral care.**

That boundary is the product. Lessons, cleaning rotations, service logistics, and agenda items belong here. Worthiness concerns, financial need, counseling notes, and private family circumstances never do. wardOS is the tool that knows the difference and enforces it in its data model, its import rules, and its public surfaces.

## Operating Context

**Device agnostic is a hard requirement, not a preference.** All four usage scenes are confirmed as real and roughly equal in weight:

- **Phone, at church on Sunday** — short bursts between meetings, one-handed, often standing in a hallway. Checking who is teaching, pulling up the program, answering a question someone just asked.
- **Phone, throughout the week** — ad-hoc follow-up. Updating a status, checking an assignment before texting someone about it.
- **Laptop, in the bi-monthly presidency meeting** — agenda open, working down the list, assigning action items live. Dense, comparative, keyboard-driven.
- **Laptop, weekly prep** — a longer focused session building the Sunday program, scheduling lessons, or setting up a signup form.

Neither breakpoint is the "real" design and the other an adaptation. The Sunday-morning phone case and the meeting-table laptop case are equally first-class.

**Rhythms that structure the work:** a weekly Sunday cycle (lesson, program, teaching assignments), a bi-monthly presidency meeting with carried-over agenda items, and a recurring Saturday meetinghouse cleaning rotation.

**Systems it must coexist with, not replace:** official Church tools and membership records, a shared Google Sheet with multiple tabs, Google Calendar, a Google Drive folder, and a QR-code Sunday program workflow already in use.

## Capabilities and Constraints

**Committed infrastructure:** Supabase Postgres for persistence, Supabase Auth for authentication (magic-link sign-in), Vercel for deployment.

*Amended 2026-08-13.* Clerk was the committed choice on 2026-08-11 and was reversed before any Clerk code existed. Clerk's real strengths are user management and organisations; wardOS needs neither, because seats and memberships are deliberately ward data. Meanwhile the Clerk-to-Supabase row-level-security integration was the fiddliest task in the plan, and Supabase Auth deletes it rather than solving it — `auth.uid()` is native there. Full reasoning: [`docs/plans/2026-08-12-authentication-design.md`](docs/plans/2026-08-12-authentication-design.md).

**Tenancy — decided:** multi-tenant data model, single ward in production. Workspaces and workspace membership are built into the schema and the auth model from the start; only one workspace exists while the presidency tests it. Adding a second presidency later must be configuration, not a rewrite. The existing migration already carries `workspaces` and `workspace_members`.

**Core model — decided 2026-08-11.** The full record is [`docs/plans/2026-08-11-mental-model-design.md`](docs/plans/2026-08-11-mental-model-design.md). Four decisions bind future work:

1. **The spine is the commitment loop.** The presidency meeting is where work is decided; Sunday is where it lands. Lessons, service, cleaning, signups, and budget are *sources of work*, not co-equal top-level domains.
2. **Domain records are the system of record.** Gaps ("this lesson has no teacher") are computed from them and never stored, so nothing can contradict anything else.
3. **Work belongs to the seat, not the person.** A release transfers the whole queue to the successor automatically.
4. **Within the presidency, everyone sees everything.** Personal relevance is expressed as visual emphasis, never as access control. Visibility differences exist only between tiers, and only per-area — never per-record or per-person.

**Capability tiers:** three, replacing the PRD's four.

- **Steward** (President, Counselors, Secretary) — full operational control including publishing, member management, and budget.
- **Participant** (high councilor) — sees and can hold work across lessons, service, cleaning, signups, meetings, and sources. **Cannot see the budget**, and cannot administer anything.
- **Public** (no login) — published Sunday program and signup submission only. Never the internal dashboard.

Budget is the only area-level exclusion. The Secretary holds full Steward rights, including publishing the Sunday program.

**Modules in scope:** dashboard, meetings and agenda, lessons, assignments and action items, service opportunities, cleaning assignments, signup forms with public links, Sunday program builder with a public QR route, budget, sources, and admin settings.

**Explicitly out of scope:** syncing with official Church membership systems, storing membership records, full ministering management, automated email or SMS to members, a native mobile app, and two-way Google Sheets sync.

**Open — real data shape.** The production Google Sheet has not yet been provided. The current column definitions are derived from the PRD's description of the tabs, not from the sheet itself. Schema decisions that depend on real column names remain provisional, and the owner has accepted the risk of some rework when the real export arrives.

## Brand Commitments

The name **wardOS** is fixed.

**Visual direction — decided by the owner on 2026-08-11 and binding.** After reviewing two rounds of alternative visual worlds, the owner chose the category standard, executed at high craft: a clean, calm dashboard rather than a distinctive visual world. These are pinned and are not to be reopened as design questions:

- **Typeface: DM Sans.** Owner-specified.
- **White background, black type.** The content field is white; type is a near-black neutral.
- **One accent: cobalt blue** (`#1D4ED8`). Status colors — red for needs-attention, green for complete, amber for in-progress — are functional and sit outside the accent.
  - *Refined 2026-08-13, at the owner's direction.* Cobalt no longer fills buttons. Buttons are near-black pills, matching the public bulletin. Cobalt keeps a single job — **wayfinding**: active navigation, today's date, links, and focus rings. It had been doing four jobs at once, which is why it read as everywhere and meant nothing in particular. The accent is unchanged; only its scope is. See [`DESIGN.md`](DESIGN.md).
- **Craft reference: Notion.** Calm, spacious, document-like. Low chrome, hierarchy carried by type and spacing rather than by boxes and color, generous whitespace, restrained use of saturation.

Future visual work extends this system. It does not replace it without the owner reopening the decision.

Voice must stay plain and calm. This is a tool used inside a religious congregation by volunteers: it should not sound like enterprise software, and it should not sound reverent or devotional either. It is an operations tool for church work, and it should read like a capable colleague.

## Evidence on Hand

- **`./prd`** — a detailed v0 product requirements document. The most authoritative product artifact in the repository.
- **`./lib/data.ts`** — seed data. **This is invented placeholder content, not real.** "Oak Hills Ward," "Nathan Placeholder," "the Porters," and every name in it are fictional. Only "Ferenc Petho" (First Counselor) refers to a real person: the product owner. Future work must not present any of this as real ward data or carry it into production.
- **The production Google Sheet** exists but has not been shared. Its real tab and column structure is currently unknown.

**Must not be fabricated:** real member names, real ward data, adoption or usage numbers, endorsements from Church leadership, or any suggestion of official Church endorsement or affiliation. wardOS is an independent tool built by a quorum member.

## Product Principles

1. **Operational, not pastoral.** The line between coordination and confidential care is enforced in the schema, the import rules, and every public surface — never left to the user's discretion in the moment.
2. **Link out rather than copy in.** When information is sensitive, wardOS stores a pointer to the source document, never the content.
3. **Answer Sunday first.** The dashboard's job is to make the next Sunday's state obvious before anything else competes for attention.
4. **Survivable by the next volunteer.** Every screen assumes an untrained user who inherited this calling and has had no handoff. Nothing may require institutional memory to operate.
5. **Nothing internal leaks to a public URL.** Public routes render only what was deliberately published, and reveal nothing about the workspace behind them.

## Accessibility & Inclusion

No formal standard has been established by the owner. Two product-specific needs follow from the operating context and should be treated as real design constraints rather than assumptions:

- An Elders Quorum spans a wide adult age range and a correspondingly wide range of eyesight and technical comfort. Small text and low-contrast secondary information are a genuine failure mode, not a stylistic risk.
- The Sunday-morning use case is one-handed, on a phone, in a hallway, possibly in a hurry. Tap targets and reading distance matter more than density in that context.
