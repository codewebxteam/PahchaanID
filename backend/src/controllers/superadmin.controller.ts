import type { Request, Response } from "express";
import db from "@/lib/db";
import { signToken } from "@/middleware/auth";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(req: Request, res: Response) {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ error: "phone is required" });
      return;
    }

    const superadmin = await db.superAdmin.findUnique({ where: { phone } });
    if (!superadmin) {
      res.status(404).json({ error: "SuperAdmin not found" });
      return;
    }

    const code = generateOtp();
    await db.otp.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // TODO: send OTP via SMS — for now return it in response
    res.status(200).json({
      message: "OTP sent to your phone",
      otp: code,
    });
  } catch (err) {
    console.error("superadmin login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({ error: "phone and otp are required" });
      return;
    }

    const otpRecord = await db.otp.findFirst({
      where: {
        phone,
        code: otp,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      res.status(400).json({ error: "Invalid or expired OTP" });
      return;
    }

    await db.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    const superadmin = await db.superAdmin.findUnique({ where: { phone } });
    if (!superadmin) {
      res.status(404).json({ error: "SuperAdmin not found" });
      return;
    }

    if (!superadmin.phoneVerified) {
      await db.superAdmin.update({
        where: { id: superadmin.id },
        data: { phoneVerified: true },
      });
    }

    const token = signToken({ entityId: superadmin.id, entityType: "superadmin" });

    res.json({ message: "OTP verified", token });
  } catch (err) {
    console.error("superadmin verifyOtp error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboard(req: Request, res: Response) {
  try {
    const [
      totalHotels,
      totalOwners,
      totalManagers,
      totalAdmins,
      totalVerifications,
      totalDistricts,
      activeSubscriptions,
    ] = await Promise.all([
      db.hotel.count(),
      db.owner.count(),
      db.manager.count(),
      db.admin.count(),
      db.verification.count(),
      db.district.count(),
      db.subscription.count({ where: { isActive: true } }),
    ]);

    res.json({
      totalHotels,
      totalOwners,
      totalManagers,
      totalAdmins,
      totalVerifications,
      totalDistricts,
      activeSubscriptions,
    });
  } catch (err) {
    console.error("superadmin getDashboard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ─── Hotels ──────────────────────────────────────────────────────────────────

export async function getHotels(req: Request, res: Response) {
  try {
    const hotels = await db.hotel.findMany({
      include: {
        owner: { select: { id: true, name: true, phone: true, email: true } },
        managers: { select: { id: true, name: true, phone: true } },
        district: { select: { id: true, name: true, state: true } },
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { verifications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ hotels });
  } catch (err) {
    console.error("superadmin getHotels error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getHotelDetail(req: Request, res: Response) {
  try {
    const hotelId = req.params.hotelId!;

    const hotel = await db.hotel.findUnique({
      where: { id: hotelId },
      include: {
        owner: { select: { id: true, name: true, phone: true, email: true } },
        managers: { select: { id: true, name: true, phone: true } },
        district: { select: { id: true, name: true, state: true } },
        subscriptions: {
          orderBy: { createdAt: "desc" },
          include: { payments: true },
        },
        _count: { select: { verifications: true } },
      },
    });

    if (!hotel) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }

    res.json({ hotel });
  } catch (err) {
    console.error("superadmin getHotelDetail error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ─── Owners ──────────────────────────────────────────────────────────────────

export async function getOwners(req: Request, res: Response) {
  try {
    const owners = await db.owner.findMany({
      include: {
        hotels: {
          include: {
            district: { select: { id: true, name: true, state: true } },
            subscriptions: {
              where: { isActive: true },
              take: 1,
            },
            _count: { select: { verifications: true, managers: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ owners });
  } catch (err) {
    console.error("superadmin getOwners error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ─── Verifications ───────────────────────────────────────────────────────────

export async function getVerifications(req: Request, res: Response) {
  try {
    const verifications = await db.verification.findMany({
      include: {
        persons: true,
        manager: { select: { id: true, name: true, phone: true } },
        hotel: {
          select: {
            id: true,
            name: true,
            owner: { select: { id: true, name: true, phone: true } },
            district: { select: { id: true, name: true, state: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ verifications });
  } catch (err) {
    console.error("superadmin getVerifications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ─── Admin Management ────────────────────────────────────────────────────────

export async function createAdmin(req: Request, res: Response) {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      res.status(400).json({ error: "name and phone are required" });
      return;
    }

    const existing = await db.admin.findUnique({ where: { phone } });
    if (existing) {
      res.status(409).json({ error: "Admin with this phone already exists" });
      return;
    }

    const admin = await db.admin.create({
      data: { name, phone },
    });

    res.status(201).json({ message: "Admin created", admin });
  } catch (err) {
    console.error("superadmin createAdmin error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAdmins(req: Request, res: Response) {
  try {
    const admins = await db.admin.findMany({
      include: {
        districts: {
          include: {
            district: { select: { id: true, name: true, state: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ admins });
  } catch (err) {
    console.error("superadmin getAdmins error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function assignDistricts(req: Request, res: Response) {
  try {
    const adminId = req.params.adminId!;
    const { districtIds } = req.body;

    if (!districtIds || !Array.isArray(districtIds) || districtIds.length === 0) {
      res.status(400).json({ error: "districtIds array is required" });
      return;
    }

    const admin = await db.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    const districts = await db.district.findMany({
      where: { id: { in: districtIds } },
    });
    if (districts.length !== districtIds.length) {
      res.status(400).json({ error: "One or more district IDs are invalid" });
      return;
    }

    const existing = await db.adminDistrict.findMany({
      where: { adminId, districtId: { in: districtIds } },
      select: { districtId: true },
    });
    const existingIds = new Set(existing.map((e) => e.districtId));
    const newIds = districtIds.filter((id: string) => !existingIds.has(id));

    if (newIds.length > 0) {
      await db.adminDistrict.createMany({
        data: newIds.map((districtId: string) => ({ adminId, districtId })),
      });
    }

    const updated = await db.admin.findUnique({
      where: { id: adminId },
      include: {
        districts: {
          include: { district: { select: { id: true, name: true, state: true } } },
        },
      },
    });

    res.json({ message: "Districts assigned", admin: updated });
  } catch (err) {
    console.error("superadmin assignDistricts error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function removeDistrict(req: Request, res: Response) {
  try {
    const adminId = req.params.adminId!;
    const districtId = req.params.districtId!;

    const assignment = await db.adminDistrict.findUnique({
      where: { adminId_districtId: { adminId, districtId } },
    });

    if (!assignment) {
      res.status(404).json({ error: "District assignment not found" });
      return;
    }

    await db.adminDistrict.delete({
      where: { id: assignment.id },
    });

    res.json({ message: "District removed from admin" });
  } catch (err) {
    console.error("superadmin removeDistrict error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ─── District CRUD ───────────────────────────────────────────────────────────

export async function createDistrict(req: Request, res: Response) {
  try {
    const { name, state } = req.body;

    if (!name || !state) {
      res.status(400).json({ error: "name and state are required" });
      return;
    }

    const existing = await db.district.findUnique({
      where: { name_state: { name, state: state.toUpperCase() } },
    });
    if (existing) {
      res.status(409).json({ error: "District already exists in this state" });
      return;
    }

    const district = await db.district.create({
      data: { name, state: state.toUpperCase() },
    });

    res.status(201).json({ message: "District created", district });
  } catch (err) {
    console.error("superadmin createDistrict error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateDistrict(req: Request, res: Response) {
  try {
    const districtId = req.params.districtId!;
    const { name, state } = req.body;

    const district = await db.district.findUnique({ where: { id: districtId } });
    if (!district) {
      res.status(404).json({ error: "District not found" });
      return;
    }

    const updated = await db.district.update({
      where: { id: districtId },
      data: {
        ...(name && { name }),
        ...(state && { state: state.toUpperCase() }),
      },
    });

    res.json({ message: "District updated", district: updated });
  } catch (err) {
    console.error("superadmin updateDistrict error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteDistrict(req: Request, res: Response) {
  try {
    const districtId = req.params.districtId!;

    const district = await db.district.findUnique({ where: { id: districtId } });
    if (!district) {
      res.status(404).json({ error: "District not found" });
      return;
    }

    const hotelCount = await db.hotel.count({ where: { districtId } });
    if (hotelCount > 0) {
      res.status(409).json({ error: "Cannot delete district with existing hotels" });
      return;
    }

    const adminCount = await db.adminDistrict.count({ where: { districtId } });
    if (adminCount > 0) {
      await db.adminDistrict.deleteMany({ where: { districtId } });
    }

    await db.district.delete({ where: { id: districtId } });

    res.json({ message: "District deleted" });
  } catch (err) {
    console.error("superadmin deleteDistrict error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
