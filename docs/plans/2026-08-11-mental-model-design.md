# wardOS core model

**Date:** 2026-08-11
**Status:** Agreed with the owner. Supersedes the implicit model in the current code.
**Why now:** Settled before Clerk integration, because identity reorganises the hierarchy and building it twice would be wasteful.

---

## The problem this solves

wardOS was built as **a set of domain trackers with a roll-up on top** — lessons, service, cleaning, meetings, budget, signups, each a peer in the nav and a peer card on the dashboard. That structure is why the interface reads as flat: everything looks equally important because structurally everything *is*.

Three symptoms:

1. **Three panels pretending to be peers.** EQ Leadership, Assignments, and Meeting Agenda share a visual treatment but are different kinds of object — one of them (EQ Leadership) isn't a dataset at all, it's a pivot on the other two.
2. **Two competing "what needs doing" surfaces.** "Publish Sunday program" appears in both *Needs attention* and *Assignments*, with no way to tell which is authoritative.
3. **Meeting Mode doesn't exist.** The PRD's Flow 3 is the highest-value flow in the product and `/meetings` is a static page.

---

## Four foundational decisions

### 1. The spine is the commitment loop

Two events anchor everything:

- **The presidency meeting** is where work is *decided*. Bi-monthly.
- **Sunday** is where work *lands*. Weekly.

Commitments are the thread between them. Lessons, service, cleaning, signups, and budget stop being top-level peers and become **sources of work** that feed the loop.

### 2. Domain records are the system of record; gaps are derived

The only real record that "the July 26 lesson has no teacher" is **the lesson itself**, with an empty teacher field. wardOS computes the gap by reading it. Gaps are never stored.

This kills a whole class of bug. Under the old model the same fact lived in four places — the lesson record, an agenda item, an assignment, and the dashboard's attention list — and they could disagree. Someone could mark "Confirm July 26 teacher" complete while the lesson still had no teacher. The first time a presidency sees that contradiction, they stop trusting the app.

### 3. Work belongs to the seat, not the person

`ownerRole: "eq2"` was right. When Marcus is released and Brother Nielsen is called as Second Counselor, Nielsen signs in and inherits the whole queue. Nothing to reassign, nothing orphaned.

This directly serves the product principle *survivable by the next volunteer*. Turnover is a permanent condition of a calling, not an exception.

**Known cost:** genuinely personal commitments ("Ferenc said he'd call Brother Porter") don't fit cleanly. Accepted.

### 4. Within the presidency, everyone sees everything; relevance is emphasis, not access

All **Steward-tier** members see the same dashboard. Personal relevance is expressed by **visual weight** — your items loud, the rest of the presidency's work visible but quieter. Nobody in the presidency is hidden from anything; you just aren't asked to carry it.

This is a large simplification: no per-record permissions and no sharing rules *inside the Steward tier*.

**Amended 2026-08-11:** the Participant tier is scoped. The high councilor does **not** see the quorum budget. Visibility is therefore **per-area and derived from tier** — never per-record, never per-person. That keeps the simplification intact while honouring the real distinction: he is a stake officer participating in ward operations, not a member of the presidency that stewards the ward's money.

---

## The objects

### Tier 1 — system of record

| Object | Holds |
|---|---|
| **Seat** | A calling. Permanent. Carries a `type`: presidency, secretary, or liaison. |
| **Person** | A human with a Clerk identity. |
| **Membership** | This person occupies this seat in this workspace, from this date until that date. |
| **Lesson / Cleaning / Service / Program / Signup** | The actual facts. |
| **Meeting** | A dated event with attendees and notes. |
| **Decision** | Something the presidency settled. Immutable once recorded. |

### Tier 2 — the thread

| Object | Holds |
|---|---|
| **Commitment** | One unit of work owned by a Seat, with a lifecycle. Replaces both `Assignment` and `AgendaItem`. |

### Non-object

**Gap.** Computed from Tier 1, never stored. "July 26 has no teacher." "Cleaning needs 3 more families." A Gap can be **promoted** into a Commitment when a seat takes it on; the Commitment then points back at the source record.

---

## The loop

```
proposed ──▶ on agenda ──▶ committed ──▶ done
   │                           │
   └──── dropped ◀─────────────┘
```

A Commitment enters one of three ways:

1. **Promoted from a Gap** — wardOS flags that July 26 has no teacher; Second Counselor takes it.
2. **Raised between meetings** — anyone proposes; it lands in an inbox.
3. **Created live in a meeting** — the most common case.

### "Carried over" is derived, not a status

Today it's a state someone sets by hand. It becomes computed: an item on the agenda for meeting N that is still open at meeting N+1 is carried over automatically.

This yields a **carry-over count** for free, which is a real signal — *"this has been carried three times"* tells a presidency an item is being avoided.

### The agenda builds itself

Open Gaps, carried-over Commitments, and anything proposed since the last meeting are already on the agenda. Nobody drafts it. Each item leaves the meeting in exactly one of four states: decided, committed to a seat with a due date, deferred, or dropped.

### How things close

- A Commitment promoted from a Gap **closes automatically** when the source record fills. Type the teacher's name into the lesson and both resolve.
- A free-standing Commitment closes manually, because nothing else can know.

---

## Interface consequences

### Navigation

```
NOW          Dashboard
THE LOOP     Meeting          ← real mode, not a page
             Sunday           ← program + lesson
AREAS        Lessons · Service · Cleaning · Signups · Budget · Sources
             Admin
```

**The people leave the sidebar.** EQ Leadership was never a destination; it's a filter. It becomes a chip row on the work list: `All · Mine · President · 1st · 2nd · Secretary · High Council`.

### The three panels resolve

| Was | Becomes |
|---|---|
| Assignments | *The* work list. Primary. |
| EQ Leadership | A filter control on that list. |
| Meeting agenda | Moves into Meeting Mode. Dashboard keeps a pointer: *"Next meeting July 14 — 5 items."* |

### Kanban belongs in Meeting Mode only

The four lifecycle states *are* the columns. Dragging a card across them **is** running the meeting — four men around a table on a laptop. That is the one moment in the product where a board beats a list.

The dashboard stays a list. Reading is not deciding, and a board on a phone in a chapel hallway is useless.

---

## Identity and permissions

**Clerk owns one thing: who you are.** It does not own callings — those change constantly, they are ward data, and the same person holds different seats in different wards. Putting roles in Clerk means editing the auth provider every time someone is released.

```
Person ──▶ Membership ──▶ Workspace
              │
              └──▶ Seat (+ active_from / active_until)
```

Membership does a lot of work:

- **Release and sustaining** is closing one membership and opening another. Open Commitments don't move — they were never on the person.
- **History survives.** You can see who held a seat when a decision was recorded, which matters for minutes.
- **Multi-ward liaison works for free.** A high councilor holds memberships in several workspaces and switches between them.

### The roster: five seats

| Seat | Type |
|---|---|
| President | presidency |
| First Counselor | presidency |
| Second Counselor | presidency |
| Secretary | secretary |
| Stake High Councilor | liaison |

The high councilor is new — not currently in the app. He is a stake officer assigned to the quorum, not a member of the presidency.

### Capability tiers

| Tier | Seats | Can | Cannot |
|---|---|---|---|
| **Steward** | President, Counselors, Secretary | Everything: publish, manage members, edit ward settings, delete, full budget | — |
| **Participant** | High councilor | See lessons, service, cleaning, signups, sources, meetings, and all Commitments. Hold Commitments. Appear in meetings. | **Budget** (hidden entirely — nav item and dashboard panel both). Administer anything. |
| **Public** | No login | Published Sunday program, submit a signup response. | Everything else, ever. |

Three tiers, down from the PRD's four. "Viewer" never had a real user.

**Confirmed 2026-08-11:** the Secretary holds full Steward rights, including publishing the Sunday program.

Budget is the only area-level exclusion. If others are added later they follow the same shape — tier-scoped area visibility, never per-record rules.

### Seats carry an area scope, not a tier label

Raised by the owner 2026-08-11: **ward callings outside the quorum will need access to parts of wardOS.** The concrete case is the person who runs the Sunday program. Today the Elders Quorum owns the program in wardOS, which is fine for a demo and wrong in the long run.

That person needs `/program` and nothing else — not assignments, not cleaning, not budget. Three fixed tiers cannot express that.

The generalisation is small and should be built now rather than retrofitted. A Seat declares:

```
Seat {
  key, title, type
  areas          -- 'all' | a set from a fixed enum
  can_administer -- boolean
}
```

The existing tiers become configurations of that one mechanism:

| Seat | areas | can_administer |
|---|---|---|
| President, Counselors, Secretary | all | yes |
| Stake high councilor | all except `budget` | no |
| Program coordinator *(future)* | `program` only | within program |

This stays a **capability matrix, not an access-control system**. Scope is per-area only, never per-record and never per-person; areas are a small fixed enum (`lessons`, `service`, `cleaning`, `signups`, `program`, `budget`, `meetings`, `sources`, `admin`). Roughly nine booleans per seat.

Doing this at schema time costs almost nothing. Retrofitting it after auth ships means touching every query.

### Deferred: does the Sunday program belong to the quorum at all?

The deeper question behind the same observation, and one the PRD already anticipated (§24 Q2: *"Should Sunday Program be owned by Elders Quorum, bishopric, or general ward admin users?"*).

Sacrament meeting is a **ward** artifact, not a quorum artifact. So are the building cleaning rotation and the ward calendar. The Elders Quorum owning them in wardOS is an artefact of the quorum being the first workspace built, not a claim about who they belong to.

The eventual shape is likely a **ward scope above organisation scope**, with shared artifacts (program, calendar, building cleaning) living at ward level and organisations holding a scoped seat into them. That is the same structure that lets Relief Society, Young Men, and Primary join later without duplicating the program five times.

**Not building this now.** It is v2/v3 territory and the roadmap already places multi-organisation at v3. Recorded so the near-term decision — area-scoped seats — is made in a way that does not block it.

---

## Schema deltas

Nothing is persisted yet, so this costs nothing today and would be expensive later.

| Change | Why |
|---|---|
| `leadership_roles` → **`seats`** | Add `type`; add the fifth row for the high councilor |
| `workspace_members` → **`memberships`** | Add `seat_id`, `active_from`, `active_until` |
| `assignments` + `agenda_items` → **`commitments`** | One table, one lifecycle. Add `source_type` / `source_id` for promoted Gaps |
| **new** `commitment_appearances` | Which meetings an item appeared on; carry-over count is a `COUNT(*)` |
| **no** gap table | Computed, never stored |
| fix status casing | DB says `'on_agenda'`, app says `"On agenda"`. Lowercase in DB, map on read |
| add `signup_form_id` | To `service_opportunities` and `cleaning_assignments` |
| add `temple_info` | Outstanding from the temple rail |

---

## Build order

1. **Schema + types rewrite** — free now, costly later
2. **Clerk + memberships** — identity, seats, workspace switching
3. **Emphasis on the shared dashboard** — mine loud, others quiet
4. **Meeting Mode with the board** — highest-value unbuilt flow
5. **Roll the design system across the remaining pages**

Clerk is step 2, not step 1: the schema must know what a Membership is before auth has anything to attach to.

---

## Resolved 2026-08-11

**Secretary rights.** Confirmed: full Steward, including publishing the Sunday program.

**High councilor and budget.** Confirmed: he does **not** see it. Recorded above as the one area-level exclusion.

**Gap vs. free-standing Commitment.** The test is: *is there a record with a checkable condition?* Applied to the current seed data:

| Item | Type | Closes when |
|---|---|---|
| Confirm July 26 teacher | Gap | `lesson-2.teacher` filled |
| Publish Sunday program | Gap | `program.status === 'published'` |
| Find two more volunteers for Porter move | Gap | `move-assistance` slots reach capacity |
| Review cleaning signup after Sunday | Free-standing | Manually — a review has nothing to read |
| Draft temple & family history invitation | Free-standing | Manually — **no record exists at all** |

A Gap needs something to read. Where no record exists, it must be a Commitment closed by hand.

This also validates the merge: `agenda-2` ("Porter move coverage") and `agenda-3` ("July 26 teacher still needed") are duplicates of Gaps already computable from the lesson and signup records. Under this model they cease to exist.

## Open question: personal commitments

Work belongs to seats. That is right for the overwhelming majority of quorum work, but it breaks for commitments made *because of who someone is* rather than what seat they hold.

### The example

In a presidency meeting, working through the Porter move:

> **Ferenc:** "I'll call Brother Porter tonight — I know him from work, he'll tell me straight what time they actually need us."

wardOS records a Commitment owned by **First Counselor**, due tomorrow.

That is fine while Ferenc holds the seat. Now play the release forward:

1. Sunday: Ferenc is released. Brother Nielsen is sustained as First Counselor.
2. Monday: Nielsen signs in for the first time and inherits the queue — correctly, by design, including *"Call Brother Porter tonight."*
3. Nielsen has never met Brother Porter. He does not know why this was anyone's job, that the two men work together, or that the whole point was an honest answer only Ferenc would get.

The task transferred. The **reason** did not. Nielsen is left with an instruction from nobody, and the most likely outcome is that he quietly drops it — which is exactly the failure mode seat-ownership was supposed to prevent.

The general shape: *some work is assigned because of a relationship, and a relationship does not transfer with a calling.*

### Proposed fix

An optional `held_by_person_id` alongside `seat_id`:

- The **seat still owns** the Commitment, so nothing orphans and the queue stays intact.
- The person is recorded as who actually took it on.
- On release, any personally-held item is **flagged rather than silently transferred**: *"Ferenc personally held 2 items. Still valid for Nielsen, or close them out?"*

Cost is one nullable column and one prompt that fires only on a release. The alternative is to leave it out and rely on people writing the context into the item's detail field, which volunteers will not reliably do.

**Awaiting owner decision.**
