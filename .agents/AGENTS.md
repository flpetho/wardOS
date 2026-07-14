# wardOS - Project Guidelines & Current State

Welcome to **wardOS**, a lightweight operating dashboard for an Elders Quorum presidency. This document serves as the persistent context for agents working on this project.

## 1. Project Context & Objectives
- **Target Audience**: Elders Quorum presidency (President, Counselors, Secretary).
- **Core Purpose**: An operational coordination layer (meetings, lessons, assignments, service, cleaning, signups, Sunday programs) that brings together presidency operations.
- **Privacy Principle**: **Operational, Not Pastoral**. No confidential pastoral notes, worthiness information, or sensitive personal records should ever be stored here.
- **Tech Stack**: Next.js, React, Tailwind CSS, TypeScript. Currently utilizing seeded local mock data in [data.ts](file:///Users/flpetho/Sites/projects/wardOS/lib/data.ts), prepared to wire up with Supabase and Clerk.

## 2. Key Directories & Components
- **`app/`**: Next.js App Router folders containing the pages/routes.
  - `/dashboard`: Main viewport, overview of assignments, budget status, upcoming activities, and calendar events.
  - `/leadership/[id]`: Specific counselor/president callings and their assigned tasks.
  - `/meetings`: Presidency agenda items and meeting coordinator.
  - `/lessons`: Quorum lesson schedule, teachers, and instructional status.
  - `/service`: Coordination of service and rescue opportunities.
  - `/cleaning`: Tracking chapel and facility cleaning assignments.
  - `/signups`: Custom signup sheet creators and links.
  - `/program`: Sunday program template (accessed via QR code).
  - `/admin`: Budget settings, workspace configurations, and data exports.
- **`components/`**: Shared React components.
  - [app-shell.tsx](file:///Users/flpetho/Sites/projects/wardOS/components/app-shell.tsx): Main layout shell containing side navigation (desktop) and top navigation (mobile).
- **`lib/`**: Data files and utilities.
  - [data.ts](file:///Users/flpetho/Sites/projects/wardOS/lib/data.ts): Local mock database structures, interfaces, and seeded arrays representing presidency work.

## 3. UI/UX & Styling Rules
- **Color Theme**: Clean, functional modern dashboard styling using Tailwind CSS. 
- **Navigation Badges**: 
  - Sub-pages/views in navigation list a count of "active" or "action-required" items.
  - The badge calculation is defined inside `getBadgeCount(href)` in [app-shell.tsx](file:///Users/flpetho/Sites/projects/wardOS/components/app-shell.tsx).
  - Counts reflect incomplete assignments, active agendas, pending teachers, open service calls, incomplete cleaning slots, active sign-up forms, and unpublished programs.

## 4. Current State & Last Completed Task
- **Commit History**: 
  - Add admin budget and calendar updates.
  - Add interactive dashboard assignments.
  - Add dashboard budget snapshot.
  - Add leadership and meeting agenda structure.
  - **Latest Change**: Updated [app-shell.tsx](file:///Users/flpetho/Sites/projects/wardOS/components/app-shell.tsx) to introduce dynamic navigation badges (desktop and mobile) that compute pending action item counts from mock database lists. Added primary theme highlights to active links.

## 5. Upcoming Tasks & Roadmap
1. **Security & Auth**: Integrate Clerk for authentication and role restriction.
2. **Persistence**: Integrate Supabase database client and schema migration tables.
3. **Responsive Details**: Ensure table layouts and list structures wrap elegantly on mobile viewports.
4. **Form Integration**: Create functional submission pipelines for sign-up sheets and sunday program drafts.
