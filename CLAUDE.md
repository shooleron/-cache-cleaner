# CLAUDE.md — Atelier (אטלייה) Project Guide

## What This Is

This repo contains two things in one:

1. **אטלייה (Atelier)** — the primary app: a Hebrew-language, RTL, all-in-one business management platform (project management + CRM + events + speakers + AI assistant). The target customer is Israeli real-estate conference organizers (מרכז הנדל״ן).
2. **Cache Cleaner** — a small utility at `app/components/CacheCleaner.tsx` + `app/api/cache/route.ts` that scans and clears macOS system caches. This is what the repo folder name (`-cache-cleaner`) refers to, but it is a minor feature.

The main UI is the Atelier platform. The cache cleaner is a standalone component accessible at a separate route.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI library | React 19 |
| Language | TypeScript 5 |
| Styling | Inline `React.CSSProperties` objects (no Tailwind, no CSS modules except `app/page.module.css` and `app/globals.css`) |
| Icons | `lucide-react` + Google Material Symbols (`material-symbols-outlined`) |
| Drag & drop | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| Database / realtime | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) |
| AI | Anthropic SDK (`@anthropic-ai/sdk`) — model `claude-opus-4-6` |
| Excel I/O | `xlsx` |
| Date helpers | `date-fns` |
| ID generation | `uuid` |
| Fonts | Inter, Manrope (Google Fonts); Mikhmoret (local OTF in `public/`) |
| Deployment | Vercel |

No test framework. No ESLint config. No Prettier config.

---

## Directory Structure

```
/
├── app/
│   ├── layout.tsx              # Root layout — sets lang="he" dir="rtl", loads fonts
│   ├── page.tsx                # Main SPA entry — StoreProvider wraps everything
│   ├── globals.css             # Global styles for the Atelier shell
│   ├── page.module.css         # Unused legacy CSS module
│   ├── global-error.tsx        # Next.js error boundary
│   ├── login/page.tsx          # Google OAuth login page (RTL, Hebrew)
│   ├── invite/[token]/page.tsx # Invite acceptance flow
│   ├── auth/callback/route.ts  # Supabase OAuth callback handler
│   ├── api/
│   │   ├── ai/route.ts         # POST — proxies to Anthropic API (Claude)
│   │   └── cache/route.ts      # GET/POST — macOS cache scanner/cleaner
│   └── components/
│       └── CacheCleaner.tsx    # Cache cleaner UI component
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Left nav (RTL: visually right), section switcher
│   │   └── TopBar.tsx          # Top bar with view toggles and action buttons
│   ├── views/                  # Main content panels, one per AppSection
│   │   ├── DashboardView.tsx
│   │   ├── TableView.tsx       # Default board view
│   │   ├── KanbanView.tsx      # Drag-and-drop kanban
│   │   ├── RoadmapView.tsx
│   │   ├── CalendarView.tsx
│   │   ├── MyTasksView.tsx
│   │   ├── MarketingHubView.tsx
│   │   ├── EventsView.tsx
│   │   ├── SpeakersView.tsx
│   │   └── UsersView.tsx
│   ├── crm/
│   │   ├── ContactsView.tsx
│   │   └── DealsView.tsx
│   ├── modals/                 # All modal dialogs
│   │   ├── TaskModal.tsx       # Full task detail drawer
│   │   ├── NewProjectModal.tsx
│   │   ├── NewEventModal.tsx
│   │   ├── InviteModal.tsx
│   │   ├── OnboardingModal.tsx # First-run setup wizard
│   │   ├── ProfileModal.tsx
│   │   ├── SpeakerModal.tsx
│   │   ├── WelcomeModal.tsx
│   │   ├── ImportContactsModal.tsx
│   │   └── GoogleSheetsModal.tsx
│   ├── panels/
│   │   ├── NotificationsPanel.tsx
│   │   └── ChatPanel.tsx
│   ├── ai/
│   │   └── AIAgentPanel.tsx    # Floating AI chat sidebar
│   ├── automations/
│   │   └── AutomationsPanel.tsx
│   ├── auth/
│   │   └── PasswordGate.tsx    # App-level password lock screen
│   └── ui/
│       ├── ConfirmDialog.tsx
│       ├── CelebrationOverlay.tsx  # Confetti on task completion
│       └── UserAvatar.tsx
│
├── lib/
│   ├── types.ts                # ALL TypeScript types (single source of truth)
│   ├── store.tsx               # Global state: Context + useReducer + Supabase sync
│   ├── mockData.ts             # INITIAL_STATE with realistic Hebrew seed data
│   ├── permissions.ts          # Role-based permission helpers
│   ├── password.ts             # App-level password hash + session management
│   ├── animalAvatars.tsx       # Animal avatar SVG library for user profiles
│   ├── importExcel.ts          # Excel/CSV contact import
│   ├── exportExcel.ts          # Excel export for tasks, contacts, speakers
│   ├── googleSheetsSync.ts     # Google Sheets contact sync
│   └── supabase/
│       ├── client.ts           # Browser Supabase client (createBrowserClient)
│       └── server.ts           # Server Supabase client (createServerClient)
│
├── public/
│   ├── logo-nadlan.svg         # מרכז הנדל״ן brand logo
│   ├── eilat-2027/             # Static landing page — Eilat 2027 real estate conference
│   └── ahad-mishlanu/          # Static HTML templates for another client campaign
│
├── supabase-schema.sql         # DB schema — single table `workspace_state`
└── .claude/launch.json         # Dev server launch config (port 3000)
```

---

## State Management

**Single global store** via React Context + `useReducer` in `lib/store.tsx`.

- Access state: `const { state, dispatch } = useStore();` (must be inside `<StoreProvider>`)
- All state lives in `AppState` (defined in `lib/types.ts`)
- Every user action is an `Action` union dispatched to the `reducer`
- Activity logs (`state.activityLogs`) are appended on most mutations, capped at 500 entries
- `state.activityLogs` entries use Hebrew labels for human-readable history

**Supabase realtime sync** is built into `StoreProvider`:
- On mount: loads `workspace_state` row from Supabase, dispatches `LOAD_STATE`
- On mutations: debounced 800ms upsert of shared data fields to Supabase
- Realtime channel listens for remote updates and applies them
- UI-only fields (modal open/close, AI messages, panel states) are NOT synced — see `UI_ONLY_FIELDS` in `store.tsx:113`

**Onboarding + password** persist to `localStorage` (keys: `atelier_onboarding`, `atelier_password_hash`, `atelier_session_expires`). Sessions last 3 hours.

---

## Routing / Navigation

The app is a **single-page application** — `app/page.tsx` renders everything. Navigation is entirely state-driven via `state.activeSection` and `state.activeProjectId`.

`renderMainContent()` in `app/page.tsx` maps `activeSection` → view component:

| `activeSection` | View rendered |
|---|---|
| `dashboard` | `DashboardView` |
| `my-tasks` / `rd` | `MyTasksView` |
| `marketing` / `promotion` / `social` / `design` / `bizdev` | `MarketingHubView` or board view if project selected |
| `crm` | `ContactsView` or `DealsView` (via `state.activeCRMView`) |
| `automations` | `AutomationsPanel` |
| `users` | `UsersView` |
| `speakers` | `SpeakersView` |
| `events` | `EventsView` or board view if project selected |
| fallback | Board view determined by `state.activeView` |

Board views (`table` / `kanban` / `roadmap` / `calendar`) are switched via `state.activeView`.

There are two real Next.js routes:
- `/login` — Google OAuth login
- `/invite/[token]` — invite acceptance
- `/auth/callback` — Supabase OAuth callback

---

## Key Types (lib/types.ts)

The type file is the canonical reference. Key entities:

- **`AppState`** — root state object containing all data + UI state
- **`Task`** — rich task with status, priority, assignees, dates, comments, sub-items, attachments, notes, tags, time tracking, custom columns (checkbox, link, phone, location)
- **`Project`** — belongs to an `Event`, has a `category` (marketing/bizdev/etc.) or `null` for ops projects
- **`Group`** — task grouping within a project (like Monday.com groups)
- **`Event`** — top-level conference/event container; projects belong to events
- **`Speaker`** / **`Panel`** — conference speaker management
- **`Contact`** / **`Deal`** — CRM entities; `Deal` can auto-generate an ops `Project` on close
- **`AutomationRule`** — no-code automation rules
- **`User`** — roles: `owner` | `member` | `viewer`

---

## AI Integration

**Route**: `POST /api/ai` (`app/api/ai/route.ts`)

- Uses Anthropic SDK with model `claude-opus-4-6`
- Receives `{ messages, context }` where context is a workspace summary snapshot
- Returns `{ text, actions }` — actions are parsed from `<actions>[...]</actions>` XML blocks in the response
- Action types: `create_task`, `update_task`, `create_contact`, `create_deal`
- The `AIAgentPanel` component renders the chat UI and dispatches parsed actions to the store

**Environment variable required**: `ANTHROPIC_API_KEY`

---

## Supabase Setup

**Schema** (`supabase-schema.sql`): one table — `workspace_state` with a single row (`id = 'main'`). The entire app state is stored as a JSONB blob in `data`. RLS allows anonymous read/write. Realtime is enabled.

**Environment variables required**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Auth** (`app/login/page.tsx`): Google OAuth via Supabase Auth. Callback at `/auth/callback`. Also requires:
- `NEXT_PUBLIC_APP_URL` — for the OAuth redirect URL

The Supabase auth is separate from the app-level password lock (`lib/password.ts`). The password lock is a local SHA-256 hash in localStorage — it doesn't touch Supabase Auth.

---

## Cache Cleaner Feature

`app/api/cache/route.ts` exposes:
- `GET /api/cache` — scans sizes of macOS cache directories (`~/Library/Caches`, `~/Library/Logs`, `~/.Trash`) and runs `npm cache clean`
- `POST /api/cache` — cleans selected targets via `rm -rf` or CLI commands

`app/components/CacheCleaner.tsx` — standalone React component for the UI, uses inline styles, has Hebrew labels. Intended for macOS only.

---

## Permissions

`lib/permissions.ts` exports simple role-check helpers:

```ts
isAdmin(user)              // role === 'owner'
canInviteUsers(user)       // owner only
canManageRoles(user)       // owner only
canManageAutomations(user) // owner only
canDeleteProjects(user)    // owner only
canAccessCRM(user)         // owner or member (not viewer)
```

---

## RTL / Hebrew Conventions

- Root `<html>` has `lang="he" dir="rtl"`
- All UI text is in Hebrew
- Activity log labels (in `lib/store.tsx`) are written in Hebrew
- Mock data names/companies are Hebrew/Israeli
- Inline styles use `direction: 'rtl'` where needed for sub-components
- Fonts: Inter for body, Manrope for headings/branding

When adding new UI, follow the RTL pattern: use `flex-direction: row-reverse` instead of `row` where needed, and right-align text by default.

---

## Development Workflow

```bash
npm run dev     # Start dev server on port 3000
npm run build   # Production build
npm run start   # Serve production build
```

No test runner. No linter configured. TypeScript checking via `tsc` (or IDE).

**Required `.env.local`**:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The app runs without Supabase (falls back to mock data from `lib/mockData.ts`). AI panel will fail without `ANTHROPIC_API_KEY`.

---

## Adding New Features

**New section/view**:
1. Add a value to `AppSection` type in `lib/types.ts`
2. Add case to `renderMainContent()` in `app/page.tsx`
3. Add sidebar entry in `components/layout/Sidebar.tsx`
4. Create the view component in `components/views/`

**New action**:
1. Add the `Action` union variant in `lib/store.tsx`
2. Add a `case` in `reducer()`
3. Decide if it needs syncing — add to `uiOnlyActions` array in `isSyncAction()` if it's UI-only

**New entity**:
1. Define the type in `lib/types.ts`
2. Add it to `AppState`
3. Add it to `INITIAL_STATE` in `lib/mockData.ts`
4. Add CRUD actions in `store.tsx`

---

## Public Static Assets

- `public/eilat-2027/` — self-contained HTML landing page for "ועידת הנדל״ן אילת 2027" with custom fonts (Mikhmoret OTF). Served at `/eilat-2027/`.
- `public/ahad-mishlanu/` — static HTML design files for "אחד משלנו" campaign. Served at `/ahad-mishlanu/`.

These are standalone HTML files unrelated to the Next.js app. The `.vercelignore` explicitly excludes user home directory paths and many system directories, keeping only the app source.
