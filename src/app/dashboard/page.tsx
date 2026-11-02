import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { decryptSession, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/login");
  return <DashboardClient />;
}
