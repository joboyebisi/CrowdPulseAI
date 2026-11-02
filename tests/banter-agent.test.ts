import assert from "node:assert/strict";
import test from "node:test";
import { buildBanterStandings, scoreBanter, topBanter } from "../src/lib/banter-agent";
import type { BanterMessage } from "../src/lib/types";

const messages: BanterMessage[] = [
  { id: "1", roomId: "room", authorId: "a", displayName: "Maya", team: "Real Madrid", message: "One chance, one winner. That is Madrid DNA! ⚽", createdAt: "2026-01-01T00:00:00Z" },
  { id: "2", roomId: "room", authorId: "b", displayName: "Lee", team: "Barcelona", message: "The midfield press is cooking again!", createdAt: "2026-01-01T00:00:01Z" },
];

test("scores safe, relevant football banter and builds team standings", () => {
  const score = scoreBanter(messages[0]);
  assert.equal(score.safe, true);
  assert.ok(score.total >= 50);
  const standings = buildBanterStandings(messages, "Barcelona", "Real Madrid");
  assert.equal(standings.length, 2);
  assert.equal(standings[1].shouts, 1);
  assert.ok(topBanter(messages));
});

test("books unsafe banter instead of promoting it to stage", () => {
  const message = { ...messages[0], message: "You are a stupid idiot" };
  const score = scoreBanter(message);
  assert.equal(score.safe, false);
  assert.equal(score.sportsmanship, 0);
});
