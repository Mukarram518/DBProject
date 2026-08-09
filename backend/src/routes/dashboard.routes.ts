import { Router } from "express";
import { getDashboardOverview } from "../controllers/dashboard.controller";

const router = Router();

router.get("/stats", getDashboardOverview);

export default router;
