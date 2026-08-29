# Queueflow

A full-stack **real-time queue management system** — like a bank or hospital token counter. Customers take a ticket, staff call the next one, and every screen updates **instantly** via WebSockets.

---

## Features

**For customers**
- Register / login with JWT, bcrypt-hashed passwords (roles: `user` / `admin`)
- Take a ticket for any branch + department — each department issues prefixed tickets (`REC007`, `PHR012`)
- Live queue position ("you are #3") pushed to your screen in real time; everyone moves up a spot when the line changes
- Bell + toast notification the moment it's your turn (and for serving / completed / cancelled)
- Cancel your own ticket while waiting or called
- Ticket lifecycle `waiting → called → serving → completed / cancelled`, resets daily
- No-show handling — 2-minute countdown after being called; if you don't arrive, you're automatically skipped and notified

**For staff (agents)**
- Agents are users assigned to a branch + department + counter number with office hours (e.g. 9:00–17:00) and a daily token limit
- **Call next** serves today's oldest waiting ticket in their department
- **Auto call-next** — after completing a ticket, the next customer is called automatically (~30s later) and shown with the no-show countdown
- Daily token counters with automatic reset, agent performance stats, and stuck-"busy" reconciliation
- Ticket creation is rejected outside office hours

**For admins**
- Manage branches and departments (each department owns a ticket prefix)
- Manage agents: assign user → counter, office hours, daily token capacity, toggle active/offline
- Live daily stats (total / waiting / called / serving / completed / cancelled)
- Manual call-next + override ticket status, full agent statistics view

**Under the hood**
- Real-time updates — Socket.IO pushes every change to the right rooms instantly
- Race-safe tickets — unique index `{department, date, ticketNumber}` + retry = no duplicate numbers under concurrent load
- Security — Helmet, CORS whitelist, rate limiting, Zod validation, JWT-protected sockets, generic error messages

## Tech Stack

| **Frontend** | React 19 · TypeScript · Vite · Redux Toolkit · Tailwind CSS 4 · Socket.IO client |
| **Backend** | Node.js · Express 5 · TypeScript · Socket.IO |
| **Database** | MongoDB (Mongoose) |
| **Auth & Validation** | JWT · bcryptjs · Zod |

## How It Works

```
React Client ──REST + JWT──► Express API ──► Services ──► MongoDB
     ▲                            │
     └──── Socket.IO push ◄───────┘
```

Backend layers: **Routes → Controllers → Validators → Services → Models**

Socket rooms keep updates scoped: `branch:{id}`, `department:{id}`, `admin`, private `user:{id}`.
Every socket must pass a JWT handshake — users can only join their own room.

```
Ticket flow:  waiting ──call──► called ──start──► serving ──► completed
                  └───────────────────────────────────────► cancelled
                                                          ▲
                                              no-show after 2 min (auto)
```

## Project Structure

```
Queueflow/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios API clients
│   │   ├── components/      # Layout, notifications, guards
│   │   ├── pages/           # auth, queue, admin, agents, counter, stats...
│   │   ├── sockets/         # Socket.IO client + events
│   │   ├── store/           # Redux Toolkit slices
│   │   └── routes/          # Route definitions
│   └── .envExample
└── server/                  # Express + Socket.IO backend
    ├── scripts/seed.ts      # Demo data
    ├── src/
    │   ├── config/          # DB connection, CORS
    │   ├── controllers/     # Request handlers
    │   ├── middleware/      # auth, role, validation
    │   ├── models/          # Mongoose schemas
    │   ├── routes/          # API routes
    │   ├── services/        # Business logic
    │   ├── sockets/         # Socket auth, rooms, emitters
    │   └── validators/      # Zod schemas
    └── .env.example
```

## Run Locally

**Prerequisites:** Node.js 18+, MongoDB (local or Atlas)

### Backend

```bash
cd server
npm install

# create .env (see .env.example)
# PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/queueflow
# JWT_SECRET=your_strong_secret_here

npm run seed     # demo data
npm run dev      # http://localhost:5000
```

### Frontend

```bash
cd client
npm install

# create .env (see .envExample)
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000

npm run dev      # http://localhost:5173
```

### Demo Accounts (after `npm run seed`)

Password for all accounts: `password123`

| Role | Email | Notes |
|---|---|---|
| Admin | `umesh14@gmail.com` | Manage branches, departments, agents, queues |
| Customer (Agent) | `ramesh20@gmail.com` | Main Branch — Reception, Counter 1 |
| Customer (Agent) | `shyam20@gmail.com` | Main Branch — Pharmacy, Counter 2 |
| Customer | `sita20@gmail.com` | Any branch, any department |

## API Summary

| Endpoint | Method | Description | Access |
|---|---|---|---|
| `/api/auth/register` | POST | Create account | Public |
| `/api/auth/login` | POST | Login → JWT | Public |
| `/api/auth/me` | GET | Current user | Private |
| `/api/branches` | GET | List branches | Private |
| `/api/branches` | POST | Create branch | Admin |
| `/api/branches/:id` | GET / PUT / DELETE | Read / update / delete branch | Private / Admin |
| `/api/departments` | GET | List departments (public) | Public |
| `/api/departments` | POST | Create department | Admin |
| `/api/departments/:id` | GET / PATCH / DELETE | Department CRUD | Public read / Admin write |
| `/api/queues` | POST | Take a ticket | Private |
| `/api/queues` | GET | All tickets | Private |
| `/api/queues/my` | GET | My tickets (with live position) | Private |
| `/api/queues/stats` | GET | Today's stats | Admin |
| `/api/queues/call-next` | PATCH | Call next customer | Admin |
| `/api/queues/:id` | GET | Ticket details | Private |
| `/api/queues/:id/position` | GET | My spot in line | Private |
| `/api/queues/:id/status` | PATCH | Update ticket status | Admin |
| `/api/queues/:id/cancel` | PATCH | Cancel my ticket | Private (owner) |
| `/api/queues/:id` | DELETE | Delete ticket | Admin |
| `/api/agents` | GET / POST | List / create agents | Admin |
| `/api/agents/stats` | GET | Agent performance stats | Admin |
| `/api/agents/user/:userId` | GET | Agents for a user | Private |
| `/api/agents/department/:departmentId` | GET | Agents in a department | Private |
| `/api/agents/:id` | GET / PATCH / DELETE | Agent CRUD | Private / Admin |
| `/api/agents/:id/can-serve` | GET | Check token / office-hours capacity | Private |
| `/api/agents/:id/call-next` | PATCH | Call next customer (counter) | Agent |
| `/api/agents/:id/complete` | PATCH | Complete a ticket (counter) | Agent |
| `/api/notifications` | GET | My notifications | Private |
| `/api/notifications/unread-count` | GET | Unread count | Private |
| `/api/notifications/:id/read` | PATCH | Mark one as read | Private |
| `/api/notifications/read-all` | PATCH | Mark all as read | Private |

## Socket Events

| Event | Direction | Payload / Purpose |
|---|---|---|
| `queue:created` / `queue:updated` | server → client | New / changed ticket (branch + department rooms) |
| `queue:called` | server → client | Ticket called, shows counter number |
| `queue:position` | server → client | Live spot of each waiting ticket (private user room) |
| `queue:no-show` | server → client | Customer skipped after 2-minute no-show |
| `stats:updated` | server → client | Fresh daily counts (admin room) |
| `agent:updated` | server → client | Agent status / token count changed |
| `auto-call-next` | server → client | Countdown to the next auto-called ticket |
| `notification:new` | server → client | Bell + toast alert (private user room) |

## Design Highlights

- **Concurrent ticket booking** — two requests may pick the same number; the unique compound index rejects the loser (error `11000`) and the service retries with a fresh number (max 3 attempts).
- **No-show flow** — when a ticket is called, a 2-minute timer starts; if the customer never marks themselves as arrived, the ticket is auto-cancelled and skipped.
- **Auto call-next** — completing a ticket schedules the next waiting customer to be called (~30s), either through the assigned agent or the manual admin path.
- **Sockets are push-only** — REST stays the source of truth; clients re-fetch on reconnect.
- **Office hours & daily token caps** — agents can only take/complete tickets inside office hours and up to their daily limit; counters reset each day.
- **Brute-force protection** — 20 login/register attempts per 15 min (and a global 300 requests / 15 min rate limit).
- **No user enumeration** — auth errors are always generic.

## Roadmap

- [ ] Forgot / reset password flow
- [ ] Deployment (live demo link)
- [ ] Tests (Vitest/Jest)
- [ ] httpOnly cookie token storage
- [ ] Pagination
- [ ] Redis adapter for scaling Socket.IO

---

Built by **[Umesh Bogati]** — email: *bogatiu17@gmail.com*