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

// Ensure env is loaded when executed directly
dotenv.config({ path: path.resolve(__dirname, '../.env.development.local') });

// Data pools for realistic generation
const FIRST_NAMES = [
    'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Charlotte', 'Elijah', 'Amelia',
    'James', 'Ava', 'William', 'Sophia', 'Benjamin', 'Isabella', 'Lucas', 'Mia',
    'Henry', 'Evelyn', 'Alexander', 'Harper', 'Daniel', 'Camila', 'Matthew', 'Aria'
];

const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'
];

const EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'proton.me'];

const SAAS_SERVICES = [
    { name: 'Netflix Premium', price: 19.99, frequency: 'monthly', category: 'entertainment', paymentMethod: 'Credit Card' },
    { name: 'Spotify Duo', price: 14.99, frequency: 'monthly', category: 'entertainment', paymentMethod: 'PayPal' },
    { name: 'GitHub Copilot', price: 10.00, frequency: 'monthly', category: 'technology', paymentMethod: 'Credit Card' },
    { name: 'ChatGPT Plus', price: 20.00, frequency: 'monthly', category: 'technology', paymentMethod: 'Credit Card' },
    { name: 'AWS Cloud Hosting', price: 74.50, frequency: 'monthly', category: 'technology', paymentMethod: 'Credit Card' },
    { name: 'Wall Street Journal', price: 9.99, frequency: 'monthly', category: 'news', paymentMethod: 'Apple Pay' },
    { name: 'Notion Team', price: 12.00, frequency: 'monthly', category: 'technology', paymentMethod: 'Credit Card' },
    { name: 'Equinox Gym Pass', price: 85.00, frequency: 'monthly', category: 'lifestyle', paymentMethod: 'Credit Card' },
    { name: 'Figma Professional', price: 15.00, frequency: 'monthly', category: 'technology', paymentMethod: 'PayPal' },
    { name: 'The Athletic Sports', price: 7.99, frequency: 'monthly', category: 'sports', paymentMethod: 'Credit Card' },
];

const ATTACKER_IPS = [
    '185.220.101.5',
    '45.154.255.88',
    '194.26.29.112',
    '89.248.163.74',
    '103.152.220.14',
    '91.240.118.172',
    '185.191.171.12',
    '198.199.96.18',
    '178.62.204.144',
    '146.190.115.89',
];

const ATTACK_VECTORS = [
    { path: '/api/v1/auth/sign-in', method: 'POST', reason: 'Brute-force login rate-limited' },
    { path: '/api/v1/users?id=1%20UNION%20SELECT', method: 'GET', reason: 'SQL Injection detected by WAF' },
    { path: '/api/v1/subscriptions', method: 'GET', reason: 'Malicious scraper bot (python-requests)' },
    { path: '/.env', method: 'GET', reason: 'Environment traversal probe blocked' },
    { path: '/wp-login.php', method: 'GET', reason: 'Automated vulnerability scanner blocked' },
    { path: '/api/v1/auth/sign-up', method: 'POST', reason: 'Rapid registration rate-limit triggered' },
];

let botState = {
    running: false,
    timer: null,
    lastRunAt: null,
    totalFeeds: 0,
    history: [],
};

let cachedPasswordHash = null;

async function getPasswordHash() {
    if (!cachedPasswordHash) {
        cachedPasswordHash = await bcrypt.hash('DemoPassword123!', 8);
    }
    return cachedPasswordHash;
}

/**
 * Random integer between min and max inclusive
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a full day's data with timestamps scattered across that day
 * @param {Date} date The target date for which to generate data
 * @param {Object} counts Number of items to generate
 */
export async function generateDayData(date = new Date(), options = {}) {
    const userCount = options.userCount ?? randomInt(3, 7);
    const subCount = options.subCount ?? randomInt(2, 5);
    const attackCount = options.attackCount ?? randomInt(6, 12);

    const baseDate = new Date(date);
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();

    const password = await getPasswordHash();
    const newUsers = [];

    // 1. Generate Users scattered throughout the day
    for (let i = 0; i < userCount; i++) {
        const first = FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)];
        const last = LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)];
        const domain = EMAIL_DOMAINS[randomInt(0, EMAIL_DOMAINS.length - 1)];
        const name = `${first} ${last}`;
        const email = `${first.toLowerCase()}.${last.toLowerCase()}.${randomInt(100, 9999)}@${domain}`;

        // Random hour & minute within that specific date
        const createdAt = new Date(year, month, day, randomInt(8, 22), randomInt(0, 59));

        try {
            const user = await User.create({
                name,
                email,
                password,
                createdAt,
                updatedAt: createdAt,
            });

            await Activity.create({
                type: 'user',
                message: `New user registered: ${user.name}`,
                meta: { userId: user._id, email: user.email },
                createdAt,
            });

            newUsers.push(user);
        } catch (err) {
            // Skip on rare duplicate email
        }
    }

    // 2. Generate Subscriptions for new or existing users
    const allUsers = await User.find().limit(50);
    const candidateUsers = newUsers.length > 0 ? newUsers : allUsers;

    if (candidateUsers.length > 0) {
        for (let i = 0; i < subCount; i++) {
            const user = candidateUsers[randomInt(0, candidateUsers.length - 1)];
            const service = SAAS_SERVICES[randomInt(0, SAAS_SERVICES.length - 1)];
            const statusRoll = randomInt(1, 10);
            const status = statusRoll <= 7 ? 'active' : statusRoll <= 9 ? 'expired' : 'cancelled';

            const startDate = new Date(year, month, day, randomInt(9, 21), randomInt(0, 59));
            const renewalDate = new Date(startDate);
            if (status === 'expired') {
                renewalDate.setDate(renewalDate.getDate() - randomInt(1, 10));
            } else {
                renewalDate.setDate(renewalDate.getDate() + randomInt(15, 30));
            }

            try {
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
            } catch (err) {
                // Ignore validation errors
            }
        }
    }

    // 3. Generate Security Logs (WAF blocks)
    for (let i = 0; i < attackCount; i++) {
        const ip = ATTACKER_IPS[randomInt(0, ATTACKER_IPS.length - 1)];
        const vector = ATTACK_VECTORS[randomInt(0, ATTACK_VECTORS.length - 1)];
        const createdAt = new Date(year, month, day, randomInt(0, 23), randomInt(0, 59));

        try {
            await SecurityLog.create({
                ip,
                path: vector.path,
                method: vector.method,
                reason: vector.reason,
                createdAt,
            });

            // Log high-priority threats to Activity feed
            if (i % 3 === 0) {
                await Activity.create({
                    type: 'security',
                    message: `Blocked ${vector.reason} from ${ip}`,
                    meta: { ip, path: vector.path },
                    createdAt,
                });
            }
        } catch (err) {
            // Ignore errors
        }
    }

    // 4. Generate Workflow Reminder Activities
    const workflowRuns = randomInt(1, 3);
    for (let i = 0; i < workflowRuns; i++) {
        const createdAt = new Date(year, month, day, randomInt(6, 18), randomInt(0, 59));
        const remindersCount = randomInt(2, 6);
        await Activity.create({
            type: 'workflow',
            message: `Automated reminder workflow executed (${remindersCount} reminders dispatched)`,
            meta: { dispatched: remindersCount },
            createdAt,
        });
    }

    // 5. Invalidate Redis Caches so dashboard gets live metrics immediately
    await invalidate(
        'admin:users:stats',
        'admin:users:growth:7d',
        'admin:users:growth:30d',
        'admin:subscriptions:stats',
        'admin:security:stats',
        'admin:activity'
    );

    const summary = {
        date: baseDate.toISOString().slice(0, 10),
        usersAdded: newUsers.length,
        subscriptionsAdded: subCount,
        attacksBlocked: attackCount,
        workflowsRun: workflowRuns,
        timestamp: new Date(),
    };

    botState.lastRunAt = new Date();
    botState.totalFeeds += 1;
    botState.history.unshift(summary);
    if (botState.history.length > 20) botState.history.pop();

    return summary;
}

/**
 * Checks the last N days. If any day has 0 user registrations, backfills it.
 * This guarantees the 7-day dashboard chart always has rich data on startup.
 */
export async function backfillRecentDays(days = 7) {
    console.log(`[DataBot] 🔍 Checking database for missing days over the last ${days} days...`);

    const today = new Date();
    let backfilledDays = 0;

    for (let i = days - 1; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setDate(today.getDate() - i);
        targetDate.setHours(0, 0, 0, 0);

        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const count = await User.countDocuments({
            createdAt: { $gte: targetDate, $lt: nextDate },
        });

        if (count === 0) {
            console.log(`[DataBot] 📅 Generating missing data for ${targetDate.toISOString().slice(0, 10)}...`);
            await generateDayData(targetDate);
            backfilledDays++;
        }
    }

    if (backfilledDays > 0) {
        console.log(`[DataBot] ✨ Successfully backfilled ${backfilledDays} day(s) of data.`);
    } else {
        console.log(`[DataBot] ✅ All recent days already have active data.`);
    }
}

/**
 * Continuous daily feeder bot.
 * Runs on startup (gap backfill), feeds an ongoing pulse, and schedules hourly/daily updates.
 */
export async function startDataBot(options = {}) {
    if (botState.running) {
        console.log('[DataBot] ℹ️ Bot is already running.');
        return;
    }

    const intervalMinutes = parseInt(process.env.BOT_PULSE_MINUTES || options.intervalMinutes || '60', 10);

    console.log('[DataBot] 🤖 Starting Autonomous Daily Data Bot...');
    botState.running = true;

    try {
        // 1. Ensure all recent 7 days have data so charts look great
        await backfillRecentDays(7);

        // 2. Feed an incremental pulse for today
        const pulse = await generateDayData(new Date(), {
            userCount: randomInt(1, 3),
            subCount: randomInt(1, 2),
            attackCount: randomInt(2, 5),
        });

        console.log(
            `[DataBot] 🚀 Live pulse generated: +${pulse.usersAdded} users, +${pulse.subscriptionsAdded} subs, +${pulse.attacksBlocked} attacks blocked.`
        );

        // 3. Set interval to continue feeding data throughout the day
        const intervalMs = intervalMinutes * 60 * 1000;
        botState.timer = setInterval(async () => {
            try {
                console.log(`[DataBot] ⏰ Automated feed pulse running...`);
                const result = await generateDayData(new Date(), {
                    userCount: randomInt(1, 2),
                    subCount: randomInt(1, 2),
                    attackCount: randomInt(2, 4),
                });
                console.log(
                    `[DataBot] 📈 Feed pulse completed: +${result.usersAdded} users, +${result.attacksBlocked} attacks. Dashboard refreshed.`
                );
            } catch (err) {
                console.error('[DataBot] ⚠️ Automated feed error:', err.message);
            }
        }, intervalMs);

        console.log(`[DataBot] ⏳ Bot scheduled to drip feed fresh data every ${intervalMinutes} minutes.`);
    } catch (err) {
        console.error('[DataBot] ❌ Error starting bot:', err);
    }
}

export function stopDataBot() {
    if (botState.timer) {
        clearInterval(botState.timer);
        botState.timer = null;
    }
    botState.running = false;
    console.log('[DataBot] 🛑 Bot stopped.');
}

export function getDataBotStatus() {
    return {
        running: botState.running,
        lastRunAt: botState.lastRunAt,
        totalFeeds: botState.totalFeeds,
        history: botState.history,
    };
}

// Standalone execution mode: node bot/dataBot.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const DB_URI = process.env.DB_URI;
    if (!DB_URI) {
        console.error('❌ DB_URI missing from environment.');
        process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB for Standalone Data Bot...');
    mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 5000 })
        .then(() => {
            console.log('✅ Connected to MongoDB.');
            startDataBot({ intervalMinutes: parseInt(process.env.BOT_PULSE_MINUTES || '30', 10) });
        })
        .catch((err) => {
            console.error('❌ MongoDB Connection failed:', err);
            process.exit(1);
        });

    process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down Data Bot...');
        stopDataBot();
        await mongoose.disconnect();
        process.exit(0);
    });
}
