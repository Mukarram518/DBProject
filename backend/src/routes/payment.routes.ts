import { Router } from "express";
import { getPayments } from "../controllers/payment.controller";

const router = Router();

router.get("/", getPayments);

export default router;
