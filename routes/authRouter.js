import { Router } from 'express';

import { signUp, signIn, signOut } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.get('/', (req, res) => {
    res.send({ title: 'Auth Route', status: 'Active' });
});

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.post('/sign-out', signOut);

export default authRouter;