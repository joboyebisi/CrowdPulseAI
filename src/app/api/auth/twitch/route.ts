import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { env, isTwitchConfigured } from "@/lib/env";
import { OAUTH_STATE_COOKIE } from "@/lib/session";
import { TWITCH_SCOPES } from "@/lib/twitch";

export const runtime = "nodejs";

export async function GET() {
  if (!isTwitchConfigured || !env.TWITCH_CLIENT_ID) {
    return NextResponse.redirect(new URL("/dashboard?error=twitch_not_configured", env.NEXT_PUBLIC_APP_URL));
  }
  const state = randomBytes(24).toString("base64url");
  const authorize = new URL("https://id.twitch.tv/oauth2/authorize");
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", env.TWITCH_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", env.TWITCH_REDIRECT_URI);
  authorize.searchParams.set("scope", TWITCH_SCOPES.join(" "));
  authorize.searchParams.set("state", state);
  const response = NextResponse.redirect(authorize);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return response;
}
