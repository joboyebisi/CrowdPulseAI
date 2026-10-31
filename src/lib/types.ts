export type MomentStatus = "capturing" | "pending" | "approved" | "rejected" | "failed";

export type ChatSignal = {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  simulated?: boolean;
};

export type SocialDraft = {
  platform: "TikTok" | "YouTube Shorts" | "X";
  copy: string;
  hashtags: string[];
};

export type MomentAgentName = "signal-scout" | "clip-director" | "pundit" | "growth-producer";
export type MomentAgentStatus = "queued" | "running" | "completed" | "skipped" | "failed";

export type MomentAgentRun = {
  agent: MomentAgentName;
  label: string;
  status: MomentAgentStatus;
  startedAt?: string;
  completedAt?: string;
  detail: string;
};

export type Moment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creatorName: string;
  title: string;
  caption: string;
  punditLine: string;
  socialDrafts: SocialDraft[];
  agentProvider: string;
  agentRuns: MomentAgentRun[];
  status: MomentStatus;
  hypeVotes: number;
  contributors: string[];
  chatContext: string[];
  clipId?: string;
  clipUrl?: string;
  thumbnailUrl?: string;
  failureReason?: string;
  aiGenerated: boolean;
  simulated: boolean;
};

export type RuntimeState = {
  connected: boolean;
  connecting: boolean;
  broadcasterId?: string;
  broadcasterName?: string;
  listenerError?: string;
  hypeThreshold: number;
  hypeWindowSeconds: number;
  cooldownSeconds: number;
  cooldownUntil?: string;
  currentVotes: number;
  recentChat: ChatSignal[];
  moments: Moment[];
};

export type TwitchSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes: string[];
  userId: string;
  login: string;
  displayName: string;
};
