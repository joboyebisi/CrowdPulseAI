import assert from "node:assert/strict";
import test from "node:test";
import { isHypeCommand, uniqueVotesWithinWindow } from "../src/lib/hype";

test("recognises a case-insensitive hype command with surrounding whitespace", () => {
  assert.equal(isHypeCommand("  !HyPe  "), true);
  assert.equal(isHypeCommand("!clip"), true);
  assert.equal(isHypeCommand("!moment"), true);
  assert.equal(isHypeCommand("that was hype"), false);
});

test("deduplicates viewers and excludes stale votes", () => {
  const now = 100_000;
  const count = uniqueVotesWithinWindow(
    [
      { userId: "one", at: now - 2_000 },
      { userId: "one", at: now - 1_000 },
      { userId: "two", at: now - 3_000 },
      { userId: "old", at: now - 30_000 },
    ],
    now,
    20,
  );
  assert.equal(count, 2);
});
