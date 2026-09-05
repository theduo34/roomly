# Roomly — Hotel Management System Prototype

A simple prototype of a hotel management and guest booking system. Built for demo purposes — no real backend, no real payments, no real auth. Everything runs on mock data.

---

## What This Is

Roomly is a web-based prototype demonstrating the core flows of a hotel management system. It covers four user-facing experiences on the web:

- **Guest** — browse rooms, book a room, get a QR confirmation
- **Receptionist** — view arrivals, check guests in and out
- **Manager** — occupancy overview, revenue breakdown, bookings list
- **Director** — financial overview, audit log, system policy settings

This is a demo. Make it look and feel real, but keep the implementation simple.

---

## Tech Stack

Use exactly what is in `package.json`. Do not install anything new unless explicitly asked.

| Tool | Role |
|---|---|
| Next.js 16 (App Router) | Framework |
| TypeScript | Language |
| Tailwind CSS v4 | Styling |
| shadcn/ui | Component library |
| Radix UI | Primitives (via shadcn) |
| React Hook Form + Zod | Forms and validation |
| Sonner | Toast notifications |
| Phosphor Icons | Icons (`@phosphor-icons/react`) |
| next-themes | Light/dark mode |
| Embla Carousel | Room image carousels |
| Bun | Package manager — always use `bun` not `npm` or `yarn` |

**No Convex. No database. No real auth. No real payments.**
All data lives in `lib/mock-data.ts` as typed TypeScript objects.

---

## Project Structure

```
roomly/
├── app/
│   ├── (auth)/                        # Auth group — login and role selection
│   │   ├── layout.tsx
│   │   └── login/
│   │       └── page.tsx               # Role selector login page
│   │
│   ├── (public)/                      # Guest-facing public pages
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Home / landing
│   │   ├── rooms/
│   │   │   ├── page.tsx               # Browse all rooms
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Single room detail
│   │   └── booking/
│   │       ├── [room-id]/
│   │       │   └── page.tsx           # Booking form + mock payment
│   │       └── confirmation/
│   │           └── page.tsx           # Booking confirmed + QR code
│   │
│   ├── (protected)/                   # Role-based protected pages
│   │   ├── layout.tsx                 # Checks role from localStorage, redirects to /login if missing
│   │   └── dashboard/
│   │       └── page.tsx               # Single dashboard — renders based on role
│   │
│   ├── layout.tsx                     # Root layout
│   └── globals.css
│
├── components/
│   ├── ui/                            # shadcn auto-generated components (do not edit manually)
│   └── shared/                        # Reusable components used across public and protected
│       ├── navbar.tsx
│       ├── footer.tsx
│       ├── status-badge.tsx
│       └── room-card.tsx
│
├── features/
│   ├── auth/                          # Auth feature
│   │   ├── components/
│   │   │   └── role-selector.tsx
│   │   └── hooks/
│   │       └── use-role.ts
│   │
│   ├── public/                        # Guest-facing features
│   │   ├── home/
│   │   │   └── components/
│   │   │       ├── hero.tsx
│   │   │       └── featured-rooms.tsx
│   │   ├── rooms/
│   │   │   └── components/
│   │   │       ├── room-grid.tsx
│   │   │       ├── room-detail.tsx
│   │   │       └── room-filters.tsx
│   │   └── booking/
│   │       └── components/
│   │           ├── booking-form.tsx
│   │           └── booking-confirmation.tsx
│   │
│   └── protected/                     # Dashboard features per role
│       ├── dashboard/
│       │   └── components/
│       │       ├── sidebar.tsx
│       │       └── dashboard-header.tsx
│       ├── receptionist/
│       │   └── components/
│       │       ├── arrivals-list.tsx
│       │       ├── room-status-board.tsx
│       │       └── guest-detail-panel.tsx
│       ├── manager/
│       │   └── components/
│       │       ├── occupancy-summary.tsx
│       │       ├── revenue-breakdown.tsx
│       │       └── bookings-table.tsx
│       └── director/
│           └── components/
│               ├── audit-log-table.tsx
│               └── policy-settings.tsx
│
├── lib/
│   ├── mock-data.ts                   # All mock data lives here
│   ├── types.ts                       # All TypeScript types
│   └── utils.ts                       # cn(), formatters, helpers
│
└── public/
    └── images/                        # Static assets if needed
```

---

## File Naming Rules

- **File-based routing files** follow Next.js convention: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **Everything else** uses kebab-case: `room-card.tsx`, `booking-form.tsx`, `mock-data.ts`, `use-role.ts`
- No PascalCase filenames. No camelCase filenames. Only kebab-case outside of Next.js routing files.

---

## Mock Data

All data lives in `lib/mock-data.ts`. Keep it typed and realistic.

```ts
// lib/types.ts

export type RoomStatus = 'available' | 'reserved' | 'occupied' | 'needs_cleaning' | 'maintenance'

export type RoomType = 'standard' | 'deluxe' | 'suite' | 'executive'

export type Room = {
  id: string
  name: string
  type: RoomType
  description: string
  price: number          // per night in GHS
  images: string[]       // Unsplash URLs
  amenities: string[]
  capacity: number
  status: RoomStatus
}

export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'

export type Booking = {
  id: string
  guestName: string
  guestEmail: string
  roomId: string
  roomName: string
  checkIn: string        // ISO date string
  checkOut: string       // ISO date string
  nights: number
  totalAmount: number
  depositPaid: number    // 20% of total
  status: BookingStatus
  qrCode: string         // unique string used as mock QR data
  bookedAt: string       // ISO date string
  vehiclePlate?: string
}

export type AuditLog = {
  id: string
  action: string
  performedBy: string
  role: StaffRole
  timestamp: string
}

export type StaffRole = 'receptionist' | 'manager' | 'director'
```

Seed the mock data with at least:
- 6 rooms (mix of statuses)
- 8 bookings (mix of statuses, some with today's date as checkIn)
- 10 audit log entries

---

## Auth (Mock RBAC)

No real auth. The login page at `/login` shows three role buttons:

- **Receptionist**
- **Manager**
- **Director**

When a role is selected:
1. Save it to `localStorage` as `roomly_role`
2. Redirect to `/dashboard`

The `(protected)/layout.tsx` reads `roomly_role` from `localStorage` on mount. If it is missing or invalid, redirect immediately to `/login`. That is the entire auth system.

The `/dashboard` page reads the role and renders the correct dashboard view:

```ts
// app/(protected)/dashboard/page.tsx
const role = localStorage.getItem('roomly_role') as StaffRole

if (role === 'receptionist') return <ReceptionistView />
if (role === 'manager') return <ManagerView />
if (role === 'director') return <DirectorView />
```

Each view is a component from `features/protected/`. The sidebar and header are shared across all roles but the navigation items change based on role.

---

## Guest Booking Flow

```
/ → /rooms → /rooms/[id] → /booking/[room-id] → /booking/confirmation
```

1. Guest lands on the home page, sees featured rooms, clicks through to browse
2. On `/rooms` — full room grid with filters
3. On `/rooms/[id]` — room detail, image carousel, amenities, "Book Now" button
4. On `/booking/[room-id]` — booking form:
    - Fields: guest name, email, check-in date, check-out date
    - Auto-calculates: nights, total cost, deposit amount (20%)
    - Zod validation on all fields
    - "Pay Deposit" submits the form — no real payment, just proceed
5. On `/booking/confirmation`:
    - Booking reference (random 6-char alphanumeric e.g. `RML-4X9K`)
    - Guest name, room name, dates, deposit paid
    - QR code visual — a simple bordered box displaying the booking reference (no external QR library)
    - "Your room is reserved" message

Save the new booking to `localStorage` as `roomly_bookings` (array) so it shows up on the receptionist dashboard during the demo.

---

## Dashboard Flows

### Receptionist View
- Today's expected arrivals — filter bookings where `checkIn === today` and `status === 'confirmed'`
- Room status board — all rooms, colour-coded by status
- Click an arrival → guest detail panel slides in → "Check In" button
    - On check in: booking `status` → `checked_in`, room `status` → `occupied`
- "Check Out" button on occupied rooms
    - On check out: booking `status` → `checked_out`, room `status` → `needs_cleaning`
- Every status change shows a Sonner toast

### Manager View
- Occupancy summary cards — total rooms, occupied, available, reserved, needs cleaning
- Revenue breakdown — total collected, refunds (mock 5%), penalties (mock 2%), net revenue
- Full bookings table — all bookings, status badge on each row

### Director View
- Everything the manager sees
- Audit log table — all mock audit log entries with role, action, and timestamp
- Policy settings panel — inputs for deposit %, penalty %, cancellation window (display only, changes are not persisted)

---

## Design Direction

The hotel context calls for something that feels premium but approachable — warm, clean, and confident.

**Palette**
```
Navy (primary):     #0D1B2A
Gold (accent):      #C9972B
Background:         #F9F6EF
Surface:            #F0EDE6
Text:               #2E3A45
Muted:              #7A8794
White:              #FFFFFF
```

**Typography**
- Use `Geist` (available in Next.js by default) for the entire site
- Headings: bold, generous size, navy
- Body: regular weight, charcoal `#2E3A45`
- Labels and small text: muted `#7A8794`

**Layout**
- Guest pages: centered content, `max-w-6xl`, generous vertical whitespace — feels like a boutique hotel website, left-aligned text
- Dashboard: full-width with a fixed left sidebar (`w-64`), main content area scrolls
- Room cards: image on top, content below, subtle gold border on hover

**Status Badge Colors**
- `available` → green
- `reserved` → gold / amber
- `occupied` → red
- `needs_cleaning` → purple
- `maintenance` → grey

**Component Rules**
- `rounded-xl` for cards
- `rounded-full` for status badges and pills
- No gradients as decoration
- No animation on every element — only on meaningful interactions
- Do not use ALL CAPS for labels
- Do not make it look like a generic admin template

---

## Commands

```bash
# Install dependencies
bun install

# Add a shadcn component
bun shadcn:add <component-name>

# Run dev server
bun dev

# Build
bun build
```

---

## Rules for Claude Code

- Always use `bun` — never `npm` or `yarn`
- Always use the App Router — no Pages Router patterns
- Use `"use client"` only when necessary (event handlers, hooks, localStorage)
- Keep server components as the default
- Use Zod for all form validation
- Use React Hook Form for all forms
- Use Sonner `toast()` for all user feedback
- Use Phosphor Icons — import from `@phosphor-icons/react`
- Use `cn()` from `lib/utils.ts` for conditional class names
- File naming: kebab-case for everything except Next.js routing files
- No external libraries beyond what is already in `package.json`
- No Convex, no database, no API routes
- Keep components small — one job per component
- All types go in `lib/types.ts`
- All mock data goes in `lib/mock-data.ts`
- Features go in `features/` grouped by `auth/`, `public/`, `protected/`
- Shared reusable components go in `components/shared/`
- shadcn components go in `components/ui/` — do not edit them manually
- When in doubt, keep it simple — this is a prototype, not production

---

## What Done Looks Like

The prototype is complete when a person can:

1. Open the home page, browse rooms, pick one, complete the booking form, and land on a confirmation page with a QR code
2. Go to `/login`, select Receptionist, see today's arrivals, click a guest, and check them in — room status updates live
3. Go to `/login`, select Manager, see the occupancy summary and revenue breakdown
4. Go to `/login`, select Director, see the audit log and policy settings panel

That is the full demo flow. Everything else is polish.

---

## Color System

All colors come from `globals.css` — never hardcode hex values or raw Tailwind color classes like `bg-blue-500`. Use only the CSS custom properties already defined in the theme.

### Core Tokens

| Token | Usage |
|---|---|
| `bg-background` / `text-foreground` | Page background and primary text |
| `bg-card` / `text-card-foreground` | Card surfaces |
| `bg-primary` / `text-primary-foreground` | Gold accent — CTAs, active states, highlights |
| `bg-secondary` / `text-secondary-foreground` | Subtle backgrounds, secondary actions |
| `bg-muted` / `text-muted-foreground` | Disabled states, helper text, metadata |
| `bg-accent` / `text-accent-foreground` | Lighter gold — hover states, decorative accents |
| `border-border` | All borders and dividers |
| `bg-destructive` / `text-destructive-foreground` | Errors and destructive actions |
| `bg-sidebar` / `text-sidebar-foreground` | Dashboard sidebar |
| `bg-sidebar-accent` | Sidebar hover and active item background |
| `text-sidebar-primary` | Sidebar active icon and label color |

### Brand Variables (use sparingly via arbitrary values)

```css
var(--pc-gold)        /* #C9A227 — primary gold */
var(--pc-gold-light)  /* #E8C84A — lighter gold, hover/accent only */
var(--pc-gold-muted)  /* #8B6F1E — deliberate muted gold, use sparingly */
var(--pc-black)       /* #0A0A0A — true black for dark mode base */
var(--pc-surface)     /* #111111 — dark card surface */
var(--pc-border)      /* #1F1F1F — dark mode borders */
var(--pc-white)       /* #F5F5F0 — warm white for dark mode text */
```

Access brand variables in Tailwind with arbitrary value syntax:
```tsx
// e.g. a gold left border
<div className="border-l-2 border-l-[var(--pc-gold)]" />
```

### Status Badge Colors

Map room statuses to semantic tokens — do not use raw colors:

```tsx
const statusStyles = {
  available:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  reserved:      'bg-primary/10 text-primary',
  occupied:      'bg-destructive/10 text-destructive',
  needs_cleaning:'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  maintenance:   'bg-muted text-muted-foreground',
}
```

### Dark Mode

Dark mode is handled by the `.dark` class on `<html>` via `next-themes`. All tokens above automatically switch — you do not need to write separate dark: variants for token-based colors. Only write `dark:` variants when using the green/purple status colors above or when overriding a specific visual.

### Charts

Use `--chart-1` through `--chart-5` for any data visualisation. Categorical order is `chart-2 → chart-3 → chart-1 → chart-4` — never cycled differently.

---

## Commenting Rules

- Comments must be **short and descriptive** — one line maximum
- Describe **why**, not what — the code already says what
- No block comments, no verbose JSDoc unless a function has a non-obvious contract
- Bad: `// This maps over the bookings array and filters by today's date`
- Good: `// Only show arrivals for today's check-in slot`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
