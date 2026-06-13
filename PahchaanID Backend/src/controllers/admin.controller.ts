import type { Request, Response } from "express";
import db from "@/lib/db";
import { signToken } from "@/middleware/auth";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Returns an array of district IDs assigned to this admin */
async function getAdminDistrictIds(adminId: string): Promise<string[]> {
  const assignments = await db.adminDistrict.findMany({
    where: { adminId },
    select: { districtId: true },
  });
  return assignments.map((a) => a.districtId);
}

export async function login(req: Request, res: Response) {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ error: "phone is required" });
      return;
    }

    const admin = await db.admin.findUnique({ where: { phone } });
    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
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
    console.error("admin login error:", err);
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

    const admin = await db.admin.findUnique({ where: { phone } });
    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    if (!admin.phoneVerified) {
      await db.admin.update({
        where: { id: admin.id },
        data: { phoneVerified: true },
      });
    }

    const token = signToken({ entityId: admin.id, entityType: "admin" });

    res.json({ message: "OTP verified", token });
  } catch (err) {
    console.error("admin verifyOtp error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getDashboard(req: Request, res: Response) {
  try {
    const { entityId } = req.user!;
    const districtIds = await getAdminDistrictIds(entityId);

    if (districtIds.length === 0) {
      res.json({ districts: [], totalHotels: 0, totalVerifications: 0, hotels: [] });
      return;
    }

    const [districts, hotels, verificationCount] = await Promise.all([
      db.district.findMany({
        where: { id: { in: districtIds } },
        select: { id: true, name: true, state: true },
        orderBy: { name: "asc" },
      }),
      db.hotel.findMany({
        where: { districtId: { in: districtIds } },
        include: {
          owner: { select: { id: true, name: true, phone: true } },
          managers: { select: { id: true, name: true, phone: true } },
          subscriptions: { where: { isActive: true }, take: 1 },
          district: { select: { id: true, name: true, state: true } },
          _count: { select: { verifications: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.verification.count({
        where: { hotel: { districtId: { in: districtIds } } },
      }),
    ]);

    res.json({
      districts,
      totalHotels: hotels.length,
      totalVerifications: verificationCount,
      hotels,
    });
  } catch (err) {
    console.error("admin getDashboard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getHotels(req: Request, res: Response) {
  try {
    const { entityId } = req.user!;
    const districtIds = await getAdminDistrictIds(entityId);

    const hotels = await db.hotel.findMany({
      where: { districtId: { in: districtIds } },
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
    console.error("admin getHotels error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getHotelDetail(req: Request, res: Response) {
  try {
    const { entityId } = req.user!;
    const hotelId = req.params.hotelId!;
    const districtIds = await getAdminDistrictIds(entityId);

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

    if (!hotel || !hotel.districtId || !districtIds.includes(hotel.districtId)) {
      res.status(404).json({ error: "Hotel not found in your jurisdiction" });
      return;
    }

    res.json({ hotel });
  } catch (err) {
    console.error("admin getHotelDetail error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getVerifications(req: Request, res: Response) {
  try {
    const { entityId } = req.user!;
    const districtIds = await getAdminDistrictIds(entityId);

    const verifications = await db.verification.findMany({
      where: { hotel: { districtId: { in: districtIds } } },
      include: {
        persons: true,
        manager: { select: { id: true, name: true, phone: true } },
        hotel: {
          select: {
            id: true,
            name: true,
            district: { select: { id: true, name: true, state: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ verifications });
  } catch (err) {
    console.error("admin getVerifications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
