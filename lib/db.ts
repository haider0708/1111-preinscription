/** Vercel + Neon expose POSTGRES_URL; Neon docs often use DATABASE_URL. */
export function getDatabaseUrl(): string | undefined {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL;
}
