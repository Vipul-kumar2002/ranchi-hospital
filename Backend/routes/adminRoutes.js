import express from "express";
import {
  getHospitalInfo,
  updatePrompt,
  updateApiKey,
  updatePatientSource, // 🔥 1. Add the import here
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/hospital-info", getHospitalInfo);
router.post("/update-prompt", updatePrompt);
router.post("/update-api-key", updateApiKey);

// 🔥 2. Add the new route here to match your Frontend request
router.post("/update-patient-source", updatePatientSource);

export default router;
