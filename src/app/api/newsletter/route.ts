import { NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/validations";

export const runtime = "nodejs";

// Naive in-memory rate limiter (per-instance). For production use a shared
// store such as Upstash Redis (@upstash/ratelimit) keyed by IP.
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 422 }
    );
  }

  // Production: persist subscriber + sync to your ESP (Resend, Mailchimp…).
  // await prisma.newsletterSubscriber.upsert({ ... });
  console.log("[newsletter] new subscriber:", parsed.data.email);

  return NextResponse.json({ ok: true });
}
