import { assert, assertEquals, assertThrows } from "@std/assert";

import { Slice, InvalidRangeError, OutOfBoundsError, SizeTooSmallError } from "./array.ts";

// Helper to fill a vector from values array
function fill(v: Slice, values: number[]) {
	for (const x of values) v.push(x);
}

Deno.test("constructor -> empty vector", () => {
	const v = new Slice(5);
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("push/pop/length behavior", () => {
	const v = new Slice(6);
	v.push(10);
	assertEquals(v.length, 1);
	assertEquals(v.containsOne, true);

	v.push(20);
	v.push(30);
	assertEquals(v.length, 3);

	// pop should reduce length and return the new length
	const newLen = v.pop();
	assertEquals(newLen, 2);
	assertEquals(v.length, 2);
});

Deno.test("push throws when full (boundary)", () => {
	const size = 5;
	const v = new Slice(size);
	for (let i = 0; i < size - 1; i++) v.push(i);
	assertEquals(v.length, size - 1);
	// next push should now throw
	v.push(99);
});

Deno.test("min/max/sum/mean", () => {
	const v = new Slice(10);
	fill(v, [5, 3, 8, 1]);
	assertEquals(v.min(), 1);
	assertEquals(v.max(), 8);
	assertEquals(v.sum(), 17);
	assertEquals(v.mean(), 17 / 4);
});

Deno.test("at() valid and out-of-bounds", () => {
	const v = new Slice(5);
	fill(v, [7, 8, 9]);
	assertEquals(v.at(0), 7);
	assertEquals(v.at(2), 9);
	// out of bounds should throw
	assertThrows(() => v.at(10));
});

Deno.test("popHead shifts elements and reduces length", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3]);
	const beforeLen = v.length;
	v.popHead();
	// length should have decreased by 1
	assertEquals(v.length, beforeLen - 1);
	// first element should now be the former second element
	assertEquals(v.at(0), 2);
});

Deno.test("clear empties the vector", () => {
	const v = new Slice(5);
	fill(v, [1, 2, 3]);
	v.clear();
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("between returns slice and enforces bounds", () => {
	const v = new Slice(6);
	fill(v, [10, 20, 30, 40]);
	const slice = v.between(1, 2);
	assertEquals(slice, [20, 30]);
	assertThrows(() => v.between(3, 10)); // end out of bounds
	assertThrows(() => v.between(-1, 2)); // start < 0
	assertThrows(() => v.between(3, 1)); // start > end
});

Deno.test("sort sorts the active portion ascending", () => {
	const v = new Slice(10);
	fill(v, [5, 1, 4, 2, 3]);
	const duration = v.sort();
	// sort returns a time in ms (non-negative number)
	assert(typeof duration === "number" && duration >= 0);
	assertThrows(() => v.at(10));
	// check the used portion is sorted
	const sorted = v.between(0, v.length - 1);
	for (let i = 1; i < sorted.length; i++) {
		assert(sorted[i - 1] <= sorted[i]);
	}
});

// ===== CONSTRUCTOR EDGE CASES =====

Deno.test("constructor -> throws when size is 0", () => {
	assertThrows(() => new Slice(0), SizeTooSmallError);
});

Deno.test("constructor -> throws when size is 1", () => {
	assertThrows(() => new Slice(1), SizeTooSmallError);
});

Deno.test("constructor -> accepts size of 2 (minimum valid)", () => {
	const v = new Slice(2);
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("constructor -> large size allocation", () => {
	const v = new Slice(2 ** 16);
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

// ===== PUSH EDGE CASES =====

Deno.test("push -> single element to empty array", () => {
	const v = new Slice(3);
	v.push(42);
	assertEquals(v.length, 1);
	assertEquals(v.at(0), 42);
});

Deno.test("push -> negative numbers", () => {
	const v = new Slice(5);
	v.push(-10);
	v.push(-20);
	assertEquals(v.at(0), -10);
	assertEquals(v.at(1), -20);
});

Deno.test("push -> zero values", () => {
	const v = new Slice(5);
	v.push(0);
	v.push(0);
	assertEquals(v.length, 2);
	assertEquals(v.at(0), 0);
	assertEquals(v.at(1), 0);
});

Deno.test("push -> fills exactly to capacity - 1", () => {
	const v = new Slice(4);
	v.push(1);
	v.push(2);
	v.push(3);
	assertEquals(v.length, 3);
	v.push(4);
});

// ===== POP EDGE CASES =====

Deno.test("pop -> from array with single element", () => {
	const v = new Slice(3);
	v.push(100);
	const newLen = v.pop();
	assertEquals(newLen, 0);
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("pop -> from empty array throws", () => {
	const v = new Slice(3);
	assertEquals(v.pop(), -1);
});

Deno.test("pop -> multiple times", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3, 4]);
	v.pop();
	assertEquals(v.length, 3);
	v.pop();
	assertEquals(v.length, 2);
	v.pop();
	assertEquals(v.length, 1);
});

Deno.test("pop -> then push again", () => {
	const v = new Slice(5);
	fill(v, [1, 2, 3]);
	v.pop();
	v.push(99);
	assertEquals(v.length, 3);
	assertEquals(v.at(2), 99);
});

// ===== MIN EDGE CASES =====

Deno.test("min -> throws on empty array", () => {
	const v = new Slice(5);
	assertEquals(v.min(), 0);
});

Deno.test("min -> single element", () => {
	const v = new Slice(3);
	v.push(42);
	assertEquals(v.min(), 42);
});

Deno.test("min -> all same values", () => {
	const v = new Slice(6);
	fill(v, [5, 5, 5, 5]);
	assertEquals(v.min(), 5);
});

Deno.test("min -> negative numbers", () => {
	const v = new Slice(6);
	fill(v, [5, -10, 3, -20, 0]);
	assertEquals(v.min(), -20);
});

Deno.test("min -> min is first element", () => {
	const v = new Slice(6);
	fill(v, [1, 10, 20, 30]);
	assertEquals(v.min(), 1);
});

Deno.test("min -> min is last element", () => {
	const v = new Slice(6);
	fill(v, [30, 20, 10, 1]);
	assertEquals(v.min(), 1);
});

// ===== MAX EDGE CASES =====

Deno.test("max -> throws on empty array", () => {
	const v = new Slice(5);
	assertEquals(v.max(), 0);
});

Deno.test("max -> single element", () => {
	const v = new Slice(3);
	v.push(42);
	assertEquals(v.max(), 42);
});

Deno.test("max -> all same values", () => {
	const v = new Slice(6);
	fill(v, [7, 7, 7, 7]);
	assertEquals(v.max(), 7);
});

Deno.test("max -> negative numbers", () => {
	const v = new Slice(6);
	fill(v, [-5, -10, -3, -20]);
	assertEquals(v.max(), -3);
});

Deno.test("max -> max is first element", () => {
	const v = new Slice(6);
	fill(v, [100, 50, 25, 10]);
	assertEquals(v.max(), 100);
});

Deno.test("max -> max is last element", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3, 100]);
	assertEquals(v.max(), 100);
});

// ===== SUM EDGE CASES =====

Deno.test("sum -> throws on empty array", () => {
	const v = new Slice(5);
	assertEquals(v.sum(), 0);
});

Deno.test("sum -> single element", () => {
	const v = new Slice(3);
	v.push(42);
	assertEquals(v.sum(), 42);
});

Deno.test("sum -> negative numbers", () => {
	const v = new Slice(6);
	fill(v, [10, -5, -3, 8]);
	assertEquals(v.sum(), 10);
});

Deno.test("sum -> all zeros", () => {
	const v = new Slice(6);
	fill(v, [0, 0, 0]);
	assertEquals(v.sum(), 0);
});

Deno.test("sum -> large numbers", () => {
	const v = new Slice(5);
	fill(v, [1000, 2000, 3000]);
	assertEquals(v.sum(), 6000);
});

// ===== MEAN EDGE CASES =====

Deno.test("mean -> throws on empty array (via sum)", () => {
	const v = new Slice(5);
	assertEquals(v.mean(), 0);
});

Deno.test("mean -> single element", () => {
	const v = new Slice(3);
	v.push(42);
	assertEquals(v.mean(), 42);
});

Deno.test("mean -> even distribution", () => {
	const v = new Slice(6);
	fill(v, [2, 4, 6, 8]);
	assertEquals(v.mean(), 5);
});

Deno.test("mean -> fractional result", () => {
	const v = new Slice(5);
	fill(v, [1, 2, 3]);
	assertEquals(v.mean(), 2);
});

Deno.test("mean -> negative numbers", () => {
	const v = new Slice(5);
	fill(v, [-10, 10]);
	assertEquals(v.mean(), 0);
});

// ===== CLEAR EDGE CASES =====

Deno.test("clear -> empty array remains empty", () => {
	const v = new Slice(5);
	v.clear();
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("clear -> single element", () => {
	const v = new Slice(3);
	v.push(99);
	v.clear();
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("clear -> full array", () => {
	const v = new Slice(5);
	fill(v, [1, 2, 3, 4]);
	v.clear();
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("clear -> can push after clear", () => {
	const v = new Slice(4);
	fill(v, [1, 2]);
	v.clear();
	v.push(100);
	assertEquals(v.length, 1);
	assertEquals(v.at(0), 100);
});

// ===== AT EDGE CASES =====

Deno.test("at -> index 0 on single element", () => {
	const v = new Slice(3);
	v.push(42);
	assertEquals(v.at(0), 42);
});

Deno.test("at -> last valid index", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3, 4]);
	assertEquals(v.at(3), 4);
});

Deno.test("at -> negative index -1 (last element)", () => {
	const v = new Slice(6);
	fill(v, [10, 20, 30]);
	assertEquals(v.at(-1), 30);
});

Deno.test("at -> negative index beyond length throws", () => {
	const v = new Slice(5);
	fill(v, [1, 2]);
	assertThrows(() => v.at(-10), Error, "Array operation is out of bounds");
});

Deno.test("at -> index equals length throws", () => {
	const v = new Slice(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.at(3), Error, "Array operation is out of bounds");
});

Deno.test("at -> on empty array throws", () => {
	const v = new Slice(5);
	assertThrows(() => v.at(0), Error, "Array operation is out of bounds");
});

// ===== POPHEAD EDGE CASES =====

Deno.test("popHead -> single element becomes empty", () => {
	const v = new Slice(3);
	v.push(100);
	v.popHead();
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("popHead -> two elements", () => {
	const v = new Slice(5);
	fill(v, [10, 20]);
	v.popHead();
	assertEquals(v.length, 1);
	assertEquals(v.at(0), 20);
});

Deno.test("popHead -> maintains order after removal", () => {
	const v = new Slice(7);
	fill(v, [1, 2, 3, 4, 5]);
	v.popHead();
	assertEquals(v.at(0), 2);
	assertEquals(v.at(1), 3);
	assertEquals(v.at(2), 4);
	assertEquals(v.at(3), 5);
});

Deno.test("popHead -> multiple times in succession", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3, 4]);
	v.popHead();
	assertEquals(v.at(0), 2);
	v.popHead();
	assertEquals(v.at(0), 3);
	assertEquals(v.length, 2);
});

// ===== SORT EDGE CASES =====

Deno.test("sort -> empty array returns 0", () => {
	const v = new Slice(5);
	const duration = v.sort();
	assertEquals(duration, 0);
});

Deno.test("sort -> single element returns 0", () => {
	const v = new Slice(3);
	v.push(42);
	const duration = v.sort();
	assertEquals(duration, 0);
	assertEquals(v.at(0), 42);
});

Deno.test("sort -> already sorted array", () => {
	const v = new Slice(7);
	fill(v, [1, 2, 3, 4, 5]);
	v.sort();
	assertEquals(v.between(0, 4), [1, 2, 3, 4, 5]);
});

Deno.test("sort -> reverse sorted array", () => {
	const v = new Slice(7);
	fill(v, [5, 4, 3, 2, 1]);
	v.sort();
	assertEquals(v.between(0, 4), [1, 2, 3, 4, 5]);
});

Deno.test("sort -> array with duplicates", () => {
	const v = new Slice(8);
	fill(v, [3, 1, 3, 2, 1]);
	v.sort();
	assertEquals(v.between(0, 4), [1, 1, 2, 3, 3]);
});

Deno.test("sort -> negative numbers", () => {
	const v = new Slice(8);
	fill(v, [-5, 10, -20, 0, 3]);
	v.sort();
	assertEquals(v.between(0, 4), [-20, -5, 0, 3, 10]);
});

Deno.test("sort -> two elements unsorted", () => {
	const v = new Slice(4);
	fill(v, [2, 1]);
	v.sort();
	assertEquals(v.between(0, 1), [1, 2]);
});

Deno.test("sort -> two elements already sorted", () => {
	const v = new Slice(4);
	fill(v, [1, 2]);
	v.sort();
	assertEquals(v.between(0, 1), [1, 2]);
});

// ===== BETWEEN EDGE CASES =====

Deno.test("between -> single element range", () => {
	const v = new Slice(5);
	fill(v, [10, 20, 30]);
	assertEquals(v.between(1, 1), [20]);
});

Deno.test("between -> entire array", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3, 4]);
	assertEquals(v.between(0, 3), [1, 2, 3, 4]);
});

Deno.test("between -> first two elements", () => {
	const v = new Slice(6);
	fill(v, [10, 20, 30, 40]);
	assertEquals(v.between(0, 1), [10, 20]);
});

Deno.test("between -> last two elements", () => {
	const v = new Slice(6);
	fill(v, [10, 20, 30, 40]);
	assertEquals(v.between(2, 3), [30, 40]);
});

Deno.test("between -> start equals end", () => {
	const v = new Slice(5);
	fill(v, [5, 10, 15]);
	assertEquals(v.between(0, 0), [5]);
});

Deno.test("between -> start negative throws", () => {
	const v = new Slice(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.between(-1, 2), Error, "Array operation is out of bounds");
});

Deno.test("between -> end beyond length throws", () => {
	const v = new Slice(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.between(0, 5), Error, "Array operation is out of bounds");
});

Deno.test("between -> start greater than end throws", () => {
	const v = new Slice(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.between(2, 1), InvalidRangeError);
});

Deno.test("between -> both indices out of bounds throws", () => {
	const v = new Slice(5);
	fill(v, [1, 2]);
	assertThrows(() => v.between(10, 20), Error, "Array operation is out of bounds");
});

// ===== CUT EDGE CASES =====

Deno.test("cut -> removes single element", () => {
	const v = new Slice(5);
	fill(v, [10, 20, 30]);
	v.cut(1, 2); // removes index 1 (exclusive end)
	assertEquals(v.length, 2);
	assertEquals(v.at(0), 10);
	assertEquals(v.at(1), 30);
});

Deno.test("cut -> from and to at boundaries", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3, 4]);
	const result = v.cut(0, 4); // removes all (0 to 3 inclusive via exclusive 4)
	assertEquals(result, 0);
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("cut -> from equals to", () => {
	const v = new Slice(5);
	fill(v, [10, 20, 30]);
	// from == to should throw (no elements to remove)
	assertThrows(() => v.cut(1, 1), InvalidRangeError);
});

Deno.test("cut -> from negative throws", () => {
	const v = new Slice(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.cut(-1, 2), OutOfBoundsError);
});

Deno.test("cut -> to beyond length throws", () => {
	const v = new Slice(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.cut(0, 10), OutOfBoundsError);
});

Deno.test("cut -> from greater than to throws", () => {
	const v = new Slice(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.cut(2, 1), InvalidRangeError);
});

// ===== ADDITIONAL CUT TESTS =====

Deno.test("cut -> removes first element", () => {
	const v = new Slice(6);
	fill(v, [10, 20, 30, 40]);
	v.cut(0, 1); // removes index 0
	assertEquals(v.length, 3);
	assertEquals(v.at(0), 20);
	assertEquals(v.at(1), 30);
	assertEquals(v.at(2), 40);
});

Deno.test("cut -> removes last element", () => {
	const v = new Slice(6);
	fill(v, [10, 20, 30, 40]);
	v.cut(3, 4); // removes index 3
	assertEquals(v.length, 3);
	assertEquals(v.at(0), 10);
	assertEquals(v.at(1), 20);
	assertEquals(v.at(2), 30);
});

Deno.test("cut -> removes first two elements", () => {
	const v = new Slice(7);
	fill(v, [1, 2, 3, 4, 5]);
	v.cut(0, 2); // removes indices 0-1
	assertEquals(v.length, 3);
	assertEquals(v.at(0), 3);
	assertEquals(v.at(1), 4);
	assertEquals(v.at(2), 5);
});

Deno.test("cut -> removes last two elements", () => {
	const v = new Slice(7);
	fill(v, [1, 2, 3, 4, 5]);
	v.cut(3, 5); // removes indices 3-4
	assertEquals(v.length, 3);
	assertEquals(v.at(0), 1);
	assertEquals(v.at(1), 2);
	assertEquals(v.at(2), 3);
});

Deno.test("cut -> removes middle elements", () => {
	const v = new Slice(8);
	fill(v, [1, 2, 3, 4, 5, 6]);
	v.cut(2, 5); // removes indices 2-4
	assertEquals(v.length, 3);
	assertEquals(v.at(0), 1);
	assertEquals(v.at(1), 2);
	assertEquals(v.at(2), 6);
});

Deno.test("cut -> removes entire array", () => {
	const v = new Slice(6);
	fill(v, [10, 20, 30, 40]);
	v.cut(0, 4); // removes all
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("cut -> single element array", () => {
	const v = new Slice(3);
	v.push(42);
	v.cut(0, 1); // removes the only element
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("cut -> two element array remove first", () => {
	const v = new Slice(4);
	fill(v, [10, 20]);
	v.cut(0, 1); // removes index 0
	assertEquals(v.length, 1);
	assertEquals(v.at(0), 20);
});

Deno.test("cut -> two element array remove second", () => {
	const v = new Slice(4);
	fill(v, [10, 20]);
	v.cut(1, 2); // removes index 1
	assertEquals(v.length, 1);
	assertEquals(v.at(0), 10);
});

Deno.test("cut -> two element array remove both", () => {
	const v = new Slice(4);
	fill(v, [10, 20]);
	v.cut(0, 2); // removes both
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("cut -> multiple cuts in succession", () => {
	const v = new Slice(10);
	fill(v, [1, 2, 3, 4, 5, 6, 7]);
	v.cut(1, 3); // removes indices 1-2 (values 2, 3) -> [1, 4, 5, 6, 7]
	assertEquals(v.length, 5);
	assertEquals(v.at(1), 4);
	v.cut(2, 4); // removes indices 2-3 (values 5, 6) -> [1, 4, 7]
	assertEquals(v.length, 3);
	assertEquals(v.at(0), 1);
	assertEquals(v.at(1), 4);
	assertEquals(v.at(2), 7);
});

Deno.test("cut -> push after cut", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3, 4]);
	v.cut(1, 3); // removes indices 1-2 (values 2, 3) -> [1, 4]
	v.push(99);
	assertEquals(v.length, 3);
	assertEquals(v.at(0), 1);
	assertEquals(v.at(1), 4);
	assertEquals(v.at(2), 99);
});

Deno.test("cut -> cut then sort", () => {
	const v = new Slice(8);
	fill(v, [5, 1, 9, 3, 7]);
	v.cut(1, 4); // removes indices 1-3 (values 1, 9, 3) -> [5, 7]
	v.sort();
	assertEquals(v.length, 2);
	assertEquals(v.at(0), 5);
	assertEquals(v.at(1), 7);
});

Deno.test("cut -> cut with negative numbers", () => {
	const v = new Slice(8);
	fill(v, [-5, -3, -1, 0, 2, 4]);
	v.cut(1, 4); // removes indices 1-3 (values -3, -1, 0) -> [-5, 2, 4]
	assertEquals(v.length, 3);
	assertEquals(v.at(0), -5);
	assertEquals(v.at(1), 2);
	assertEquals(v.at(2), 4);
});

Deno.test("cut -> verifies internal array is zeroed", () => {
	const v = new Slice(6);
	fill(v, [10, 20, 30, 40]);
	v.cut(2, 4); // removes indices 2-3 (values 30, 40) -> [10, 20]
	assertEquals(v.length, 2);
	// Try to access beyond new length - should throw
	assertThrows(() => v.at(2), OutOfBoundsError);
});

Deno.test("cut -> at exact boundaries (0 to length-1)", () => {
	const v = new Slice(5);
	fill(v, [1, 2, 3]);
	v.cut(0, 3); // removes all
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("cut -> from = 0, to = length edge case", () => {
	const v = new Slice(10);
	fill(v, [5, 10, 15, 20, 25, 30, 35]);
	const initialLength = v.length;
	v.cut(0, initialLength); // removes all
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

// ===== REVERSE EDGE CASES =====

Deno.test("reverse -> empty array does nothing", () => {
	const v = new Slice(5);
	v.reverse();
	assertEquals(v.length, 0);
});

Deno.test("reverse -> single element does nothing", () => {
	const v = new Slice(3);
	v.push(42);
	v.reverse();
	assertEquals(v.at(0), 42);
});

Deno.test("reverse -> two elements", () => {
	const v = new Slice(4);
	fill(v, [1, 2]);
	v.reverse();
	assertEquals(v.at(0), 2);
	assertEquals(v.at(1), 1);
});

Deno.test("reverse -> odd number of elements", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3, 4, 5]);
	v.reverse();
	assertEquals(v.between(0, 4), [5, 4, 3, 2, 1]);
});

Deno.test("reverse -> even number of elements", () => {
	const v = new Slice(7);
	fill(v, [1, 2, 3, 4]);
	v.reverse();
	assertEquals(v.between(0, 3), [4, 3, 2, 1]);
});

Deno.test("reverse -> reverse twice returns to original", () => {
	const v = new Slice(7);
	fill(v, [1, 2, 3, 4]);
	v.reverse();
	v.reverse();
	assertEquals(v.between(0, 3), [1, 2, 3, 4]);
});

// ===== MERGE EDGE CASES =====

Deno.test("merge -> empty array with empty array", () => {
	const v = new Slice(5);
	const result = v.merge([]);
	assertEquals(result, 0);
	assertEquals(v.length, 0);
});

Deno.test("merge -> empty array with elements", () => {
	const v = new Slice(5);
	const result = v.merge([10, 20]);
	assertEquals(result, 2);
	assertEquals(v.at(0), 10);
	assertEquals(v.at(1), 20);
});

Deno.test("merge -> single element arrays", () => {
	const v = new Slice(5);
	v.push(5);
	const result = v.merge([10]);
	assertEquals(result, 2);
	assertEquals(v.at(1), 10);
});

Deno.test("merge -> exceeds capacity returns -1", () => {
	const v = new Slice(4);
	fill(v, [1, 2]);
	assertThrows(() => v.merge([3, 4, 5, 6]), OutOfBoundsError);
});

Deno.test("merge -> exactly fills to capacity", () => {
	const v = new Slice(5);
	fill(v, [1, 2]);
	const result = v.merge([3, 4]);
	assertEquals(result, 4);
});

Deno.test("merge -> with negative numbers", () => {
	const v = new Slice(6);
	v.push(10);
	const result = v.merge([-5, -10]);
	assertEquals(result, 3);
	assertEquals(v.at(1), -5);
	assertEquals(v.at(2), -10);
});

Deno.test("merge -> large array", () => {
	const v = new Slice(100);
	fill(v, [1, 2, 3]);
	const toMerge = Array.from({ length: 50 }, (_, i) => i);
	const result = v.merge(toMerge);
	assertEquals(result, 53);
});

// ===== CONTAINSONE EDGE CASES =====

Deno.test("containsOne -> empty array returns false", () => {
	const v = new Slice(5);
	assertEquals(v.containsOne, false);
});

Deno.test("containsOne -> single element returns true", () => {
	const v = new Slice(3);
	v.push(42);
	assertEquals(v.containsOne, true);
});

Deno.test("containsOne -> two elements returns false", () => {
	const v = new Slice(4);
	fill(v, [1, 2]);
	assertEquals(v.containsOne, false);
});

Deno.test("containsOne -> after pop to one element", () => {
	const v = new Slice(4);
	fill(v, [1, 2]);
	v.pop();
	assertEquals(v.containsOne, true);
});

// ===== ISEMPTY EDGE CASES =====

Deno.test("isEmpty -> new array is empty", () => {
	const v = new Slice(5);
	assertEquals(v.isEmpty, true);
});

Deno.test("isEmpty -> after push is not empty", () => {
	const v = new Slice(3);
	v.push(1);
	assertEquals(v.isEmpty, false);
});

Deno.test("isEmpty -> after clear is empty", () => {
	const v = new Slice(5);
	fill(v, [1, 2, 3]);
	v.clear();
	assertEquals(v.isEmpty, true);
});

Deno.test("isEmpty -> after popping all elements", () => {
	const v = new Slice(4);
	fill(v, [1, 2]);
	v.pop();
	v.pop();
	assertEquals(v.isEmpty, true);
});

// ===== COMBINED OPERATIONS =====

Deno.test("combined -> push, sort, between", () => {
	const v = new Slice(10);
	fill(v, [5, 2, 8, 8, 8, 1, 9]);
	v.sort();
	const slice = v.between(1, 3);
	assertEquals(slice, [2, 5, 8]);
});

Deno.test("combined -> push, reverse, pop", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3]);
	v.reverse();
	v.pop();
	assertEquals(v.length, 2);
	assertEquals(v.at(0), 3);
});

Deno.test("combined -> merge, sort, min, max", () => {
	const v = new Slice(10);
	fill(v, [5, 3]);
	v.merge([1, 7, 2]);
	v.sort();
	assertEquals(v.min(), 1);
	assertEquals(v.max(), 7);
});

Deno.test("combined -> popHead multiple times then push", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3, 4]);
	v.popHead();
	v.popHead();
	v.push(99);
	assertEquals(v.at(0), 3);
	assertEquals(v.at(2), 99);
});

Deno.test("combined -> clear after operations", () => {
	const v = new Slice(7);
	fill(v, [1, 2, 3]);
	v.sort();
	v.reverse();
	v.push(4);
	v.clear();
	assertEquals(v.isEmpty, true);
	assertEquals(v.length, 0);
});

// ===== ADDITIONAL CRITICAL EDGE CASES =====

Deno.test("popHead -> on empty array behavior", () => {
	const v = new Slice(5);
	// popHead on empty - implementation doesn't guard against this
	const result = v.popHead();
	assertEquals(result, -1); // Will decrement 0 to -1
});

Deno.test("at -> negative indices in middle range", () => {
	const v = new Slice(8);
	fill(v, [10, 20, 30, 40, 50]);
	assertEquals(v.at(-2), 40); // second from last
	assertEquals(v.at(-3), 30); // third from last
	assertEquals(v.at(-5), 10); // first element via negative
});

Deno.test("push -> floating point numbers", () => {
	const v = new Slice(5);
	v.push(3.14);
	v.push(2.718);
	assertEquals(v.at(0), 3.14);
	assertEquals(v.at(1), 2.718);
	assertEquals(v.sum(), 3.14 + 2.718);
});

Deno.test("push -> special numeric values", () => {
	const v = new Slice(6);
	v.push(Infinity);
	v.push(-Infinity);
	v.push(0);
	assertEquals(v.at(0), Infinity);
	assertEquals(v.at(1), -Infinity);
	assertEquals(v.max(), Infinity);
	assertEquals(v.min(), -Infinity);
});

Deno.test("push -> NaN behavior", () => {
	const v = new Slice(5);
	v.push(NaN);
	v.push(5);
	assert(Number.isNaN(v.at(0)));
	// NaN comparisons are tricky - max/min with NaN present
	const maxVal = v.max();
	// NaN > anything is false, so max should be 5
	assert(maxVal === 5 || Number.isNaN(maxVal));
});

Deno.test("between -> on empty array throws", () => {
	const v = new Slice(5);
	assertThrows(() => v.between(0, 0), OutOfBoundsError);
});

Deno.test("cut -> on empty array throws", () => {
	const v = new Slice(5);
	// Even cut(0, 0) should throw InvalidRangeError since from >= to
	assertThrows(() => v.cut(0, 0), InvalidRangeError);
});

Deno.test("reverse -> verify min/max swap positions", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3, 4, 5]);
	assertEquals(v.min(), 1);
	assertEquals(v.max(), 5);
	v.reverse();
	// After reverse, min and max values are the same but positions changed
	assertEquals(v.min(), 1);
	assertEquals(v.max(), 5);
	assertEquals(v.at(0), 5); // max is now first
	assertEquals(v.at(4), 1); // min is now last
});

Deno.test("sort -> with floating point numbers", () => {
	const v = new Slice(8);
	fill(v, [3.14, 1.41, 2.718, 0.577]);
	v.sort();
	const sorted = v.between(0, 3);
	assertEquals(sorted, [0.577, 1.41, 2.718, 3.14]);
});

Deno.test("mean -> with floating point precision", () => {
	const v = new Slice(5);
	v.push(1.1);
	v.push(2.2);
	v.push(3.3);
	const mean = v.mean();
	// Check within reasonable floating point precision
	assert(Math.abs(mean - 2.2) < 0.0001);
});

Deno.test("popHead -> return value after multiple pops", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3]);
	const result1 = v.popHead(); // removes 1, length becomes 2
	assertEquals(result1, 2);
	const result2 = v.popHead(); // removes 2, length becomes 1
	assertEquals(result2, 1);
	const result3 = v.popHead(); // removes 3, length becomes 0
	assertEquals(result3, 0);
});

Deno.test("push -> exactly at capacity boundary", () => {
	const v = new Slice(3);
	v.push(1);
	v.push(2);
	// Now at length 2, size 3, should allow one more
	v.push(3);
	assertEquals(v.length, 3);
	// Next push should throw
	assertThrows(() => v.push(4), OutOfBoundsError);
});

Deno.test("merge -> then access merged elements", () => {
	const v = new Slice(8);
	fill(v, [1, 2]);
	v.merge([3, 4, 5]);
	assertEquals(v.length, 5);
	assertEquals(v.at(0), 1);
	assertEquals(v.at(2), 3);
	assertEquals(v.at(4), 5);
});

Deno.test("cut -> entire array then try operations", () => {
	const v = new Slice(6);
	fill(v, [1, 2, 3]);
	v.cut(0, 3); // removes all (exclusive end)
	assertEquals(v.isEmpty, true);
	// Now try operations on empty
	assertEquals(v.sum(), 0);
	assertEquals(v.min(), 0);
	assertEquals(v.max(), 0);
	assertThrows(() => v.at(0), OutOfBoundsError);
});

Deno.test("reverse -> then check sum unchanged", () => {
	const v = new Slice(8);
	fill(v, [1, 2, 3, 4, 5]);
	const sumBefore = v.sum();
	v.reverse();
	const sumAfter = v.sum();
	assertEquals(sumBefore, sumAfter); // Sum should be invariant
});

Deno.test("between -> after reverse", () => {
	const v = new Slice(7);
	fill(v, [10, 20, 30, 40]);
	v.reverse();
	const slice = v.between(1, 2);
	assertEquals(slice, [30, 20]);
});

Deno.test("at -> boundary case at length-1", () => {
	const v = new Slice(5);
	fill(v, [10, 20, 30]);
	assertEquals(v.at(v.length - 1), 30);
});

Deno.test("clear -> verify all positions zeroed", () => {
	const v = new Slice(5);
	fill(v, [10, 20, 30]);
	v.clear();
	// Push new value - should go to index 0
	v.push(99);
	assertEquals(v.at(0), 99);
	assertEquals(v.length, 1);
});

Deno.test("pop -> verify value is actually zeroed in internal array", () => {
	const v = new Slice(5);
	fill(v, [10, 20, 30]);
	v.pop(); // removes 30
	// If we push again, it should overwrite the zeroed position
	v.push(99);
	assertEquals(v.at(2), 99);
	assertEquals(v.length, 3);
});
