import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Dummy proxy to absorb all calls without erroring during Next.js static evaluation
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

// Use NEXT_PHASE which is passed to all worker threads
const env = globalThis.process?.env || {};
const isBuild = env["NEXT_PHASE"] === "phase-production-build" || env["npm_lifecycle_event"] === "build";

export const db =
  globalForPrisma.prisma ??
  (isBuild
    ? mockPrisma
    : new PrismaClient({
        log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      }));

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
