export type MomentStatus = "capturing" | "pending" | "approved" | "rejected" | "failed";

export type ChatSignal = {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  simulated?: boolean;
};

export type Moment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creatorName: string;
  title: string;
  caption: string;
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
