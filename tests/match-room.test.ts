import assert from "node:assert/strict";
import test from "node:test";
import { createMatchRoom, createOpeningBrief, findMatchRoom, joinMatchRoom, listCreatorMatchRooms } from "../src/lib/match-room-store";

test("creates a creator-owned Match Room and deduplicates supporter responses", () => {
  const creatorId = `creator-${Date.now()}`;
  const room = createMatchRoom({
    creatorId,
    creatorName: "MatchDay Maya",
    title: "North London Warm-Up",
    homeTeam: "Home FC",
    awayTeam: "Away United",
    kickoffAt: new Date(Date.now() + 3_600_000).toISOString(),
    pollQuestion: "Who scores first?",
    pollOptions: ["Home FC", "Away United", "No goals"],
  });

  assert.equal(room.supporterCount, 0);
  joinMatchRoom(room.id, {
    participantId: "supporter-1",
    displayName: "NorthBankLee",
    scorePrediction: "2-1",
    pollChoice: "Home FC",
  });
  const updated = joinMatchRoom(room.id, {
    participantId: "supporter-1",
    displayName: "NorthBankLee",
    scorePrediction: "3-1",
    pollChoice: "Home FC",
  });

  assert.equal(updated?.supporterCount, 1);
  assert.equal(updated?.predictionCount, 1);
  assert.equal(updated?.pollCounts["Home FC"], 1);
  assert.equal(findMatchRoom(room.id)?.creatorId, creatorId);
  assert.equal(listCreatorMatchRooms(creatorId).length, 1);
  assert.match(createOpeningBrief(room.id)[0], /1 supporters/);
});
