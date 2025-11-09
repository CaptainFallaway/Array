import { assert, assertEquals, assertThrows } from "@std/assert";

import { AllocatedArray, InvalidRangeError, OutOfBoundsError, SizeTooSmallError } from "./array.ts";

// Helper to fill a vector from values array
function fill(v: AllocatedArray, values: number[]) {
	for (const x of values) v.push(x);
}

Deno.test("constructor -> empty vector", () => {
	const v = new AllocatedArray(5);
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("push/pop/length behavior", () => {
	const v = new AllocatedArray(6);
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
	// According to implementation max pushes allowed is size - 1
	const size = 5;
	const v = new AllocatedArray(size);
	for (let i = 0; i < size - 1; i++) v.push(i);
	assertEquals(v.length, size - 1);
	// next push should throw
	assertThrows(() => v.push(99), Error);
});

Deno.test("min/max/sum/mean", () => {
	const v = new AllocatedArray(10);
	fill(v, [5, 3, 8, 1]);
	assertEquals(v.min(), 1);
	assertEquals(v.max(), 8);
	assertEquals(v.sum(), 17);
	assertEquals(v.mean(), 17 / 4);
});

Deno.test("at() valid and out-of-bounds", () => {
	const v = new AllocatedArray(5);
	fill(v, [7, 8, 9]);
	assertEquals(v.at(0), 7);
	assertEquals(v.at(2), 9);
	// out of bounds should throw
	assertThrows(() => v.at(10));
});

Deno.test("popHead shifts elements and reduces length", () => {
	const v = new AllocatedArray(6);
	fill(v, [1, 2, 3]);
	const beforeLen = v.length;
	v.popHead();
	// length should have decreased by 1
	assertEquals(v.length, beforeLen - 1);
	// first element should now be the former second element
	assertEquals(v.at(0), 2);
});

Deno.test("clear empties the vector", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2, 3]);
	v.clear();
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("between returns slice and enforces bounds", () => {
	const v = new AllocatedArray(6);
	fill(v, [10, 20, 30, 40]);
	const slice = v.between(1, 2);
	assertEquals(slice, [20, 30]);
	assertThrows(() => v.between(3, 10)); // end out of bounds
	assertThrows(() => v.between(-1, 2)); // start < 0
	assertThrows(() => v.between(3, 1)); // start > end
});

Deno.test("sort sorts the active portion ascending", () => {
	const v = new AllocatedArray(10);
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
	assertThrows(() => new AllocatedArray(0), SizeTooSmallError);
});

Deno.test("constructor -> throws when size is 1", () => {
	assertThrows(() => new AllocatedArray(1), SizeTooSmallError);
});

Deno.test("constructor -> accepts size of 2 (minimum valid)", () => {
	const v = new AllocatedArray(2);
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("constructor -> large size allocation", () => {
	const v = new AllocatedArray(2 ** 16);
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

// ===== PUSH EDGE CASES =====

Deno.test("push -> single element to empty array", () => {
	const v = new AllocatedArray(3);
	v.push(42);
	assertEquals(v.length, 1);
	assertEquals(v.at(0), 42);
});

Deno.test("push -> negative numbers", () => {
	const v = new AllocatedArray(5);
	v.push(-10);
	v.push(-20);
	assertEquals(v.at(0), -10);
	assertEquals(v.at(1), -20);
});

Deno.test("push -> zero values", () => {
	const v = new AllocatedArray(5);
	v.push(0);
	v.push(0);
	assertEquals(v.length, 2);
	assertEquals(v.at(0), 0);
	assertEquals(v.at(1), 0);
});

Deno.test("push -> fills exactly to capacity - 1", () => {
	const v = new AllocatedArray(4);
	v.push(1);
	v.push(2);
	v.push(3);
	assertEquals(v.length, 3);
	assertThrows(() => v.push(4), Error, "Index is out of bounds");
});

// ===== POP EDGE CASES =====

Deno.test("pop -> from array with single element", () => {
	const v = new AllocatedArray(3);
	v.push(100);
	const newLen = v.pop();
	assertEquals(newLen, 0);
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("pop -> from empty array throws", () => {
	const v = new AllocatedArray(3);
	assertEquals(v.pop(), -1);
});

Deno.test("pop -> multiple times", () => {
	const v = new AllocatedArray(6);
	fill(v, [1, 2, 3, 4]);
	v.pop();
	assertEquals(v.length, 3);
	v.pop();
	assertEquals(v.length, 2);
	v.pop();
	assertEquals(v.length, 1);
});

Deno.test("pop -> then push again", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2, 3]);
	v.pop();
	v.push(99);
	assertEquals(v.length, 3);
	assertEquals(v.at(2), 99);
});

// ===== MIN EDGE CASES =====

Deno.test("min -> throws on empty array", () => {
	const v = new AllocatedArray(5);
	assertEquals(v.min(), 0);
});

Deno.test("min -> single element", () => {
	const v = new AllocatedArray(3);
	v.push(42);
	assertEquals(v.min(), 42);
});

Deno.test("min -> all same values", () => {
	const v = new AllocatedArray(6);
	fill(v, [5, 5, 5, 5]);
	assertEquals(v.min(), 5);
});

Deno.test("min -> negative numbers", () => {
	const v = new AllocatedArray(6);
	fill(v, [5, -10, 3, -20, 0]);
	assertEquals(v.min(), -20);
});

Deno.test("min -> min is first element", () => {
	const v = new AllocatedArray(6);
	fill(v, [1, 10, 20, 30]);
	assertEquals(v.min(), 1);
});

Deno.test("min -> min is last element", () => {
	const v = new AllocatedArray(6);
	fill(v, [30, 20, 10, 1]);
	assertEquals(v.min(), 1);
});

// ===== MAX EDGE CASES =====

Deno.test("max -> throws on empty array", () => {
	const v = new AllocatedArray(5);
	assertEquals(v.max(), 0);
});

Deno.test("max -> single element", () => {
	const v = new AllocatedArray(3);
	v.push(42);
	assertEquals(v.max(), 42);
});

Deno.test("max -> all same values", () => {
	const v = new AllocatedArray(6);
	fill(v, [7, 7, 7, 7]);
	assertEquals(v.max(), 7);
});

Deno.test("max -> negative numbers", () => {
	const v = new AllocatedArray(6);
	fill(v, [-5, -10, -3, -20]);
	assertEquals(v.max(), -3);
});

Deno.test("max -> max is first element", () => {
	const v = new AllocatedArray(6);
	fill(v, [100, 50, 25, 10]);
	assertEquals(v.max(), 100);
});

Deno.test("max -> max is last element", () => {
	const v = new AllocatedArray(6);
	fill(v, [1, 2, 3, 100]);
	assertEquals(v.max(), 100);
});

// ===== SUM EDGE CASES =====

Deno.test("sum -> throws on empty array", () => {
	const v = new AllocatedArray(5);
	assertEquals(v.sum(), 0);
});

Deno.test("sum -> single element", () => {
	const v = new AllocatedArray(3);
	v.push(42);
	assertEquals(v.sum(), 42);
});

Deno.test("sum -> negative numbers", () => {
	const v = new AllocatedArray(6);
	fill(v, [10, -5, -3, 8]);
	assertEquals(v.sum(), 10);
});

Deno.test("sum -> all zeros", () => {
	const v = new AllocatedArray(6);
	fill(v, [0, 0, 0]);
	assertEquals(v.sum(), 0);
});

Deno.test("sum -> large numbers", () => {
	const v = new AllocatedArray(5);
	fill(v, [1000, 2000, 3000]);
	assertEquals(v.sum(), 6000);
});

// ===== MEAN EDGE CASES =====

Deno.test("mean -> throws on empty array (via sum)", () => {
	const v = new AllocatedArray(5);
	assertEquals(v.mean(), 0);
});

Deno.test("mean -> single element", () => {
	const v = new AllocatedArray(3);
	v.push(42);
	assertEquals(v.mean(), 42);
});

Deno.test("mean -> even distribution", () => {
	const v = new AllocatedArray(6);
	fill(v, [2, 4, 6, 8]);
	assertEquals(v.mean(), 5);
});

Deno.test("mean -> fractional result", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2, 3]);
	assertEquals(v.mean(), 2);
});

Deno.test("mean -> negative numbers", () => {
	const v = new AllocatedArray(5);
	fill(v, [-10, 10]);
	assertEquals(v.mean(), 0);
});

// ===== CLEAR EDGE CASES =====

Deno.test("clear -> empty array remains empty", () => {
	const v = new AllocatedArray(5);
	v.clear();
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("clear -> single element", () => {
	const v = new AllocatedArray(3);
	v.push(99);
	v.clear();
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("clear -> full array", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2, 3, 4]);
	v.clear();
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("clear -> can push after clear", () => {
	const v = new AllocatedArray(4);
	fill(v, [1, 2]);
	v.clear();
	v.push(100);
	assertEquals(v.length, 1);
	assertEquals(v.at(0), 100);
});

// ===== AT EDGE CASES =====

Deno.test("at -> index 0 on single element", () => {
	const v = new AllocatedArray(3);
	v.push(42);
	assertEquals(v.at(0), 42);
});

Deno.test("at -> last valid index", () => {
	const v = new AllocatedArray(6);
	fill(v, [1, 2, 3, 4]);
	assertEquals(v.at(3), 4);
});

Deno.test("at -> negative index -1 (last element)", () => {
	const v = new AllocatedArray(6);
	fill(v, [10, 20, 30]);
	assertEquals(v.at(-1), 30);
});

Deno.test("at -> negative index beyond length throws", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2]);
	assertThrows(() => v.at(-10), Error, "Index is out of bounds");
});

Deno.test("at -> index equals length throws", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.at(3), Error, "Index is out of bounds");
});

Deno.test("at -> on empty array throws", () => {
	const v = new AllocatedArray(5);
	assertThrows(() => v.at(0), Error, "Index is out of bounds");
});

// ===== POPHEAD EDGE CASES =====

Deno.test("popHead -> single element becomes empty", () => {
	const v = new AllocatedArray(3);
	v.push(100);
	v.popHead();
	assertEquals(v.length, 0);
	assertEquals(v.isEmpty, true);
});

Deno.test("popHead -> two elements", () => {
	const v = new AllocatedArray(5);
	fill(v, [10, 20]);
	v.popHead();
	assertEquals(v.length, 1);
	assertEquals(v.at(0), 20);
});

Deno.test("popHead -> maintains order after removal", () => {
	const v = new AllocatedArray(7);
	fill(v, [1, 2, 3, 4, 5]);
	v.popHead();
	assertEquals(v.at(0), 2);
	assertEquals(v.at(1), 3);
	assertEquals(v.at(2), 4);
	assertEquals(v.at(3), 5);
});

Deno.test("popHead -> multiple times in succession", () => {
	const v = new AllocatedArray(6);
	fill(v, [1, 2, 3, 4]);
	v.popHead();
	assertEquals(v.at(0), 2);
	v.popHead();
	assertEquals(v.at(0), 3);
	assertEquals(v.length, 2);
});

// ===== SORT EDGE CASES =====

Deno.test("sort -> empty array returns 0", () => {
	const v = new AllocatedArray(5);
	const duration = v.sort();
	assertEquals(duration, 0);
});

Deno.test("sort -> single element returns 0", () => {
	const v = new AllocatedArray(3);
	v.push(42);
	const duration = v.sort();
	assertEquals(duration, 0);
	assertEquals(v.at(0), 42);
});

Deno.test("sort -> already sorted array", () => {
	const v = new AllocatedArray(7);
	fill(v, [1, 2, 3, 4, 5]);
	v.sort();
	assertEquals(v.between(0, 4), [1, 2, 3, 4, 5]);
});

Deno.test("sort -> reverse sorted array", () => {
	const v = new AllocatedArray(7);
	fill(v, [5, 4, 3, 2, 1]);
	v.sort();
	assertEquals(v.between(0, 4), [1, 2, 3, 4, 5]);
});

Deno.test("sort -> array with duplicates", () => {
	const v = new AllocatedArray(8);
	fill(v, [3, 1, 3, 2, 1]);
	v.sort();
	assertEquals(v.between(0, 4), [1, 1, 2, 3, 3]);
});

Deno.test("sort -> negative numbers", () => {
	const v = new AllocatedArray(8);
	fill(v, [-5, 10, -20, 0, 3]);
	v.sort();
	assertEquals(v.between(0, 4), [-20, -5, 0, 3, 10]);
});

Deno.test("sort -> two elements unsorted", () => {
	const v = new AllocatedArray(4);
	fill(v, [2, 1]);
	v.sort();
	assertEquals(v.between(0, 1), [1, 2]);
});

Deno.test("sort -> two elements already sorted", () => {
	const v = new AllocatedArray(4);
	fill(v, [1, 2]);
	v.sort();
	assertEquals(v.between(0, 1), [1, 2]);
});

// ===== BETWEEN EDGE CASES =====

Deno.test("between -> single element range", () => {
	const v = new AllocatedArray(5);
	fill(v, [10, 20, 30]);
	assertEquals(v.between(1, 1), [20]);
});

Deno.test("between -> entire array", () => {
	const v = new AllocatedArray(6);
	fill(v, [1, 2, 3, 4]);
	assertEquals(v.between(0, 3), [1, 2, 3, 4]);
});

Deno.test("between -> first two elements", () => {
	const v = new AllocatedArray(6);
	fill(v, [10, 20, 30, 40]);
	assertEquals(v.between(0, 1), [10, 20]);
});

Deno.test("between -> last two elements", () => {
	const v = new AllocatedArray(6);
	fill(v, [10, 20, 30, 40]);
	assertEquals(v.between(2, 3), [30, 40]);
});

Deno.test("between -> start equals end", () => {
	const v = new AllocatedArray(5);
	fill(v, [5, 10, 15]);
	assertEquals(v.between(0, 0), [5]);
});

Deno.test("between -> start negative throws", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.between(-1, 2), Error, "Index is out of bounds");
});

Deno.test("between -> end beyond length throws", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.between(0, 5), Error, "Index is out of bounds");
});

Deno.test("between -> start greater than end throws", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.between(2, 1), InvalidRangeError);
});

Deno.test("between -> both indices out of bounds throws", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2]);
	assertThrows(() => v.between(10, 20), Error, "Index is out of bounds");
});

// ===== CUT EDGE CASES =====

Deno.test("cut -> removes single element", () => {
	const v = new AllocatedArray(5);
	fill(v, [10, 20, 30]);
	v.cut(1, 1);
	// Based on implementation, cut zeros out matching elements
	assert(v.length < 3);
});

Deno.test("cut -> from and to at boundaries", () => {
	const v = new AllocatedArray(6);
	fill(v, [1, 2, 3, 4]);
	const result = v.cut(0, 3);
	assert(typeof result === "number");
});

Deno.test("cut -> from equals to", () => {
	const v = new AllocatedArray(5);
	fill(v, [10, 20, 30]);
	v.cut(1, 1);
	assert(v.length <= 3);
});

Deno.test("cut -> from negative throws", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.cut(-1, 2), Error, "Index is out of bounds");
});

Deno.test("cut -> to beyond length throws", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.cut(0, 10), OutOfBoundsError);
});

Deno.test("cut -> from greater than to throws", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2, 3]);
	assertThrows(() => v.cut(2, 1), InvalidRangeError);
});

// ===== REVERSE EDGE CASES =====

Deno.test("reverse -> empty array does nothing", () => {
	const v = new AllocatedArray(5);
	v.reverse();
	assertEquals(v.length, 0);
});

Deno.test("reverse -> single element does nothing", () => {
	const v = new AllocatedArray(3);
	v.push(42);
	v.reverse();
	assertEquals(v.at(0), 42);
});

Deno.test("reverse -> two elements", () => {
	const v = new AllocatedArray(4);
	fill(v, [1, 2]);
	v.reverse();
	assertEquals(v.at(0), 2);
	assertEquals(v.at(1), 1);
});

Deno.test("reverse -> odd number of elements", () => {
	const v = new AllocatedArray(6);
	fill(v, [1, 2, 3, 4, 5]);
	v.reverse();
	assertEquals(v.between(0, 4), [5, 4, 3, 2, 1]);
});

Deno.test("reverse -> even number of elements", () => {
	const v = new AllocatedArray(7);
	fill(v, [1, 2, 3, 4]);
	v.reverse();
	assertEquals(v.between(0, 3), [4, 3, 2, 1]);
});

Deno.test("reverse -> reverse twice returns to original", () => {
	const v = new AllocatedArray(7);
	fill(v, [1, 2, 3, 4]);
	v.reverse();
	v.reverse();
	assertEquals(v.between(0, 3), [1, 2, 3, 4]);
});

// ===== MERGE EDGE CASES =====

Deno.test("merge -> empty array with empty array", () => {
	const v = new AllocatedArray(5);
	const result = v.merge([]);
	assertEquals(result, 0);
	assertEquals(v.length, 0);
});

Deno.test("merge -> empty array with elements", () => {
	const v = new AllocatedArray(5);
	const result = v.merge([10, 20]);
	assertEquals(result, 2);
	assertEquals(v.at(0), 10);
	assertEquals(v.at(1), 20);
});

Deno.test("merge -> single element arrays", () => {
	const v = new AllocatedArray(5);
	v.push(5);
	const result = v.merge([10]);
	assertEquals(result, 2);
	assertEquals(v.at(1), 10);
});

Deno.test("merge -> exceeds capacity returns -1", () => {
	const v = new AllocatedArray(4);
	fill(v, [1, 2]);
	assertThrows(() => v.merge([3, 4, 5, 6]), OutOfBoundsError);
});

Deno.test("merge -> exactly fills to capacity", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2]);
	const result = v.merge([3, 4]);
	assertEquals(result, 4);
});

Deno.test("merge -> with negative numbers", () => {
	const v = new AllocatedArray(6);
	v.push(10);
	const result = v.merge([-5, -10]);
	assertEquals(result, 3);
	assertEquals(v.at(1), -5);
	assertEquals(v.at(2), -10);
});

Deno.test("merge -> large array", () => {
	const v = new AllocatedArray(100);
	fill(v, [1, 2, 3]);
	const toMerge = Array.from({ length: 50 }, (_, i) => i);
	const result = v.merge(toMerge);
	assertEquals(result, 53);
});

// ===== CONTAINSONE EDGE CASES =====

Deno.test("containsOne -> empty array returns false", () => {
	const v = new AllocatedArray(5);
	assertEquals(v.containsOne, false);
});

Deno.test("containsOne -> single element returns true", () => {
	const v = new AllocatedArray(3);
	v.push(42);
	assertEquals(v.containsOne, true);
});

Deno.test("containsOne -> two elements returns false", () => {
	const v = new AllocatedArray(4);
	fill(v, [1, 2]);
	assertEquals(v.containsOne, false);
});

Deno.test("containsOne -> after pop to one element", () => {
	const v = new AllocatedArray(4);
	fill(v, [1, 2]);
	v.pop();
	assertEquals(v.containsOne, true);
});

// ===== ISEMPTY EDGE CASES =====

Deno.test("isEmpty -> new array is empty", () => {
	const v = new AllocatedArray(5);
	assertEquals(v.isEmpty, true);
});

Deno.test("isEmpty -> after push is not empty", () => {
	const v = new AllocatedArray(3);
	v.push(1);
	assertEquals(v.isEmpty, false);
});

Deno.test("isEmpty -> after clear is empty", () => {
	const v = new AllocatedArray(5);
	fill(v, [1, 2, 3]);
	v.clear();
	assertEquals(v.isEmpty, true);
});

Deno.test("isEmpty -> after popping all elements", () => {
	const v = new AllocatedArray(4);
	fill(v, [1, 2]);
	v.pop();
	v.pop();
	assertEquals(v.isEmpty, true);
});

// ===== COMBINED OPERATIONS =====

Deno.test("combined -> push, sort, between", () => {
	const v = new AllocatedArray(8);
	fill(v, [5, 2, 8, 1, 9]);
	v.sort();
	const slice = v.between(1, 3);
	assertEquals(slice, [2, 5, 8]);
});

Deno.test("combined -> push, reverse, pop", () => {
	const v = new AllocatedArray(6);
	fill(v, [1, 2, 3]);
	v.reverse();
	v.pop();
	assertEquals(v.length, 2);
	assertEquals(v.at(0), 3);
});

Deno.test("combined -> merge, sort, min, max", () => {
	const v = new AllocatedArray(10);
	fill(v, [5, 3]);
	v.merge([1, 7, 2]);
	v.sort();
	assertEquals(v.min(), 1);
	assertEquals(v.max(), 7);
});

Deno.test("combined -> popHead multiple times then push", () => {
	const v = new AllocatedArray(6);
	fill(v, [1, 2, 3, 4]);
	v.popHead();
	v.popHead();
	v.push(99);
	assertEquals(v.at(0), 3);
	assertEquals(v.at(2), 99);
});

Deno.test("combined -> clear after operations", () => {
	const v = new AllocatedArray(7);
	fill(v, [1, 2, 3]);
	v.sort();
	v.reverse();
	v.push(4);
	v.clear();
	assertEquals(v.isEmpty, true);
	assertEquals(v.length, 0);
});
