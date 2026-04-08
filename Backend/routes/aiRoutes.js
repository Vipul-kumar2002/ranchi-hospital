import express from "express";
import { transcribeHandwriting } from "../controllers/aiController.js";

const router = express.Router();

// This defines the sub-route: /api/ai/transcribe
router.post("/transcribe", transcribeHandwriting);

export default router;
