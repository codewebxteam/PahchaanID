import { Router } from "express";
import {
  register,
  login,
  verifyOtp,
  getProfile,
  addHotel,
  subscribe,
  addManager,
  removeManager,
  getHotelVerifications,
} from "@/controllers/owner.controller";
import { authenticate, authorize } from "@/middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.get("/profile", authenticate, authorize("owner"), getProfile);
router.post("/hotel", authenticate, authorize("owner"), addHotel);
router.post("/hotel/:hotelId/subscribe", authenticate, authorize("owner"), subscribe);
router.post("/hotel/:hotelId/manager", authenticate, authorize("owner"), addManager);
router.delete("/hotel/:hotelId/manager/:managerId", authenticate, authorize("owner"), removeManager);
router.get("/hotel/:hotelId/verifications", authenticate, authorize("owner"), getHotelVerifications);

export default router;
