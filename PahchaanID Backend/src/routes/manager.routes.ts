import { Router } from "express";
import {
  login,
  verifyOtp,
  getProfile,
  createVerification,
  getVerifications,
} from "@/controllers/manager.controller";
import { authenticate, authorize } from "@/middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.get("/profile", authenticate, authorize("manager"), getProfile);
router.post("/verification", authenticate, authorize("manager"), createVerification);
router.get("/verifications", authenticate, authorize("manager"), getVerifications);

export default router;
