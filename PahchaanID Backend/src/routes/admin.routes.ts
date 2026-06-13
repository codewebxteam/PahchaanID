import { Router } from "express";
import {
  login,
  verifyOtp,
  getDashboard,
  getHotels,
  getHotelDetail,
  getVerifications,
} from "@/controllers/admin.controller";
import { authenticate, authorize } from "@/middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.get("/dashboard", authenticate, authorize("admin"), getDashboard);
router.get("/hotels", authenticate, authorize("admin"), getHotels);
router.get("/hotels/:hotelId", authenticate, authorize("admin"), getHotelDetail);
router.get("/verifications", authenticate, authorize("admin"), getVerifications);

export default router;
