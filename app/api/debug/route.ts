import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    envLoaded: Boolean(
      process.env.ABROAD_GOOGLE_SHEET_URL || process.env.GLOBAL_GOOGLE_SHEET_URL
    ),
    commit: process.env.VERCEL_GIT_COMMIT_SHA || "not-vercel",
    branch: process.env.VERCEL_GIT_COMMIT_REF || "unknown",
    project: process.env.VERCEL_PROJECT_PRODUCTION_URL || "unknown",
    time: new Date().toISOString(),
  });
}
