import { Router } from "express";
import {
  login,
  verifyOtp,
  getDashboard,
  getHotels,
  getHotelDetail,
  getOwners,
  getVerifications,
  createAdmin,
  getAdmins,
  assignDistricts,
  removeDistrict,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} from "@/controllers/superadmin.controller";
import { authenticate, authorize } from "@/middleware/auth";

const router = Router();

// Auth
router.post("/login", login);
router.post("/verify-otp", verifyOtp);

// Dashboard
router.get("/dashboard", authenticate, authorize("superadmin"), getDashboard);

// Hotels
router.get("/hotels", authenticate, authorize("superadmin"), getHotels);
router.get("/hotels/:hotelId", authenticate, authorize("superadmin"), getHotelDetail);

// Owners
router.get("/owners", authenticate, authorize("superadmin"), getOwners);

// Verifications
router.get("/verifications", authenticate, authorize("superadmin"), getVerifications);

// Admin management
router.post("/admin", authenticate, authorize("superadmin"), createAdmin);
router.get("/admins", authenticate, authorize("superadmin"), getAdmins);
router.post("/admin/:adminId/districts", authenticate, authorize("superadmin"), assignDistricts);
router.delete("/admin/:adminId/districts/:districtId", authenticate, authorize("superadmin"), removeDistrict);

// District CRUD
router.post("/districts", authenticate, authorize("superadmin"), createDistrict);
router.patch("/districts/:districtId", authenticate, authorize("superadmin"), updateDistrict);
router.delete("/districts/:districtId", authenticate, authorize("superadmin"), deleteDistrict);

export default router;
