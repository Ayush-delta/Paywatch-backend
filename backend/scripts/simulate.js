import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/user.model.js';
import Subscription from '../models/subscription.model.js';
import SecurityLog from '../models/SecurityLog.js';
import Activity from '../models/Activity.js';
import { invalidate } from '../utils/cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.development.local') });

const DB_URI = process.env.DB_URI;

if (!DB_URI) {
    console.error('❌ Error: DB_URI is missing from .env.development.local');
    process.exit(1);
}

const INTERVAL_MS = parseInt(process.env.SIMULATE_INTERVAL || '12000', 10);

const firstNames = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Lucas', 'Mia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

const services = [
    { name: 'Netflix Premium', price: 19.99, frequency: 'monthly', category: 'entertainment', paymentMethod: 'Credit Card' },
    { name: 'Spotify Individual', price: 10.99, frequency: 'monthly', category: 'entertainment', paymentMethod: 'PayPal' },
    { name: 'GitHub Copilot', price: 10.00, frequency: 'monthly', category: 'technology', paymentMethod: 'Credit Card' },
    { name: 'Notion AI', price: 8.00, frequency: 'monthly', category: 'technology', paymentMethod: 'Credit Card' },
    { name: 'The New York Times', price: 4.00, frequency: 'monthly', category: 'news', paymentMethod: 'Apple Pay' },
    { name: 'YouTube Premium', price: 13.99, frequency: 'monthly', category: 'entertainment', paymentMethod: 'Google Pay' },
    { name: 'Strava Subscription', price: 11.99, frequency: 'monthly', category: 'sports', paymentMethod: 'Credit Card' },
];

const attackerIps = [
    '185.220.101.5',
    '45.154.255.88',
    '194.26.29.112',
    '89.248.163.74',
    '103.152.220.14',
    '91.240.118.172',
    '185.191.171.12',
];

const attackTypes = [
    { path: '/api/v1/auth/sign-in', method: 'POST', reason: 'Brute force login rate-limited' },
    { path: '/api/v1/users?id=1%20UNION%20SELECT', method: 'GET', reason: 'SQL Injection detected by WAF' },
    { path: '/api/v1/subscriptions', method: 'GET', reason: 'Suspicious bot user-agent blocked' },
    { path: '/.env', method: 'GET', reason: 'Directory traversal probe blocked' },
    { path: '/api/v1/auth/sign-up', method: 'POST', reason: 'Rapid registration rate-limited' },
];

async function generateEvent() {
    const eventType = Math.floor(Math.random() * 4); // 0: User, 1: Sub, 2: Security, 3: Workflow

    try {
        if (eventType === 0) {
            // New User
            const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
            const email = `${name.toLowerCase().replace(/\s+/g, '.')}.${Date.now().toString().slice(-4)}@example.com`;
            const hashedPassword = await bcrypt.hash('Password123!', 8);

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
            });

            await Activity.create({
                type: 'user',
                message: `New user registered: ${user.name}`,
                meta: { userId: user._id, email: user.email },
            });

            console.log(`[SIMULATOR] 👤 Created User: ${user.name} (${user.email})`);
        } else if (eventType === 1) {
            // New Subscription
            const users = await User.find().limit(20);
            if (!users.length) return;
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const service = services[Math.floor(Math.random() * services.length)];

            const startDate = new Date();
            const renewalDate = new Date();
            renewalDate.setDate(renewalDate.getDate() + 30);

            const sub = await Subscription.create({
                name: service.name,
                price: service.price,
                currency: 'USD',
                frequency: service.frequency,
                category: service.category,
                paymentMethod: service.paymentMethod,
                status: 'active',
                startDate,
                renewalDate,
                user: randomUser._id,
            });

            await Activity.create({
                type: 'subscription',
                message: `New subscription: ${sub.name} ($${sub.price}) for ${randomUser.name}`,
                meta: { subscriptionId: sub._id },
            });

            console.log(`[SIMULATOR] 💳 Added Subscription: ${sub.name} for ${randomUser.name}`);
        } else if (eventType === 2) {
            // Security Threat Blocked
            const ip = attackerIps[Math.floor(Math.random() * attackerIps.length)];
            const attack = attackTypes[Math.floor(Math.random() * attackTypes.length)];

            await SecurityLog.create({
                ip,
                path: attack.path,
                method: attack.method,
                reason: attack.reason,
            });

            await Activity.create({
                type: 'security',
                message: `WAF blocked ${attack.reason} from ${ip}`,
                meta: { ip, path: attack.path },
            });

            console.log(`[SIMULATOR] 🛡️ Blocked Attack: ${attack.reason} from ${ip}`);
        } else {
            // Workflow Event
            const count = Math.floor(Math.random() * 5) + 1;
            await Activity.create({
                type: 'workflow',
                message: `Upstash renewal reminder job executed (${count} sent)`,
                meta: { count },
            });

            console.log(`[SIMULATOR] ⚙️ Workflow executed: ${count} reminder emails sent`);
        }

        // Invalidate Redis caches so dashboard sees fresh data instantly
        await invalidate(
            'admin:users:stats',
            'admin:users:growth:7d',
            'admin:users:growth:30d',
            'admin:subscriptions:stats',
            'admin:security:stats',
            'admin:activity'
        );
    } catch (err) {
        console.error('[SIMULATOR] ⚠️ Error executing event:', err.message);
    }
}

async function start() {
    console.log('🔄 Connecting to MongoDB for Traffic Simulator...');
    await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`🚀 Simulator running! Generating automated events every ${INTERVAL_MS / 1000} seconds.`);
    console.log('💡 Press Ctrl+C at any time to stop.\n');

    // Initial immediate tick
    await generateEvent();

    setInterval(async () => {
        await generateEvent();
    }, INTERVAL_MS);
}

start().catch((err) => {
    console.error('❌ Failed to start simulator:', err);
    process.exit(1);
});
