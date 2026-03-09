import express from "express";
import cors from "cors";
import { PORT } from './config/env.js';
import securityMiddleware from "./middlewares/security/index.js";
import securityRouter from "./routes/security.routes.js";

import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRoutes.js';
import subscriptionRouter from './routes/subscriptionRoutes.js';
import connectToDatabase from "./database/mongodb.js";
import errorMiddleWare from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import authMiddleware from "./middlewares/auth.middleware.js";
import workflowRouter from "./routes/workflow.routes.js";
import adminRouter from "./routes/admin.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(securityMiddleware);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);
app.use('/api/v1/security', securityRouter);
app.use('/api/v1/admin', adminRouter);
app.use(errorMiddleWare);

app.get('/', (req, res) => {
    res.send('Welcome to the Paywatch API');
});

app.listen(PORT || 3000, async () => {
    console.log(`Paywatch API is running on http://localhost:${PORT || 3000}`);

    await connectToDatabase();
})

export default app;