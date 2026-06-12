import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Neon's pooled connection string (PgBouncer, transaction mode) doesn't support
 * Prisma's prepared statements unless `pgbouncer=true` is set, which causes
 * intermittent "prepared statement already exists" errors in serverless. The
 * managed `DATABASE_URL` env var (set by Vercel's storage integration) can't be
 * edited directly, so append the required params here instead.
 */
function datasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  const separator = url.includes("?") ? "&" : "?";
  const extra = [
    !url.includes("pgbouncer=") && "pgbouncer=true",
    !url.includes("connection_limit=") && "connection_limit=1",
  ].filter(Boolean).join("&");
  return extra ? `${url}${separator}${extra}` : url;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: datasourceUrl() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
