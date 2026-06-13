import type { Request, Response } from "express";
import db from "@/lib/db";
import { signToken } from "@/middleware/auth";
import type { GovIdType } from "@/generated/prisma/client";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function login(req: Request, res: Response) {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ error: "phone is required" });
      return;
    }

    const manager = await db.manager.findUnique({ where: { phone } });
    if (!manager) {
      res.status(404).json({ error: "Manager not found" });
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
    console.error("manager login error:", err);
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

    const manager = await db.manager.findUnique({ where: { phone } });
    if (!manager) {
      res.status(404).json({ error: "Manager not found" });
      return;
    }

    if (!manager.phoneVerified) {
      await db.manager.update({
        where: { id: manager.id },
        data: { phoneVerified: true },
      });
    }

    const token = signToken({ entityId: manager.id, entityType: "manager" });

    res.json({ message: "OTP verified", token });
  } catch (err) {
    console.error("manager verifyOtp error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const { entityId } = req.user!;

    const manager = await db.manager.findUnique({
      where: { id: entityId },
      include: {
        hotel: {
          include: {
            district: true,
            subscriptions: {
              where: { isActive: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!manager) {
      res.status(404).json({ error: "Manager not found" });
      return;
    }

    res.json({ manager });
  } catch (err) {
    console.error("manager getProfile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createVerification(req: Request, res: Response) {
  try {
    const { entityId } = req.user!;
    const { type, adults, children, purpose, persons } = req.body;

    if (!type || !persons || !Array.isArray(persons) || persons.length === 0) {
      res.status(400).json({ error: "type and persons array are required" });
      return;
    }

    const validTypes = ["COUPLE", "FAMILY", "STUDENT", "PROFESSIONAL"];
    if (!validTypes.includes(type)) {
      res.status(400).json({ error: `type must be one of: ${validTypes.join(", ")}` });
      return;
    }

    const validIdTypes = ["AADHAAR", "PAN", "VOTER_ID", "PASSPORT", "DRIVING_LICENSE"];

    if (type === "COUPLE" && persons.length !== 2) {
      res.status(400).json({ error: "COUPLE verification requires exactly 2 persons" });
      return;
    }

    if (type !== "COUPLE" && persons.length !== 1) {
      res.status(400).json({ error: `${type} verification requires exactly 1 person` });
      return;
    }

    for (const p of persons) {
      if (!p.idType || !p.idNumber) {
        res.status(400).json({ error: "Each person must have idType and idNumber" });
        return;
      }
      if (!validIdTypes.includes(p.idType)) {
        res.status(400).json({ error: `idType must be one of: ${validIdTypes.join(", ")}` });
        return;
      }
    }

    const manager = await db.manager.findUnique({ where: { id: entityId } });
    if (!manager || !manager.hotelId) {
      res.status(400).json({ error: "Manager is not assigned to any hotel" });
      return;
    }

    const hotel = await db.hotel.findUnique({ where: { id: manager.hotelId } });
    if (!hotel || hotel.status !== "ACTIVE") {
      res.status(403).json({ error: "Hotel does not have an active subscription" });
      return;
    }

    // TODO: call third-party ID verification API for each person
    // For now, mock the response with placeholder data
    const verifiedPersons = persons.map((p: { idType: GovIdType; idNumber: string; name?: string }) => ({
      name: p.name || "Unknown",
      idType: p.idType as GovIdType,
      idNumber: p.idNumber,
      verified: true,
      response: {
        source: "mock",
        message: "Third-party verification not yet integrated",
        idType: p.idType,
        idNumber: p.idNumber,
      },
    }));

    const verification = await db.verification.create({
      data: {
        hotelId: manager.hotelId!,
        managerId: entityId,
        type,
        adults: adults || 1,
        children: children || 0,
        purpose: purpose || null,
        persons: {
          create: verifiedPersons,
        },
      },
      include: { persons: true },
    });

    res.status(201).json({ message: "Verification created", verification });
  } catch (err) {
    console.error("createVerification error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getVerifications(req: Request, res: Response) {
  try {
    const { entityId } = req.user!;

    const manager = await db.manager.findUnique({ where: { id: entityId } });
    if (!manager || !manager.hotelId) {
      res.status(400).json({ error: "Manager is not assigned to any hotel" });
      return;
    }

    const verifications = await db.verification.findMany({
      where: { hotelId: manager.hotelId },
      include: {
        persons: true,
        manager: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ verifications });
  } catch (err) {
    console.error("getVerifications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
