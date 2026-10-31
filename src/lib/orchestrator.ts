import type { MomentPackage } from "@/lib/caption";
import type { MomentAgentName, MomentAgentRun, TwitchSession } from "@/lib/types";

export type ClipArtifact = {
  clipId: string;
  clipUrl: string;
  thumbnailUrl?: string;
};

export type MomentOrchestrationInput = {
  creatorName: string;
  hypeVotes: number;
  chatContext: string[];
  simulated: boolean;
  session?: TwitchSession;
};

export type MomentOrchestrationOutput = MomentPackage & Partial<ClipArtifact> & {
  agentRuns: MomentAgentRun[];
};

export type MomentOrchestrationDependencies = {
  generatePackage(input: {
    creatorName: string;
    hypeVotes: number;
    chatContext: string[];
  }): Promise<MomentPackage>;
  captureClip(session: TwitchSession): Promise<ClipArtifact>;
  now?: () => Date;
  onProgress?: (runs: MomentAgentRun[]) => void;
};

const labels: Record<MomentAgentName, string> = {
  "signal-scout": "Signal Scout",
  "clip-director": "Clip Director",
  pundit: "Pundit",
  "growth-producer": "Growth Producer",
};

export function createAgentRuns(now = new Date()): MomentAgentRun[] {
  const completedAt = now.toISOString();
  return [
    {
      agent: "signal-scout",
      label: labels["signal-scout"],
      status: "completed",
      startedAt: completedAt,
      completedAt,
      detail: "Unique crowd signals crossed the configured threshold.",
    },
    { agent: "clip-director", label: labels["clip-director"], status: "queued", detail: "Waiting to capture the source moment." },
    { agent: "pundit", label: labels.pundit, status: "queued", detail: "Waiting for grounded chat context." },
    { agent: "growth-producer", label: labels["growth-producer"], status: "queued", detail: "Waiting to prepare platform drafts." },
  ];
}

function cloneRuns(runs: MomentAgentRun[]) {
  return runs.map((run) => ({ ...run }));
}

export async function orchestrateMoment(
  input: MomentOrchestrationInput,
  dependencies: MomentOrchestrationDependencies,
): Promise<MomentOrchestrationOutput> {
  const now = dependencies.now ?? (() => new Date());
  const runs = createAgentRuns(now());
  const notify = () => dependencies.onProgress?.(cloneRuns(runs));
  const update = (agent: MomentAgentName, updateValue: Partial<MomentAgentRun>) => {
    const run = runs.find((item) => item.agent === agent);
    if (!run) return;
    Object.assign(run, updateValue);
    notify();
  };

  notify();
  let clipArtifact: Partial<ClipArtifact> = {};

  if (input.simulated) {
    const completedAt = now().toISOString();
    update("clip-director", {
      status: "skipped",
      startedAt: completedAt,
      completedAt,
      detail: "Harness mode used a labelled clip fixture; Twitch was not called.",
    });
  } else {
    if (!input.session) throw new Error("The Twitch session is no longer available");
    update("clip-director", {
      status: "running",
      startedAt: now().toISOString(),
      detail: "Requesting and verifying a Twitch clip.",
    });
    try {
      clipArtifact = await dependencies.captureClip(input.session);
      update("clip-director", {
        status: "completed",
        completedAt: now().toISOString(),
        detail: "Twitch returned a verified clip URL.",
      });
    } catch (error) {
      update("clip-director", {
        status: "failed",
        completedAt: now().toISOString(),
        detail: error instanceof Error ? error.message : "Clip capture failed.",
      });
      throw error;
    }
  }

  const packageStartedAt = now().toISOString();
  update("pundit", { status: "running", startedAt: packageStartedAt, detail: "Writing a grounded live call." });
  update("growth-producer", { status: "running", startedAt: packageStartedAt, detail: "Creating platform-specific drafts." });

  try {
    const momentPackage = await dependencies.generatePackage({
      creatorName: input.creatorName,
      hypeVotes: input.hypeVotes,
      chatContext: input.chatContext,
    });
    const completedAt = now().toISOString();
    update("pundit", { status: "completed", completedAt, detail: `${momentPackage.agentProvider} produced the pundit call.` });
    update("growth-producer", {
      status: "completed",
      completedAt,
      detail: `${momentPackage.socialDrafts.length} creator-review drafts are ready.`,
    });
    return { ...momentPackage, ...clipArtifact, agentRuns: cloneRuns(runs) };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Moment packaging failed.";
    const completedAt = now().toISOString();
    update("pundit", { status: "failed", completedAt, detail });
    update("growth-producer", { status: "failed", completedAt, detail });
    throw error;
  }
}
