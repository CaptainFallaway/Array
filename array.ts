export class OutOfBoundsError extends Error {
	constructor(message = "Array operation is out of bounds") {
		super(message);
		this.name = "OutOfBoundsError";
	}
}

export class InvalidRangeError extends Error {
	constructor(message = "Invalid range specified") {
		super(message);
		this.name = "InvalidRangeError";
	}
}

export class SizeTooSmallError extends Error {
	constructor(message = "The array size is too small") {
		super(message);
		this.name = "SizeTooSmallError";
	}
}

export class AllocatedArray {
	private size: number;
	private array: number[] = [];

	#length: number = 0;

	constructor(size: number) {
		if (size <= 1) {
			throw new SizeTooSmallError();
		}

		this.size = size;

		for (let i = 0; i < size; i++) {
			this.array[i] = 0;
		}
	}

	get isEmpty(): boolean {
		return this.#length <= 0;
	}

	get containsOne(): boolean {
		return this.#length == 1;
	}

	get length(): number {
		return this.#length;
	}

	push(num: number) {
		if (this.#length + 1 > this.size) {
			throw new OutOfBoundsError();
		}

		this.array[this.#length] = num;
		this.#length++;
	}

	pop(): number {
		if (this.isEmpty) {
			return -1;
		}

		this.#length--;
		this.array[this.#length] = 0;

		return this.#length;
	}

	min(): number {
		if (this.isEmpty) {
			return 0;
		}

		if (this.containsOne) {
			return this.array[0];
		}

		let min = this.array[0];

		// iterate only over populated portion
		for (let i = 0; i < this.#length; i++) {
			const num = this.array[i];
			if (num < min) {
				min = num;
			}
		}

		return min;
	}

	max(): number {
		if (this.isEmpty) {
			return 0;
		}

		if (this.containsOne) {
			return this.array[0];
		}

		let max = this.array[0];

		// iterate only over populated portion
		for (let i = 0; i < this.#length; i++) {
			const num = this.array[i];
			if (num > max) {
				max = num;
			}
		}

		return max;
	}

	sum(): number {
		if (this.isEmpty) {
			return 0;
		}

		if (this.containsOne) {
			return this.array[0];
		}

		let sum = 0;

		// iterate only over populated portion
		for (let i = 0; i < this.#length; i++) {
			sum += this.array[i];
		}

		return sum;
	}

	mean(): number {
		if (this.#length === 0) {
			return 0;
		}

		const sum = this.sum();
		return sum / this.#length;
	}

	clear() {
		for (let i = 0; i < this.#length; i++) {
			this.array[i] = 0;
		}
		this.#length = 0;
	}

	at(index: number): number {
		if (index < 0) {
			// Convert negative number to positive for reverse grabbing (just like in python bby)
			index = this.#length + index;
		}

		if (index < 0 || index >= this.#length) {
			throw new OutOfBoundsError();
		}

		return this.array[index];
	}

	popHead(): number {
		for (let i = 0; i < this.#length; i++) {
			const j = i + 1;
			if (j >= this.#length) {
				break;
			}
			this.array[i] = this.array[j];
			this.array[j] = 0;
		}

		return this.#length--;
	}

	// Returns the time the sorting took in milliseconds
	sort(): number {
		if (this.isEmpty || this.containsOne) {
			return 0;
		}

		const start = Date.now();

		// Bubble sort only over the used portion of the internal array
		for (let i = 0; i < this.#length - 1; i++) {
			let swapped = false;
			for (let j = 0; j < this.#length - 1 - i; j++) {
				if (this.array[j] > this.array[j + 1]) {
					const tmp = this.array[j];
					this.array[j] = this.array[j + 1];
					this.array[j + 1] = tmp;
					swapped = true;
				}
			}
			if (!swapped) {
				break;
			}
		}

		return Date.now() - start;
	}

	between(start: number, end: number): number[] {
		if (start < 0 || end > this.#length - 1) {
			throw new OutOfBoundsError();
		}

		if (start > end) {
			throw new InvalidRangeError();
		}

		const arr = [];

		for (let i = 0; i < this.#length; i++) {
			if (i >= start && i <= end) {
				arr[i - start] = this.array[i];
			}
		}

		return arr;
	}

	cut(from: number, to: number): number {
		if (from < 0 || to > this.#length - 1) {
			throw new OutOfBoundsError();
		}

		if (from > to) {
			throw new InvalidRangeError();
		}

		const len = this.#length;

		for (let i = 0; i < len; i++) {
			if (i >= from || i <= to) {
				this.array[i] = 0;
				this.#length--;
			}
		}

		return this.#length;
	}

	reverse() {
		if (this.isEmpty || this.containsOne) {
			return;
		}

		const half = Math.floor(this.#length / 2);
		for (let i = 0; i < half; i++) {
			const reverseIndx = this.#length - 1 - i;
			const tmp = this.array[i];
			this.array[i] = this.array[reverseIndx];
			this.array[reverseIndx] = tmp;
		}
	}

	merge(arr: number[]): number {
		if (arr.length + this.#length > this.size) {
			throw new OutOfBoundsError();
		}

		for (const num of arr) {
			this.push(num);
		}

		return this.#length;
	}
}
