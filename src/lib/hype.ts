export function isHypeCommand(message: string) {
  return message.trim().toLowerCase() === "!hype";
}

export function uniqueVotesWithinWindow(
  votes: Array<{ userId: string; at: number }>,
  now: number,
  windowSeconds: number,
) {
  const cutoff = now - windowSeconds * 1000;
  return new Set(votes.filter((vote) => vote.at >= cutoff).map((vote) => vote.userId)).size;
}
