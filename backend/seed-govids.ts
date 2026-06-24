import fs from "fs";
import path from "path";
import db from "./src/lib/db.js";

const dummyIdsPath = path.join(process.cwd(), "src/data/dummyIds.json");
const dummyIds: Record<string, any> = JSON.parse(
  fs.readFileSync(dummyIdsPath, "utf-8")
);

async function seedGovIds() {
  console.log("🔄 Seeding GovIdRecord table...");

  let created = 0;
  let skipped = 0;

  for (const [idNumber, record] of Object.entries(dummyIds)) {
    try {
      await db.govIdRecord.upsert({
        where: {
          idNumber_idType: {
            idNumber: record.idNumber,
            idType: record.idType,
          },
        },
        update: {
          name: record.name,
          fatherName: record.fatherName,
          dob: record.dob,
          age: record.age,
          gender: record.gender,
          address: record.address,
          district: record.district || null,
          state: record.state || null,
          pincode: record.pincode || null,
          photoUrl: record.photoUrl || null,
          bloodGroup: record.bloodGroup || null,
          vehicleClass: record.vehicleClass || null,
          dateOfIssue: record.dateOfIssue || null,
          dateOfValidity: record.dateOfValidity || null,
          dateOfExpiry: record.dateOfExpiry || null,
          issuingAuthority: record.issuingAuthority || null,
          nationality: record.nationality || null,
          placeOfBirth: record.placeOfBirth || null,
          placeOfIssue: record.placeOfIssue || null,
          constituency: record.constituency || null,
          isMinor: record.isMinor || false,
        },
        create: {
          idNumber: record.idNumber,
          idType: record.idType,
          name: record.name,
          fatherName: record.fatherName,
          dob: record.dob,
          age: record.age,
          gender: record.gender,
          address: record.address,
          district: record.district || null,
          state: record.state || null,
          pincode: record.pincode || null,
          photoUrl: record.photoUrl || null,
          bloodGroup: record.bloodGroup || null,
          vehicleClass: record.vehicleClass || null,
          dateOfIssue: record.dateOfIssue || null,
          dateOfValidity: record.dateOfValidity || null,
          dateOfExpiry: record.dateOfExpiry || null,
          issuingAuthority: record.issuingAuthority || null,
          nationality: record.nationality || null,
          placeOfBirth: record.placeOfBirth || null,
          placeOfIssue: record.placeOfIssue || null,
          constituency: record.constituency || null,
          isMinor: record.isMinor || false,
        },
      });
      created++;
    } catch (err: any) {
      console.error(`❌ Error seeding ${idNumber}:`, err.message);
      skipped++;
    }
  }

  console.log(`✅ Seeding complete! ${created} records created/updated, ${skipped} skipped.`);
  process.exit(0);
}

seedGovIds().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
