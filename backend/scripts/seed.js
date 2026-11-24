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

// Load env relative to backend root
dotenv.config({ path: path.resolve(__dirname, '../.env.development.local') });

const DB_URI = process.env.DB_URI;

if (!DB_URI) {
    console.error('❌ Error: DB_URI is missing from .env.development.local');
    process.exit(1);
}

const sampleUsers = [
    { name: 'Sarah Connor', email: 'sarah.connor@example.com', daysAgo: 6 },
    { name: 'Marcus Vance', email: 'm.vance@example.com', daysAgo: 5 },
    { name: 'Elena Rostova', email: 'elena.rostova@example.com', daysAgo: 4 },
    { name: 'David Kim', email: 'david.kim@example.com', daysAgo: 3 },
    { name: 'Aaliyah Patel', email: 'aaliyah.p@example.com', daysAgo: 2 },
    { name: 'Liam O\'Connor', email: 'liam.oc@example.com', daysAgo: 1 },
    { name: 'Chloe Bennett', email: 'chloe.b@example.com', daysAgo: 0 },
    { name: 'Jordan Hayes', email: 'jordan.hayes@example.com', daysAgo: 0 },
];

const sampleServices = [
    { name: 'Netflix Premium', price: 19.99, frequency: 'monthly', category: 'entertainment', paymentMethod: 'Credit Card' },
    { name: 'Spotify Duo', price: 14.99, frequency: 'monthly', category: 'entertainment', paymentMethod: 'PayPal' },
    { name: 'GitHub Copilot', price: 10.00, frequency: 'monthly', category: 'technology', paymentMethod: 'Credit Card' },
    { name: 'AWS Cloud Hosting', price: 65.50, frequency: 'monthly', category: 'technology', paymentMethod: 'Credit Card' },
    { name: 'Bloomberg Terminal', price: 250.00, frequency: 'monthly', category: 'finance', paymentMethod: 'Bank Transfer' },
    { name: 'Gym & Fitness Pass', price: 45.00, frequency: 'monthly', category: 'lifestyle', paymentMethod: 'Credit Card' },
    { name: 'The Athletic Sports', price: 7.99, frequency: 'monthly', category: 'sports', paymentMethod: 'Credit Card' },
    { name: 'ChatGPT Plus', price: 20.00, frequency: 'monthly', category: 'technology', paymentMethod: 'Credit Card' },
];

const attackerIps = [
    '185.220.101.5',
    '45.154.255.88',
    '194.26.29.112',
    '89.248.163.74',
    '103.152.220.14',
];

const attackReasons = [
    { path: '/api/v1/users?id=1 UNION SELECT *', method: 'GET', reason: 'SQL Injection payload detected by WAF' },
    { path: '/api/v1/auth/sign-in', method: 'POST', reason: 'Rate limit exceeded: 15 failed attempts' },
    { path: '/api/v1/subscriptions', method: 'GET', reason: 'Malicious crawler detected (python-requests)' },
    { path: '/wp-login.php', method: 'GET', reason: 'Suspicious path scanning blocked' },
    { path: '/api/v1/admin/users', method: 'GET', reason: 'Unauthorized access attempt to admin endpoint' },
];

async function seed() {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    const clean = process.argv.includes('--clean');
    if (clean) {
        console.log('🧹 Cleaning existing test data...');
        await Promise.all([
            User.deleteMany({ email: { $regex: /@example\.com$/ } }),
            Subscription.deleteMany({}),
            SecurityLog.deleteMany({}),
            Activity.deleteMany({}),
        ]);
        console.log('✨ Cleaned.');
    }

    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const createdUsers = [];

    console.log('🌱 Seeding users across the last 7 days...');
    for (const u of sampleUsers) {
        let user = await User.findOne({ email: u.email });
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - u.daysAgo);
        createdAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

        if (!user) {
            user = await User.create({
                name: u.name,
                email: u.email,
                password: hashedPassword,
                createdAt,
                updatedAt: createdAt,
            });

            await Activity.create({
                type: 'user',
                message: `New user registered: ${user.name}`,
                meta: { userId: user._id, email: user.email },
                createdAt,
            });
        }
        createdUsers.push(user);
    }

    console.log('🌱 Seeding subscriptions (active, cancelled, expired)...');
    for (let i = 0; i < createdUsers.length; i++) {
        const user = createdUsers[i];
        const service = sampleServices[i % sampleServices.length];
        const status = i % 4 === 0 ? 'cancelled' : i % 5 === 0 ? 'expired' : 'active';

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (status === 'expired' ? 45 : 15));

        const renewalDate = new Date();
        if (status === 'expired') {
            renewalDate.setDate(renewalDate.getDate() - 5);
        } else {
            renewalDate.setDate(renewalDate.getDate() + 15);
        }

        const sub = await Subscription.create({
            name: service.name,
            price: service.price,
            currency: 'USD',
            frequency: service.frequency,
            category: service.category,
            paymentMethod: service.paymentMethod,
            status,
            startDate,
            renewalDate,
            user: user._id,
            createdAt: startDate,
        });

        await Activity.create({
            type: 'subscription',
            message: `New subscription: ${sub.name} ($${sub.price}) for ${user.name}`,
            meta: { subscriptionId: sub._id, status },
            createdAt: startDate,
        });
    }

    console.log('🌱 Seeding security logs & attacker metrics...');
    for (let i = 0; i < 20; i++) {
        const ip = attackerIps[i % attackerIps.length];
        const attack = attackReasons[i % attackReasons.length];
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 12 * 60 * 60 * 1000));

        await SecurityLog.create({
            ip,
            path: attack.path,
            method: attack.method,
            reason: attack.reason,
            createdAt,
        });

        if (i % 3 === 0) {
            await Activity.create({
                type: 'security',
                message: `Blocked ${attack.reason} from IP ${ip}`,
                meta: { ip, path: attack.path },
                createdAt,
            });
        }
    }

    console.log('🌱 Seeding workflow automation activities...');
    for (let i = 0; i < 4; i++) {
        const createdAt = new Date(Date.now() - (i + 1) * 3 * 60 * 60 * 1000);
        await Activity.create({
            type: 'workflow',
            message: `Automated reminder workflow executed (${4 - i} reminders dispatched)`,
            meta: { batchSize: 4 - i },
            createdAt,
        });
    }

    console.log('⚡ Invalidating Redis cache for dashboard stats...');
    await invalidate(
        'admin:users:stats',
        'admin:users:growth:7d',
        'admin:users:growth:30d',
        'admin:subscriptions:stats',
        'admin:security:stats',
        'admin:activity'
    );

    console.log('🎉 Seeding completed successfully! Refresh your dashboard.');
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
