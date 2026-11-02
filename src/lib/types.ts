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

export type MatchRoomStatus = "draft" | "open" | "live" | "closed";

export type MatchRoomResponse = {
  participantId: string;
  displayName: string;
  scorePrediction?: string;
  pollChoice?: string;
  checkedIn: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BanterMessage = {
  id: string;
  roomId: string;
  authorId: string;
  displayName: string;
  message: string;
  team?: string;
  imageUrl?: string;
  reactionCounts?: BanterReactionCounts;
  spotlight?: "live" | "postmatch";
  createdAt: string;
};

export type BanterReaction = "fire" | "laugh" | "clap";
export type BanterReactionCounts = Record<BanterReaction, number>;

export type BanterScore = {
  total: number;
  wit: number;
  relevance: number;
  energy: number;
  sportsmanship: number;
  verdict: string;
  safe: boolean;
};

export type BanterTeamStanding = {
  team: string;
  points: number;
  shouts: number;
  average: number;
};

export type MatchRoom = {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  pollQuestion: string;
  pollOptions: string[];
  arenaTitle?: string;
  arenaPhase?: "prematch" | "live" | "postmatch";
  status: MatchRoomStatus;
  createdAt: string;
  updatedAt: string;
  responses: MatchRoomResponse[];
};

export type MatchRoomSummary = Omit<MatchRoom, "responses"> & {
  supporterCount: number;
  predictionCount: number;
  pollCounts: Record<string, number>;
  banterCount?: number;
  recentBanter?: BanterMessage[];
};
