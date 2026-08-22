# Queueflow

A full-stack **real-time queue management system** — like a bank or hospital token counter. Customers take a ticket, staff call the next one, and every screen updates **instantly** via WebSockets.

---

## Features 

- **Authentication** — Register / login with JWT, bcrypt-hashed passwords, roles (`user` / `admin`)
- **Branches & Departments** — Admin manages branches; each department issues prefixed tickets (`A007`)
- **Ticket lifecycle** — `waiting → called → serving → completed / cancelled`, resets daily
- **Call Next** — Serves today's oldest waiting ticket per department/branch
- **Real-time updates** — Socket.IO pushes every change to the right rooms instantly
- **Notifications** — Customer gets a live toast + bell alert when it's their turn
- **Admin dashboard** — Live daily stats (waiting / serving / completed)
- **Security** — Helmet, CORS whitelist, rate limiting, Zod validation, JWT-protected sockets
- **Race-safe tickets** — Unique index `{department, date, ticketNumber}` + retry = no duplicate numbers under concurrent load

## Tech Stack

| **Frontend** | React 19 · TypeScript · Vite · Redux Toolkit · Tailwind CSS · Socket.IO client |
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
```

##  Run Locally

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

##  API Summary

| Endpoint | Method | Description | Access |
|---|---|---|---|
| `/api/auth/register` | POST | Create account | Public |
| `/api/auth/login` | POST | Login → JWT | Public |
| `/api/auth/me` | GET | Current user | Private |
| `/api/branches/**` | CRUD | Manage branches | Private / Admin |
| `/api/departments/**` | CRUD | Manage departments | Public read / Admin write |
| `/api/queues` | POST | Take a ticket | Private |
| `/api/queues/my` | GET | My tickets | Private |
| `/api/queues/stats` | GET | Today's stats | Admin |
| `/api/queues/call-next` | PATCH | Call next customer | Admin |
| `/api/queues/:id/status` | PATCH | Update ticket status | Admin |
| `/api/notifications/**` | GET/PATCH | Read & mark notifications | Private |

## Design Highlights

- **Concurrent ticket booking** — two requests may pick the same number; the unique compound index rejects the loser (error `11000`) and the service retries with a fresh number.
- **Sockets are push-only** — REST stays the source of truth; clients re-fetch on reconnect.
- **Brute-force protection** — only 20 login/register attempts per 15 min.
- **No user enumeration** — auth errors are always generic.

## Roadmap :
## remain to complete

- [ ] Forgot / reset password flow
- [ ] Deployment (live demo link)
- [ ] Tests (Vitest/Jest)
- [ ] httpOnly cookie token storage
- [ ] Pagination
- [ ] Redis adapter for scaling Socket.IO

---

Built by **[Umesh Bogati]** email: *bogatiu17@gmail.com*
