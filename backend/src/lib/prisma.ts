import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.config.js";
import { PrismaClient } from "@prisma/client";

const connectionString = `${env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };