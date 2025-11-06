import { assert, assertEquals, assertThrows } from "@std/assert";

import { Vector } from "./array.ts";

// Helper to fill a vector from values array
function fill(v: Vector, values: number[]) {
  for (const x of values) v.push(x);
}

Deno.test("constructor -> empty vector", () => {
  const v = new Vector(5);
  assertEquals(v.length(), 0);
  assertEquals(v.isEmpty, true);
});

Deno.test("push/pop/length behavior", () => {
  const v = new Vector(6);
  v.push(10);
  assertEquals(v.length(), 1);
  assertEquals(v.containsOne, true);

  v.push(20);
  v.push(30);
  assertEquals(v.length(), 3);

  // pop should reduce length and return the new length
  const newLen = v.pop();
  assertEquals(newLen, 2);
  assertEquals(v.length(), 2);
});

Deno.test("push throws when full (boundary)", () => {
  // According to implementation max pushes allowed is size - 1
  const size = 5;
  const v = new Vector(size);
  for (let i = 0; i < size - 1; i++) v.push(i);
  assertEquals(v.length(), size - 1);
  // next push should throw
  assertThrows(() => v.push(99), Error);
});

Deno.test("min/max/sum/mean", () => {
  const v = new Vector(10);
  fill(v, [5, 3, 8, 1]);
  assertEquals(v.min(), 1);
  assertEquals(v.max(), 8);
  assertEquals(v.sum(), 17);
  assertEquals(v.mean(), 17 / 4);
});

Deno.test("at() valid and out-of-bounds", () => {
  const v = new Vector(5);
  fill(v, [7, 8, 9]);
  assertEquals(v.at(0), 7);
  assertEquals(v.at(2), 9);
  // out of bounds should throw
  assertThrows(() => v.at(10));
});

Deno.test("popHead shifts elements and reduces length", () => {
  const v = new Vector(6);
  fill(v, [1, 2, 3]);
  const beforeLen = v.length();
  v.popHead();
  // length should have decreased by 1
  assertEquals(v.length(), beforeLen - 1);
  // first element should now be the former second element
  assertEquals(v.at(0), 2);
});

Deno.test("clear empties the vector", () => {
  const v = new Vector(5);
  fill(v, [1, 2, 3]);
  v.clear();
  assertEquals(v.length(), 0);
  assertEquals(v.isEmpty, true);
});

Deno.test("between returns slice and enforces bounds", () => {
  const v = new Vector(6);
  fill(v, [10, 20, 30, 40]);
  const slice = v.between(1, 2);
  assertEquals(slice, [20, 30]);
  assertThrows(() => v.between(3, 10)); // end out of bounds
  assertThrows(() => v.between(-1, 2)); // start < 0
  assertThrows(() => v.between(3, 1)); // start > end
});

Deno.test("sort sorts the active portion ascending", () => {
  const v = new Vector(10);
  fill(v, [5, 1, 4, 2, 3]);
  const duration = v.sort();
  // sort returns a time in ms (non-negative number)
  assert(typeof duration === "number" && duration >= 0);
  assertThrows(() => v.at(10));
  // check the used portion is sorted
  const sorted = v.between(0, v.length() - 1);
  for (let i = 1; i < sorted.length; i++) {
    assert(sorted[i - 1] <= sorted[i]);
  }
});
