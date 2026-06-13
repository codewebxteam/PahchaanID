import type { Request, Response } from "express";
import db from "@/lib/db";
import { signToken } from "@/middleware/auth";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function register(req: Request, res: Response) {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      res.status(400).json({ error: "name and phone are required" });
      return;
    }

    const existing = await db.owner.findUnique({ where: { phone } });
    if (existing) {
      res.status(409).json({ error: "Owner with this phone already exists" });
      return;
    }

    const owner = await db.owner.create({
      data: { name, phone, email },
    });

    const code = generateOtp();
    await db.otp.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // TODO: send OTP via SMS — for now return it in response
    res.status(201).json({
      message: "OTP sent to your phone",
      ownerId: owner.id,
      otp: code,
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ error: "phone is required" });
      return;
    }

    const owner = await db.owner.findUnique({ where: { phone } });
    if (!owner) {
      res.status(404).json({ error: "Owner not found" });
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
    console.error("login error:", err);
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

    const owner = await db.owner.findUnique({ where: { phone } });
    if (!owner) {
      res.status(404).json({ error: "Owner not found" });
      return;
    }

    if (!owner.phoneVerified) {
      await db.owner.update({
        where: { id: owner.id },
        data: { phoneVerified: true },
      });
    }

    const token = signToken({ entityId: owner.id, entityType: "owner" });

    res.json({ message: "OTP verified", token });
  } catch (err) {
    console.error("verifyOtp error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function addHotel(req: Request, res: Response) {
  try {
    const { entityId } = req.user!;
    const { name, address, city, state, pincode, districtId, latitude, longitude } = req.body;

    if (!name || !address || latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: "name, address, latitude, and longitude are required" });
      return;
    }

    const owner = await db.owner.findUnique({ where: { id: entityId } });
    if (!owner) {
      res.status(404).json({ error: "Owner not found" });
      return;
    }

    if (districtId) {
      const district = await db.district.findUnique({ where: { id: districtId } });
      if (!district) {
        res.status(404).json({ error: "District not found" });
        return;
      }
    }

    const hotel = await db.hotel.create({
      data: {
        ownerId: entityId,
        name,
        address,
        city,
        state,
        pincode,
        districtId: districtId || null,
        latitude,
        longitude,
      },
    });

    res.status(201).json({ message: "Hotel created", hotel });
  } catch (err) {
    console.error("addHotel error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function subscribe(req: Request, res: Response) {
  try {
    const { entityId } = req.user!;
    const hotelId = req.params.hotelId!;

    const hotel = await db.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel || hotel.ownerId !== entityId) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }

    const existingActive = await db.subscription.findFirst({
      where: { hotelId, isActive: true },
    });
    if (existingActive) {
      res.status(409).json({ error: "Hotel already has an active subscription" });
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const subscription = await db.subscription.create({
      data: {
        hotelId,
        startDate,
        endDate,
        isActive: true,
      },
    });

    // TODO: integrate payment gateway — for now create a dummy success payment
    await db.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: 0,
        status: "SUCCESS",
        paidAt: new Date(),
      },
    });

    await db.hotel.update({
      where: { id: hotelId },
      data: { status: "ACTIVE" },
    });

    res.status(201).json({ message: "Subscription activated", subscription });
  } catch (err) {
    console.error("subscribe error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function addManager(req: Request, res: Response) {
  try {
    const { entityId } = req.user!;
    const hotelId = req.params.hotelId!;
    const { name, phone } = req.body;

    if (!name || !phone) {
      res.status(400).json({ error: "name and phone are required" });
      return;
    }

    const hotel = await db.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel || hotel.ownerId !== entityId) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }

    let manager = await db.manager.findUnique({ where: { phone } });

    if (manager) {
      if (manager.hotelId) {
        res.status(409).json({ error: "Manager is already assigned to a hotel" });
        return;
      }
      manager = await db.manager.update({
        where: { id: manager.id },
        data: { hotelId, name },
      });
    } else {
      manager = await db.manager.create({
        data: { name, phone, hotelId },
      });
    }

    res.status(201).json({ message: "Manager added", manager });
  } catch (err) {
    console.error("addManager error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function removeManager(req: Request, res: Response) {
  try {
    const { entityId } = req.user!;
    const hotelId = req.params.hotelId!;
    const managerId = req.params.managerId!;

    const hotel = await db.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel || hotel.ownerId !== entityId) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }

    const manager = await db.manager.findUnique({ where: { id: managerId } });
    if (!manager || manager.hotelId !== hotelId) {
      res.status(404).json({ error: "Manager not found in this hotel" });
      return;
    }

    await db.manager.update({
      where: { id: managerId },
      data: { hotelId: null },
    });

    res.json({ message: "Manager removed from hotel" });
  } catch (err) {
    console.error("removeManager error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getHotelVerifications(req: Request, res: Response) {
  try {
    const { entityId } = req.user!;
    const hotelId = req.params.hotelId!;

    const hotel = await db.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel || hotel.ownerId !== entityId) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }

    const verifications = await db.verification.findMany({
      where: { hotelId },
      include: {
        persons: true,
        manager: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ verifications });
  } catch (err) {
    console.error("getHotelVerifications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const { entityId } = req.user!;

    const owner = await db.owner.findUnique({
      where: { id: entityId },
      include: {
        hotels: {
          include: {
            managers: true,
            subscriptions: {
              where: { isActive: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!owner) {
      res.status(404).json({ error: "Owner not found" });
      return;
    }

    res.json({ owner });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
