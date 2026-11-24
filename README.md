# PayWatch — Subscription Management & Security Intelligence

PayWatch is a subscription management platform designed to track subscriptions, automate renewal reminders, and monitor application security through an integrated security intelligence dashboard.

Built with Node.js, Express.js, MongoDB, Redis, and React.

---

## Features

- **Subscription Management:** Create, update, track, and cancel subscriptions.
- **Automated Reminders:** Email notifications 7, 5, 2, and 1 day before renewals.
- **Security WAF:** Detects SQL injection, XSS, directory traversal, and malicious payloads.
- **Bot Detection:** Identifies and blocks suspicious automated requests.
- **Rate Limiting:** Redis-backed protection against brute-force and excessive requests.
- **IP Blocking:** Automatically blocks suspicious IP addresses.
- **Activity Logging:** Centralized tracking of user activities and security events.
- **Admin Dashboard:** Real-time analytics for users, subscriptions, revenue, and security.
- **DataBot:** Generates simulated activity and backfills historical analytics data.
- **Traffic Simulator:** Generates periodic events for live dashboard demonstrations.

## Tech Stack

| Category | Technologies |
|---|---|
| Backend | Node.js, Express.js |
| Frontend | React 19, Vite |
| Styling | Tailwind CSS |
| Database | MongoDB, Mongoose |
| Caching | Redis, ioredis |
| Workflows | Upstash Workflow, QStash |
| Authentication | JWT, bcryptjs, HTTP-only Cookies |
| Security | Custom WAF, Rate Limiting, Bot Detection |
| Email | Nodemailer |
| Visualization | Recharts |
| UI | Lucide React, Framer Motion |

## Project Structure

```text
Subscription-tracker/
├── backend/
│   ├── bot/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middlewares/
│   │   └── security/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   │   ├── seed.js
│   │   └── simulate.js
│   ├── utils/
│   └── app.js
│
├── security-dashboard/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── layout/
│   │   └── pages/
│   └── vite.config.js
│
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js 18+
- MongoDB
- Redis
- Upstash account (QStash / Workflow)

### 1. Clone the Repository

```bash
git clone https://github.com/Ayush-delta/Subscription-tracker.git
cd Subscription-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env.development.local` file inside `backend/`:

```env
PORT=5500
SERVER_URL=http://localhost:5500
NODE_ENV=development

DB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

QSTASH_URL=your_qstash_url
QSTASH_TOKEN=your_qstash_token

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

Email_user=your_email@gmail.com
Email_pass=your_gmail_app_password

ENABLE_DATA_BOT=true
BOT_PULSE_MINUTES=60
```

### 3. Start Redis

```bash
docker run -d --name paywatch-redis \
-p 6379:6379 redis:alpine
```

### 4. Start Backend

```bash
npm run dev
```

Backend: `http://localhost:5500`

### 5. Frontend Setup

Open another terminal:

```bash
cd security-dashboard
npm install
npm run dev
```

Dashboard: `http://localhost:5173`

## Data Generation & Simulation

Run these commands from the `backend/` directory.

| Command | Description |
|---|---|
| `npm run seed` | Generate historical demo data |
| `npm run seed -- --clean` | Clear existing demo data and reseed |
| `npm run simulate` | Generate continuous demo traffic |
| `npm run bot` | Run the standalone DataBot |

## API Endpoints

All endpoints use the `/api/v1` prefix.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/sign-up` | Register a user |
| POST | `/auth/sign-in` | Authenticate a user |
| GET | `/users` | Retrieve users |
| GET | `/subscriptions` | Retrieve subscriptions |
| POST | `/subscriptions` | Create a subscription |
| POST | `/workflows/trigger` | Trigger renewal workflows |
| GET | `/admin/users/stats` | User statistics |
| GET | `/admin/users/growth` | User growth analytics |
| GET | `/admin/subscriptions/stats` | Subscription analytics |
| GET | `/admin/security/stats` | Security statistics |
| GET | `/admin/activity` | Global activity logs |
| POST | `/admin/bot/pulse` | Trigger DataBot |
| GET | `/admin/bot/status` | DataBot status |

## Security Testing

Test the security middleware using cURL.

**Bot Detection**

```bash
curl -H "User-Agent: python-requests" \
http://localhost:5500/api/v1/users
```

**SQL Injection Detection**

```bash
curl "http://localhost:5500/api/v1/users?id=1%20UNION%20SELECT%20*%20FROM%20users"
```

**Rate Limiting**

```bash
for i in {1..15}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
  http://localhost:5500/api/v1/auth/sign-in
done
```

Security events can be monitored through the Security Intelligence dashboard.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Submit a Pull Request.

## License

No license has been specified yet.

---

**Developed with Node.js, React, MongoDB, and Redis.**
