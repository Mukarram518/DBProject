import { Router } from "express";
import { getAnalyticsReport } from "../controllers/report.controller";

const router = Router();

router.get("/analytics", getAnalyticsReport);

export default router;
