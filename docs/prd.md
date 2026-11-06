# DeskNG — Product Requirements Document

**Project:** DeskNG — Merchant & Customer Support Ticketing MVP
**Capstone Topic:** #37 Customer Support Ticketing (TS Academy)
**Architecture:** Full-stack monorepo (React + Node/Express + MongoDB)

---

## 1. Executive Summary

Payment processors, logistics platforms, and retail merchants deal
with high-stakes operational issues daily: uncredited NIP
transfers, POS terminal tamper locks, webhook timeouts, and KYC
compliance holds. Tracking these issues over email or WhatsApp
leads to missed SLAs, lost context, and zero accountability.

**DeskNG** is a role-based Customer Support Ticketing & SLA
Triage platform built for Nigerian merchant operations. It
provides a unified workflow where customers raise classified
tickets, support agents triage and resolve issues against
automated SLA clocks, and operations leaders monitor queue health.

---

## 2. Target Users & Role Permissions

### 2.1 Customer (`customer`)

- Register an account and log in securely.
- Submit new support tickets with structured classification
  (Type, Category, Subcategory, Priority, Subject, Description).
- View a paginated, filterable list of **only their own** tickets.
- Read public replies on their tickets and post follow-up messages.
- Close their own ticket if the issue is resolved.
- **Restriction:** Cannot view other customers' tickets, cannot
  see internal agent notes (`isInternal: true`), cannot assign
  tickets, and cannot transition tickets to `on_hold`,
  `escalated`, or `archived`.

### 2.2 Support Agent (`agent`)

- View the operational support queue (all active tickets or
  tickets assigned to them).
- Filter tickets by status, priority, category, type, assignment,
  and search by ticket number (`TKT-1001`) or subject keyword.
- Claim unassigned tickets or update ticket status across the
  operational lifecycle (`open`, `on_hold`, `escalated`,
  `closed`).
- Post **Public Replies** (visible to customer) and **Internal
  Notes** (`isInternal: true`, visible only to Agents and Admins).
- Provide a mandatory `escalationReason` when escalating a ticket.

### 2.3 Administrator (`admin`)

- Full access to all tickets, including `archived` records.
- Assign or reassign any ticket to specific support agents.
- Transition closed tickets into `archived` state.
- Create and update operational Categories, Subcategories, and
  SLA turnaround hours.
- View Queue Analytics & SLA Summary metrics (Total Open,
  On-Hold, Escalated, SLA Breached, Unassigned, Closed).
- View the directory of active Support Agents for ticket
  assignment.

---

## 3. Ticket Classification & Lifecycle Rules

### 3.1 Three-Dimensional Ticket Classification

Every ticket is classified across three operational axes:

1. **Ticket Type (`type`):**
   - `incident`: System defect, failed transaction, or outage.
   - `service_request`: Routine operational change or request.
   - `inquiry`: General question or tariff clarification.
   - `complaint`: Formal dissatisfaction or dispute.
2. **Domain Category & Subcategory (`category` & `subcategory`):**
   - Linked to a `Category` document (e.g., *Settlements and
     Disputes* -> *Uncredited Transfer*).
   - Automatically determines the `dueAt` SLA timestamp based on
     the category's `slaHours`.
3. **Priority (`priority`):**
   - `low`, `medium`, `high`, `critical` (defaults to the
     category's `defaultPriority` if not overridden).

### 3.2 Five-State Ticket Lifecycle (`status`)

1. **Open (`open`):** Default state upon creation. Active in
   queue.
2. **On-Hold (`on_hold`):** Paused while awaiting customer
   response or third-party bank/NIBSS verification.
3. **Escalated (`escalated`):** Bumped to Tier-2 engineering or
   risk leadership. Requires a non-empty `escalationReason`.
4. **Closed (`closed`):** Issue resolved. Stamps `closedAt`.
5. **Archived (`archived`):** Locked historical record. Stamps
   `archivedAt`. Excluded from default active queues and rejects
   new message replies.

---

## 4. TS Academy Capstone Rubric Compliance Matrix

| Requirement | Implementation in DeskNG |
| :--- | :--- |
| **Complete User Flow** | Register -> Login -> Create Ticket -> Agent Triage -> Thread Reply -> Escalate/Hold -> Close -> Archive. |
| **Authentication & RBAC** | JWT Bearer Auth + `protect` & `authorize("customer", "agent", "admin")` middleware. |
| **Database Modeling** | 5 normalized Mongoose collections (`users`, `categories`, `counters`, `tickets`, `ticket_messages`). |
| **API Validation** | Strict Zod schemas validating `body`, `query`, and `params` on all write/query routes. |
| **Uniform API Envelope** | `{ success: boolean, message: string, data: any, meta?: object }` across all 2xx/4xx/5xx responses. |
| **Search, Filter, Page** | `GET /api/tickets?search=&status=&priority=&type=&category=&page=1&limit=10`. |
| **Frontend States** | Every React view implements Loading skeletons, Error banners, Empty states, and Populated states. |
| **Security Guardrails** | `helmet`, `cors`, `bcryptjs` hashing, `select: false` on passwords, 10kb JSON body limit, `.env` validation. |

---

## 5. Non-Goals (Out of Scope for MVP)

- Real-time WebSockets (standard REST polling/refetch on action is
  sufficient and cleaner for MVP reliability).
- File/attachment binary uploads to S3/Cloudinary.
- External email/SMS gateway delivery.
