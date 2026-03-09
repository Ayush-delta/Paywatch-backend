import { Router } from "express";
import { sendReminders, triggerWorkflows } from "../controllers/workflow.controller.js";

const workflowRouter = Router();

workflowRouter.post('/subscription/reminder', sendReminders);
workflowRouter.post('/trigger', triggerWorkflows);

export default workflowRouter;