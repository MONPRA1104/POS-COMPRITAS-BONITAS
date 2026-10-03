import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a dummy proxy that absorbs all calls without erroring
const mockPrisma = new Proxy(
  {},
  {
    get: () =>
      new Proxy(
        {},
        {
          get: () => () => Promise.resolve(null),
        }
      ),
  }
) as unknown as PrismaClient;

const isBuild = process.env.npm_lifecycle_event === "build";

export const db =
  globalForPrisma.prisma ??
  (isBuild
    ? mockPrisma
    : new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      }));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
