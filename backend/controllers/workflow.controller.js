import dayjs from "dayjs";
import Subscription from "../models/subscription.model.js";
import Activity from "../models/Activity.js";
import { createRequire } from "module";
import { sendReminderEmail } from "../utils/send-email.js";
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";

export const triggerWorkflows = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ status: 'active' });

        if (subscriptions.length === 0) {
            return res.status(200).json({ success: true, message: 'No active subscriptions found.' });
        }

        await Promise.all(subscriptions.map(async (sub) => {
            return workflowClient.trigger({
                url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
                body: { subscriptionId: sub._id },
            });
        }));

        res.status(200).json({ success: true, message: `Triggered ${subscriptions.length} workflow(s) successfully.` });
    } catch (error) {
        console.error("Workflow Trigger Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

const REMINDERS = [7, 5, 2, 1];

const require = createRequire(import.meta.url);

const { serve } = require("@upstash/workflow/express");

export const sendReminders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;
    const subscription = await fetchSubscription(context, subscriptionId);

    if (!subscription || subscription.status != 'active') return;

    const renewalDate = dayjs(subscription.renewalDate);


    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for Subscription ${subscriptionId}.Stopping workflow.`);
        return;
    }

    for (const dayBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(dayBefore, 'day');

        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `${dayBefore} days before reminder`, reminderDate);
        }

        await triggerReminder(context, `${dayBefore} days before reminder`, subscription);
    }
});

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId).populate('user', 'name email');
    })
}

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleep until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label} reminder`);

        await sendReminderEmail({
            to: subscription.user.email,
            type: label,
            subscription,
        })

        await Activity.create({
            type: "workflow",
            message: `Workflow executed: ${label} for "${subscription.name}"`,
            meta: {
                subscriptionId: subscription._id,
                label,
                userEmail: subscription.user.email,
            },
        });
    })
}