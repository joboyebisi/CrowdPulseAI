import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { encryptSession, OAUTH_STATE_COOKIE, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { exchangeCode, getCurrentUser, validateToken } from "@/lib/twitch";
import { registerCreator } from "@/lib/aws-backend";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  if (error || !code || !state || state !== expectedState) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", env.NEXT_PUBLIC_APP_URL));
  }

  try {
    const token = await exchangeCode(code);
    const validation = await validateToken(token.access_token);
    const user = await getCurrentUser(token.access_token);
    const session = {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: Date.now() + validation.expires_in * 1000,
      scopes: token.scope,
      userId: user.id,
      login: user.login,
      displayName: user.display_name,
    };
    await registerCreator(session);
    const response = NextResponse.redirect(new URL("/dashboard?connected=1", env.NEXT_PUBLIC_APP_URL));
    response.cookies.delete(OAUTH_STATE_COOKIE);
    response.cookies.set(SESSION_COOKIE, encryptSession(session), sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=token_exchange_failed", env.NEXT_PUBLIC_APP_URL));
  }
}
