# Salon Booking Platform — Backend API

Shared REST API powering the customer web app, customer mobile app, salon
dashboard, and admin dashboard. One backend, one database, four frontends.

## Tech stack

- **Node.js + Express** — HTTP server & routing
- **PostgreSQL** — relational database (needed for booking integrity)
- **Prisma** — ORM & migrations
- **JWT + bcrypt** — authentication
- **express-validator** — input validation
- **swagger-jsdoc + swagger-ui-express** — API documentation

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# then edit .env with your real PostgreSQL connection string and a JWT secret

# 3. Create the database tables
npx prisma migrate dev --name init

# 4. Seed demo data (creates one account per role)
npm run seed

# 5. Start the dev server
npm run dev
```

The API runs at `http://localhost:5000`.
Interactive API docs (Swagger UI): `http://localhost:5000/api-docs`

## Demo credentials

All demo accounts use the password: `Password123!`

| Role         | Email                    |
|--------------|---------------------------|
| Admin        | admin@salonapp.com        |
| Salon Owner  | owner@salonapp.com        |
| Stylist/Staff| stylist@salonapp.com      |
| Customer     | customer@salonapp.com     |

## Architecture: one API, four clients

Every frontend — customer web, customer mobile, salon dashboard, admin
dashboard — talks to the exact same set of endpoints under `/api/*`. What a
given request is allowed to do is decided by the **role embedded in the JWT**
(`CUSTOMER`, `STAFF`, `SALON_OWNER`, `ADMIN`), not by which app is calling it.
This is what makes the API genuinely reusable rather than four separate APIs
wearing one name.

```
routes/        -> defines the URL + which middleware guards it
middleware/     -> authenticate (who are you) + requireRole (are you allowed)
controllers/    -> the actual logic for each endpoint
utils/          -> shared logic used by multiple controllers (availability
                    calculation, ownership checks, JWT signing)
prisma/schema.prisma -> the single source of truth for the data model
```

## Key technical decisions (and why)

**Single `User` table with a `role` enum**, instead of separate tables per
role. A salon owner and a customer are still fundamentally "a person who logs
in" — splitting them into different tables would mean duplicating
auth/login logic four times. The `role` field is what the `requireRole()`
middleware checks on every protected route.

**Availability is computed, not stored.** There is no `Slot` table. Instead,
`utils/availability.js` calculates open slots live from three things:
staff working hours + staff leave + existing booked appointments. This
guarantees slots shown to a customer are always accurate — there's no
separate "slot" record that could ever get out of sync with real bookings.

**Double-booking prevention** (`controllers/appointment.controller.js`,
`bookAppointment`): the classic race condition is two customers both seeing
a slot as free and both booking it at nearly the same time. This is solved
by wrapping the "check for conflict" + "create the appointment" in a single
Prisma transaction with `Serializable` isolation. If two bookings collide,
Postgres itself rejects the second one — the check-then-write is atomic, so
there's no window where both can slip through.

**Soft deletes for services** (`isActive: false` instead of deleting rows).
A salon can't actually delete a service that has past appointment history
attached to it without breaking those records — deactivating keeps the
history intact while hiding it from new bookings.

**Ownership checks are centralized** in `utils/ownership.js`
(`assertOwnsSalon`). A `SALON_OWNER` should only ever manage their own
salon's services/staff/appointments, never another salon's. Rather than
repeating that check in every controller, it's one reusable function.

**Staff accounts are created by salon owners, not self-registered.**
`POST /api/auth/register` only allows `CUSTOMER` or `SALON_OWNER` roles.
Staff are added via `POST /api/salons/:salonId/staff` by their owner
(creates both the `User` and linked `Staff` profile in one transaction),
and `ADMIN` accounts are never created through a public endpoint at all —
they're seeded directly. This prevents anyone from signing up and granting
themselves staff/admin access.

## Preventing overlapping appointments — how it's tested

To verify this works: try firing two `POST /api/appointments` requests for
the exact same `staffId` + `startTime` at nearly the same time (e.g. with
a quick script or two browser tabs). One should succeed with `201`, the
other should fail with `409 "This time slot was just booked by someone
else."` — never both succeeding.

## API overview

Full interactive documentation is at `/api-docs`. Summary:

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Salons | `GET /api/salons`, `GET /api/salons/:id`, `POST /api/salons`, `PUT /api/salons/:id` |
| Services | `GET/POST /api/salons/:salonId/services`, `PUT/DELETE /api/services/:id` |
| Staff | `GET/POST /api/salons/:salonId/staff`, `PUT /api/staff/:id/working-hours`, `POST /api/staff/:id/leave` |
| Availability | `GET /api/staff/:staffId/availability?date=&serviceId=` |
| Appointments | `POST /api/appointments`, `GET /api/appointments/me`, `PATCH /api/appointments/:id/cancel` |
| Reviews | `POST /api/appointments/:id/review`, `GET /api/salons/:salonId/reviews` |
| Admin | `GET /api/admin/stats`, `GET /api/admin/users`, `GET /api/admin/salons`, `PATCH /api/admin/salons/:id/toggle-active` |

## What's next (not yet built — this is the backend scaffold)

This deliverable is the backend + data model + auth/RBAC + booking engine.
Still to build on top of this API: customer web app, customer mobile app,
salon dashboard, admin dashboard, and the marketing website. All four will
be separate projects that call this same API — see the main project plan
for suggested stacks for each (React + Vite for the three dashboards/web
app, React Native/Expo for mobile).
