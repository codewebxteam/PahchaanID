import { PrismaClient } from './src/generated/prisma/index.js';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    const owner = await prisma.owner.findFirst();
    console.log("DB connected successfully. Owner count/first:", !!owner);
  } catch (err) {
    console.error("DB connection error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
