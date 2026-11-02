import type { BanterMessage, BanterScore, BanterTeamStanding } from "@/lib/types";

const footballWords = /\b(goal|winner|match|midfield|defence|defense|keeper|striker|press|counter|attack|tackle|assist|finish|chance|tempo|classico|madrid|barcelona|barca|mbappe|yamal)\b/gi;
const witSignals = /[!?]|\b(still|only|already|again|imagine|meanwhile|cooking|cold|dna|receipt|scoreboard)\b/gi;
const unsafeSignals = /\b(?:idiot|stupid|hate|kill|die|racist|moron)\b/i;

function matches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

export function scoreBanter(message: BanterMessage): BanterScore {
  const text = message.message.trim();
  const relevance = Math.min(25, 10 + matches(text, footballWords) * 5);
  const wit = Math.min(30, 9 + matches(text, witSignals) * 4 + (text.length >= 35 && text.length <= 120 ? 5 : 0));
  const energy = Math.min(25, 8 + matches(text, /[!?\u26BD\u{1F525}\u{1F602}\u{1F440}]/gu) * 3 + (text.length >= 18 ? 4 : 0));
  const sportsmanship = unsafeSignals.test(text) ? 0 : 20;
  const total = relevance + wit + energy + sportsmanship;
  return {
    total,
    wit,
    relevance,
    energy,
    sportsmanship,
    verdict: sportsmanship === 0 ? "Booked by the Banter Ref" : total >= 78 ? "Stage-worthy shout" : total >= 62 ? "Top-bin banter" : total >= 45 ? "Solid terrace energy" : "Needs more match-day spice",
    safe: sportsmanship > 0,
  };
}

export function buildBanterStandings(messages: BanterMessage[], homeTeam: string, awayTeam: string): BanterTeamStanding[] {
  return [homeTeam, awayTeam].map((team) => {
    const teamMessages = messages.filter((message) => message.team === team);
    const scores = teamMessages.map(scoreBanter).filter((score) => score.safe);
    return {
      team,
      points: scores.reduce((total, score) => total + score.total, 0),
      shouts: teamMessages.length,
      average: scores.length ? Math.round(scores.reduce((total, score) => total + score.total, 0) / scores.length) : 0,
    };
  });
}

export function topBanter(messages: BanterMessage[]) {
  return messages
    .map((message) => ({ message, score: scoreBanter(message) }))
    .filter((entry) => entry.score.safe)
    .sort((left, right) => right.score.total - left.score.total)[0] ?? null;
}

