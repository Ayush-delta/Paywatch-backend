# Paywatch Security Dashboard

This is the React frontend for the Paywatch subscription and security management platform, built with **Vite**, **React 19**, **Tailwind CSS**, and **Recharts**.

## 🚀 Features

- **Real-time Analytics**: Visualizations of user signups, subscription tracking, and system load.
- **Security Monitoring**: Track blocked attacks, WAF triggers, rate limit bans, and bot activity.
- **Wokflows**: View triggers for email reminders managed via Upstash/QStash.

## ⚙️ Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
To connect this frontend to your API, you need to configure the `VITE_API_BASE` variable. 
By default, locally it will fall back to `http://localhost:5500/api/v1`.

For Vercel or production deployments, add the variable to your hosting settings:
- `VITE_API_BASE`: `https://your-backend.onrender.com/api/v1`

### 3. Start Development Server
```bash
npm run dev
```

## ☁️ Deployment (Vercel)
1. Import this repository into Vercel.
2. Select the `security-dashboard` as your Root Directory.
3. In Environment Variables, set `VITE_API_BASE` to your live Render backend link.
4. Deploy!
