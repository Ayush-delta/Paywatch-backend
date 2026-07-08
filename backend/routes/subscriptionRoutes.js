import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import {
    getAllSubscriptions,
    getSubscription,
    createSubscription,
    getUserSubscriptions,
} from '../controllers/subscription.controller.js';
import dbReady from '../middlewares/dbReady.js';
import cacheMiddleware, { clearCacheMiddleware } from '../middlewares/cache.js';

const subscriptionRouter = Router();

// Ensure DB is connected
subscriptionRouter.use(dbReady);

// Clear Cache on mutations
const clearCacheOnMutation = clearCacheMiddleware(['/subscriptions', '/admin']);

subscriptionRouter.get('/', cacheMiddleware(30), getAllSubscriptions);

subscriptionRouter.get('/user/:id', authorize, cacheMiddleware(30), getUserSubscriptions);

subscriptionRouter.post('/', authorize, clearCacheOnMutation, createSubscription);

subscriptionRouter.put('/:id', clearCacheOnMutation, (req, res) => res.send({ title: 'UPDATE subscription' }));

subscriptionRouter.delete('/:id', clearCacheOnMutation, (req, res) => res.send({ title: 'DELETE a subscription' }));

subscriptionRouter.put('/:id/cancel', clearCacheOnMutation, (req, res) => res.send({ title: 'CANCEL subscription' }));

subscriptionRouter.get('/:id', getSubscription);

subscriptionRouter.get('/upcoming-renewals', (req, res) => res.send({ title: 'GET upcoming renewals' }));

export default subscriptionRouter;