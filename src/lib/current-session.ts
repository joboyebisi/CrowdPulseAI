import { cookies } from "next/headers";
import { decryptSession, SESSION_COOKIE } from "@/lib/session";

export async function currentTwitchSession() {
  const cookieStore = await cookies();
  return decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
}
