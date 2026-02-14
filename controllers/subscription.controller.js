import Subscription from '../models/subscription.model.js'
import Activity from '../models/Activity.js'
import { workflowClient } from '../config/upstash.js'
import { SERVER_URL } from '../config/env.js'

export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find().populate('user', 'name email');

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
}

export const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate('user', 'name email');

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (e) {
    next(e);
  }
}

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    // Log to unified Activity stream
    await Activity.create({
      type: "subscription",
      message: `New subscription created: ${subscription.name} ($${subscription.price}/${subscription.frequency})`,
      meta: {
        subscriptionId: subscription._id,
        userId: req.user._id,
        name: subscription.name,
        price: subscription.price,
        frequency: subscription.frequency,
      },
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        'content-type': 'application/json',
      },
      retries: 0,
    })

    res.status(201).json({ success: true, data: { subscription, workflowRunId } });
  } catch (e) {
    next(e);
  }
}

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    if (req.user.id !== req.params.id) {
      const error = new Error('You are not the owner of this account');
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
}