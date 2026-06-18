import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { getDatabaseUrl } from "@/lib/db";
import { normalizeSignupInput } from "@/lib/signupValidation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4096;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
const buckets = new Map<string, { count: number; resetAt: number }>();

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "anonymous";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_REQUESTS_PER_WINDOW;
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

async function ipHash(request: NextRequest): Promise<string | null> {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) return null;

  const data = new TextEncoder().encode(`${salt}:${clientKey(request)}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return json(403, { ok: false, message: "Origine non autorisée." });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return json(415, { ok: false, message: "Type de contenu invalide." });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json(413, { ok: false, message: "Requête trop volumineuse." });
  }

  const key = clientKey(request);
  if (isRateLimited(key)) {
    return json(429, { ok: false, message: "Trop de tentatives. Réessayez dans une minute." });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, message: "Requête invalide." });
  }

  const parsed = normalizeSignupInput(body);
  if (!parsed.ok) {
    if (parsed.honeypot) {
      return json(200, { ok: true });
    }

    return json(422, {
      ok: false,
      message: "Veuillez corriger les champs indiqués.",
      errors: parsed.errors,
    });
  }

  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    return json(503, {
      ok: false,
      message: "Le stockage des inscriptions n'est pas encore configuré.",
    });
  }

  const sql = neon(databaseUrl);
  const userAgent = request.headers.get("user-agent")?.slice(0, 300) || null;

  try {
    await sql`
      insert into signup_submissions (
        full_name,
        email,
        phone,
        wants_alerts,
        wants_promos,
        wants_fake_promo_warnings,
        user_agent,
        ip_hash
      )
      values (
        ${parsed.data.fullName},
        ${parsed.data.email},
        ${parsed.data.phone},
        ${parsed.data.preferences.alerts},
        ${parsed.data.preferences.promos},
        ${parsed.data.preferences.fakePromos},
        ${userAgent},
        ${await ipHash(request)}
      )
      on conflict (email) do update set
        full_name = excluded.full_name,
        phone = excluded.phone,
        wants_alerts = excluded.wants_alerts,
        wants_promos = excluded.wants_promos,
        wants_fake_promo_warnings = excluded.wants_fake_promo_warnings,
        user_agent = excluded.user_agent,
        ip_hash = excluded.ip_hash,
        updated_at = now()
    `;
  } catch (error) {
    console.error("signup insert failed:", error);
    return json(500, {
      ok: false,
      message: "Impossible d'enregistrer l'inscription pour le moment.",
    });
  }

  return json(200, { ok: true });
}
