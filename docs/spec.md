# DeskNG — Technical Specification

**Scope:** Backend API + frontend architecture for the DeskNG
MVP. Companion doc: `docs/prd.md`.

---

## 1. Repository & Layered Architecture

```text
support-ticketing-mvp/
├── backend/
│   ├── src/
│   │   ├── config/         # env.js (Zod), db.js (Mongoose)
│   │   ├── controllers/    # HTTP transport (req -> service -> res)
│   │   ├── middleware/     # authMiddleware, errorMiddleware, validate
│   │   ├── models/         # User, Category, Counter, Ticket, TicketMessage
│   │   ├── routes/         # Express routers mounted in app.js
│   │   ├── services/       # Pure domain & database business logic
│   │   ├── utils/          # AppError, apiResponse, asyncHandler, token, seeder
│   │   ├── validators/     # Zod request validation schemas
│   │   ├── app.js          # Express pipeline configuration
│   │   └── server.js       # DB bootstrap & HTTP listener
│   ├── .env
│   └── package.json
└── frontend/               # React (Vite) + Tailwind CSS + React Router
    ├── src/
    │   ├── api/            # Axios instance with Bearer token interceptor
    │   ├── components/     # UI primitives, badges, modals, layouts
    │   ├── context/        # AuthContext (user session, login, logout)
    │   ├── pages/          # Landing, Login, Register, Dashboard, TicketDetail, AdminCategories
    │   └── main.jsx
    └── package.json
```

---

## 2. Database Schema Specification (MongoDB)

### 2.1 `Counter` (`src/models/Counter.js`)

Generates collision-free sequential ticket numbers (`TKT-1001`).

- `_id`: `String` (e.g., `"ticket_seq"`)
- `seq`: `Number` (starts at `1000`, incremented via
  `$inc: { seq: 1 }`)
- Number generation uses `findByIdAndUpdate` with
  `returnDocument: "after"` and `upsert: true` (Mongoose 9).

### 2.2 `Ticket` (`src/models/Ticket.js`)

- `ticketNumber`: `String` (required, unique, indexed, e.g.,
  `TKT-1001`)
- `subject`: `String` (required, trim, 5–120 chars)
- `description`: `String` (required, trim, min 10 chars)
- `status`: `String` enum `["open", "on_hold", "escalated",
  "closed", "archived"]` (default: `"open"`, indexed)
- `type`: `String` enum `["incident", "service_request",
  "inquiry", "complaint"]` (required, indexed)
- `priority`: `String` enum `["low", "medium", "high",
  "critical"]` (default: `"medium"`, indexed)
- `category`: `ObjectId` ref `"Category"` (required, indexed)
- `subcategory`: `String` (required, trim)
- `requester`: `ObjectId` ref `"User"` (required, indexed)
- `assignedTo`: `ObjectId` ref `"User"` (default: `null`,
  indexed)
- `escalationReason`: `String` (default: `null`)
- `dueAt`: `Date` (required, computed at creation:
  `now + category.slaHours`)
- `closedAt`: `Date` (default: `null`)
- `archivedAt`: `Date` (default: `null`)
- `timestamps`: `true`
- **Compound Index:** `{ status: 1, priority: -1, createdAt: -1 }`

### 2.3 `TicketMessage` (`src/models/TicketMessage.js`)

- `ticket`: `ObjectId` ref `"Ticket"` (required, indexed)
- `sender`: `ObjectId` ref `"User"` (required)
- `body`: `String` (required, trim, 1–5000 chars)
- `isInternal`: `Boolean` (default: `false`)
- `timestamps`: `true`

---

## 3. API Contracts

All responses use the envelope
`{ success, message, data, meta? }`. Authentication is JWT
Bearer via `Authorization: Bearer <token>`.

### 3.1 Auth (`/api/auth`)

| Method | Path | Roles | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register customer (role forced to `customer`). |
| `POST` | `/api/auth/login` | Public | Login; returns `{ user, token }`. |
| `GET` | `/api/auth/me` | Auth | Current profile. |

### 3.2 Categories (`/api/categories`)

| Method | Path | Roles | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Auth | List active categories (admin sees all). |
| `GET` | `/api/categories/:id` | Auth | Category detail. |
| `POST` | `/api/categories` | admin | Create category. |
| `PATCH` | `/api/categories/:id` | admin | Update category. |

### 3.3 Tickets (`/api/tickets`)

| Method | Path | Roles | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tickets` | Auth | Create ticket. Validates subcategory belongs to category, computes `dueAt`, generates `TKT-xxxx`. |
| `GET` | `/api/tickets` | Auth | List tickets with pagination & filters (`status`, `priority`, `type`, `category`, `assignedTo`, `search`, `includeArchived`). Customers are strictly scoped to `{ requester: req.user._id }`. |
| `GET` | `/api/tickets/stats` | agent, admin | Aggregate counts by status plus unassigned and SLA-breached counts. |
| `GET` | `/api/tickets/:id` | Auth | Fetch single ticket with populated `category`, `requester`, `assignedTo`. Customers can only view their own. |
| `PATCH` | `/api/tickets/:id/status` | Auth | Update status with state rules (below). |
| `PATCH` | `/api/tickets/:id/assign` | agent, admin | Assign ticket to an active agent/admin. |

### 3.4 Ticket Messages (`/api/tickets/:id/messages`)

| Method | Path | Roles | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tickets/:id/messages` | Auth | List chronological messages. Customers receive only `isInternal: false`. |
| `POST` | `/api/tickets/:id/messages` | Auth | Add message. Rejects `400` when archived. `isInternal` forced `false` for customers. |

### 3.5 User Lookup (`/api/users`)

| Method | Path | Roles | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/agents` | agent, admin | Active users with `role: { $in: ["agent", "admin"] }` for assignment dropdowns. |

---

## 4. State Transition Business Logic (`ticketService.js`)

1. **Archive Guard:** Once `ticket.status === "archived"`, no
   status changes, reassignments, or new messages are permitted
   (`400 Bad Request`).
2. **Customer Transition Rule:** A user with `role === "customer"`
   may only transition their own ticket to `"closed"`. Any
   attempt to set `"on_hold"`, `"escalated"`, or `"archived"`
   throws `403 Forbidden`.
3. **Escalation Rule:** Transitioning to `"escalated"` requires a
   non-empty `escalationReason` (minimum 5 chars).
4. **Timestamp Tracking:**
   - Moving to `"closed"` sets `closedAt = new Date()`.
   - Reopening from `"closed"` to `"open"` clears
     `closedAt = null`.
   - Moving to `"archived"` sets `archivedAt = new Date()`
     (only allowed by `admin`).

---

## 5. Frontend Specification

### 5.1 Stack

- **Framework:** React 18 + Vite 5
- **Routing:** `react-router-dom` v6 with `RequireAuth` /
  `RequireAdmin` guards
- **HTTP:** Axios instance (`src/api/client.js`) with
  `baseURL` from `VITE_API_URL` and a Bearer-token request
  interceptor; response interceptor normalizes errors and clears
  expired tokens
- **Styling:** Tailwind CSS with custom ink/acid design tokens,
  Space Grotesk + Inter fonts

### 5.2 Design Tokens

- `ink` palette: deep navy scale, `#0A1120` base
- `acid` palette: lime accent (`#C9F24A`)
- `paper`: warm off-white background (`#F6F7FB`)
- Component classes: `.card`, `.btn-primary`, `.btn-accent`,
  `.btn-ghost`, `.input-field`, `.label-field`

### 5.3 Status & Priority Badge Colors

- **Statuses:**
  - `open`: Blue
  - `on_hold`: Amber
  - `escalated`: Rose/Red
  - `closed`: Emerald
  - `archived`: Slate
- **Priorities:**
  - `low`: Slate
  - `medium`: Sky
  - `high`: Orange
  - `critical`: Red (semibold)

### 5.4 Pages

1. `/` — Landing (hero with product preview, features, how-it-
   works, roles, streaming testimonial ticker, demo credentials)
2. `/login`, `/register` — split-screen auth with quick-fill demo
   roles and live password-rule checklist
3. `/dashboard` — KPI bar (staff), filter/search bar, paginated
   ticket table with SLA badges and avatars, empty-state CTAs
4. `/tickets/new` — dynamic Category -> Subcategory with SLA
   preview
5. `/tickets/:id` — conversation thread (internal notes styled
   amber), status transitions + escalation modal, assignment
   sidebar, metadata/SLA panels
6. `/admin/categories` — admin CRUD for categories, subcategories,
   and SLA hours

---

## 6. Environment & Ports

- Backend: `PORT=5001` (default `5000`; `5000` is occupied by
  the sibling `syncro_wfm/server` project on this machine)
- Frontend dev server: `http://localhost:5174` (Vite fallback;
  `5173` is occupied by `syncro_wfm/client`)
- Backend CORS allowlist supports both origins
  (`CORS_ORIGIN=http://localhost:5173,http://localhost:5174`)
- MongoDB: `mongodb://127.0.0.1:27017/support_ticketing_db`
