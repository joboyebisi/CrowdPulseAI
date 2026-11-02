import "server-only";
import { cache } from "react";
import { getAwsMoment, isAwsBackendConfigured } from "@/lib/aws-backend";
import { CLASICO_DEMO_MOMENT_ID, createApprovedClasicoMoment } from "@/lib/harness-fixtures";
import { findMoment } from "@/lib/store";
import type { Moment } from "@/lib/types";

const LEGACY_CLASICO_MOMENT_ID = "0b689b0f-77eb-4815-82b3-eb170f27eafb";

export const loadApprovedMoment = cache(async (id: string): Promise<Moment | null> => {
  const isClasicoDemo = id === CLASICO_DEMO_MOMENT_ID || id === LEGACY_CLASICO_MOMENT_ID;
  let moment = isClasicoDemo ? createApprovedClasicoMoment() : findMoment(id);

  if (!moment && isAwsBackendConfigured) {
    try {
      moment = (await getAwsMoment(id)).moment;
    } catch {
      moment = null;
    }
  }

  return moment?.status === "approved" ? moment : null;
});

export function twitchClipSlug(clipUrl?: string) {
  if (!clipUrl) return null;
  try {
    const url = new URL(clipUrl);
    if (url.hostname !== "clips.twitch.tv") return null;
    const slug = url.pathname.split("/").filter(Boolean)[0];
    return slug && /^[A-Za-z0-9_-]+$/.test(slug) ? slug : null;
  } catch {
    return null;
  }
}
