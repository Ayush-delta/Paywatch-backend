import { Router } from 'express';
import { signUp, signIn, signOut, refreshToken } from "../controllers/auth.controller.js";
import dbReady from "../middlewares/dbReady.js";
import { clearCacheMiddleware } from "../middlewares/cache.js";

const authRouter = Router();

// Ensure DB is ready for authentication
authRouter.use(dbReady);

authRouter.get('/', (req, res) => {
    res.send({ title: 'Auth Route', status: 'Active' });
});

authRouter.post('/sign-up', clearCacheMiddleware(['/users', '/admin']), signUp);
authRouter.post('/sign-in', signIn);
authRouter.post('/sign-out', signOut);
authRouter.post('/refresh-token', refreshToken);

export default authRouter;