import "dotenv/config";
import db from "./src/lib/db.ts";

async function main() {
  try {
    const owner = await db.owner.findFirst();
    console.log("DB connected successfully. Owner count:", !!owner);
  } catch (err) {
    console.error("DB connection error:", err);
  } finally {
    await db.$disconnect();
  }
}
main();
