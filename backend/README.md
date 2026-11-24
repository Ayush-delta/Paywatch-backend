# Paywatch Backend API

Express.js + MongoDB backend service for the Paywatch subscription management and security platform.

## 🚀 Features
- **WAF Security Engine**: Custom IP-level rate limiting, bot detection, IP banning, and XSS/SQLi payload sanitization.
- **Autonomous Daily DataBot**: Integrated background worker that automatically feeds realistic users, subscriptions, and security events into MongoDB and keeps the 7-day analytics active.
- **Subscription Workflows**: QStash/Upstash workflow integration for scheduled renewal email reminders (7, 5, 2, 1 days prior).
- **Redis Caching**: High-performance cache-aside caching (`cacheOrFetch`) for aggregate analytics with instant invalidation on data changes.
- **JWT Authentication**: Short-lived access tokens with HTTP-only refresh cookies.

## ⚙️ Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create `.env.development.local` in the `backend/` directory:
   ```env
   PORT=5500
   SERVER_URL="http://localhost:5500"
   NODE_ENV=development
   DB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   JWT_EXPIRES_IN="15m"
   JWT_REFRESH_SECRET=<your_refresh_secret>
   QSTASH_URL=<your_qstash_url>
   QSTASH_TOKEN=<your_qstash_token>
   REDIS_HOST="127.0.0.1"
   REDIS_PORT=6379
   Email_user=<your_email_address>
   Email_pass=<your_email_app_password>
   ENABLE_DATA_BOT=true
   BOT_PULSE_MINUTES=60
   ```

3. **Start Redis Container**
   ```bash
   docker run -d --name paywatch-redis -p 6379:6379 redis:alpine
   ```

4. **Run Server**
   ```bash
   npm run dev
   ```

## 🤖 Data Generation & Simulation Scripts

- **Run DataBot Standalone**:
  ```bash
  npm run bot
  ```
- **Run Curated One-Time Seeder**:
  ```bash
  npm run seed
  # With clean reset:
  npm run seed -- --clean
  ```
- **Run Live Demo Traffic Simulator**:
  ```bash
  npm run simulate
  ```
