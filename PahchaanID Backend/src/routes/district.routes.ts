import { Router } from "express";
import { getDistrictsByState } from "@/controllers/district.controller";

const router = Router();

router.get("/", getDistrictsByState);

export default router;
