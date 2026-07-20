import { PrismaPg } from "@prisma/adapter-pg";
import { DATABASE_URL } from "../config/env.config.js";
import { PrismaClient } from "@prisma/client/extension";

const connectionString = `${DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };