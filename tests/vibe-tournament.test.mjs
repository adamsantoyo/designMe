// Phase 3 — lock the this-or-that tournament determinism BEFORE bounding the pool.
// balancedVibes / nextChallengerIndex are pure and must stay deterministic: the same
// vibes always seed the same bracket, and a winner always meets a same-tag challenger.

import { test } from "node:test";
import assert from "node:assert/strict";
import { vibes, balancedVibes, nextChallengerIndex, THIS_OR_THAT_POOL } from "../app/src/dm.ts";

test("balancedVibes is a stable permutation of every vibe", () => {
  const out = balancedVibes(vibes);
  assert.equal(out.length, vibes.length, "must not drop or add vibes");
  assert.deepEqual(
    [...out.map((v) => v.id)].sort(),
    [...vibes.map((v) => v.id)].sort(),
    "same set of ids",
  );
  // Deterministic: identical input -> identical order.
  assert.deepEqual(balancedVibes(vibes).map((v) => v.id), out.map((v) => v.id));
});

test("balancedVibes interleaves tags (round-robin, not front-loaded)", () => {
  const out = balancedVibes(vibes);
  // The first N (N = number of distinct tags) must all be different tags.
  const tagCount = new Set(vibes.map((v) => v.tag)).size;
  const firstTags = out.slice(0, tagCount).map((v) => v.tag);
  assert.equal(new Set(firstTags).size, tagCount, "the opening round-robin covers every tag once");
});

test("the bounded pool yields a calm number of rounds", () => {
  const pool = balancedVibes(vibes).slice(0, THIS_OR_THAT_POOL);
  assert.ok(pool.length <= THIS_OR_THAT_POOL);
  const rounds = pool.length - 1; // champ vs each remaining challenger
  assert.ok(rounds >= 5 && rounds <= 8, `expected ~5-8 rounds, got ${rounds}`);
  // The bounded pool is still tag-diverse (not 8 of the same mood).
  assert.ok(new Set(pool.map((v) => v.tag)).size >= 4, "bounded pool spans several tags");
});

test("nextChallengerIndex prefers a same-tag challenger, else the front", () => {
  const queue = balancedVibes(vibes).slice(2, THIS_OR_THAT_POOL);
  const winner = queue.find((v) => queue.filter((q) => q.tag === v.tag).length >= 1) || queue[0];
  const idx = nextChallengerIndex(queue, winner);
  assert.equal(queue[idx].tag, winner.tag, "picks a same-tag challenger when one exists");

  // No same-tag challenger -> index 0 (deterministic fallback).
  const noMatch = nextChallengerIndex(queue, { tag: "___nope___" });
  assert.equal(noMatch, 0);

  // Deterministic.
  assert.equal(nextChallengerIndex(queue, winner), idx);
});
