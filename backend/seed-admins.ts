import "dotenv/config";
import db from "./src/lib/db.ts";

async function main() {
  // 1. Create SuperAdmin with phone +919999999999
  const existingSA = await db.superAdmin.findUnique({ where: { phone: "+919999999999" } });
  if (existingSA) {
    console.log("SuperAdmin already exists:", existingSA.id);
  } else {
    const sa = await db.superAdmin.create({
      data: {
        name: "Super Admin",
        phone: "+919999999999",
        phoneVerified: true,
      },
    });
    console.log("SuperAdmin created:", sa.id);
  }

  // 2. Create Admin (District Admin) with phone +918888888888
  const existingAdmin = await db.admin.findUnique({ where: { phone: "+918888888888" } });
  if (existingAdmin) {
    console.log("Admin already exists:", existingAdmin.id);
  } else {
    const admin = await db.admin.create({
      data: {
        name: "District Admin",
        phone: "+918888888888",
        phoneVerified: true,
      },
    });
    console.log("Admin created:", admin.id);
  }

  console.log("\nDone! Access details:");
  console.log("SuperAdmin  → +919999999999");
  console.log("District Admin → +918888888888");

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
