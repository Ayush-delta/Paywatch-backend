# Paywatch Backend API

Express.js + MongoDB backend service for Paywatch subscription management and security platform.

## Features
- **WAF Security**: Custom rate limiting, bot detection, IP banning, and XSS/SQLi payload validation.
- **Subscription Workflows**: QStash/Upstash workflow integration for scheduled email reminders.
- **JWT Authentication**: Short-lived access tokens with HTTP-only refresh cookies.

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Configure `.env.development.local`:
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
   ```

3. **Start Redis Container**
   ```bash
   docker-compose up -d
   ```

4. **Run Server**
   ```bash
   npm run dev
   ```
