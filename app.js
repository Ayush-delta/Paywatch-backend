import express from "express";
import { PORT } from './config/env.js';

import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRoutes.js';
import subscriptionRouter from './routes/subscriptionRoutes.js';
import connectToDatabase from "./database/mongodb.js";
import errorMiddleWare from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import workflowRouter from "./routes/workflow.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);

app.use(errorMiddleWare);

app.get('/', (req, res) => {
    res.send('welcome to the subscription platform');
});

app.listen(PORT || 3000, async () => {
    console.log(`Subscription tracker api is running on http://localhost:${PORT || 3000}`);

    await connectToDatabase();
})

export default app;