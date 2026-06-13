import type { Request, Response } from "express";
import db from "@/lib/db";

export async function getDistrictsByState(req: Request, res: Response) {
  try {
    const { state } = req.query;

    if (!state || typeof state !== "string") {
      res.status(400).json({ error: "state query parameter is required" });
      return;
    }

    const districts = await db.district.findMany({
      where: { state: state.toUpperCase() },
      select: { id: true, name: true, state: true },
      orderBy: { name: "asc" },
    });

    res.json({ districts });
  } catch (err) {
    console.error("getDistrictsByState error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
