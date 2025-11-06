export const OutOfBounds = new Error("Index is out of bounds of the Vector");
export const StartBiggerThanEnd = new Error(
  "start argument is greater than end"
);

export class Vector {
  private size: number;
  private array: number[] = [];
  private _length: number = 0;

  constructor(size: number) {
    this.size = size;
    this.array = this.newArr();
  }

  private newArr(): number[] {
    const arr = [];

    for (let i = 0; i < this.size; i++) {
      arr[i] = 0;
    }

    return arr;
  }

  get isEmpty(): boolean {
    return this._length <= 0;
  }

  get containsOne(): boolean {
    return this._length == 1;
  }

  push(num: number) {
    if (this._length + 1 >= this.size) {
      throw new Error("Array is filled");
    }

    this.array[this._length] = num;
    this._length++;
  }

  pop(): number {
    if (this.isEmpty) {
      return 0;
    }

    this._length--;
    this.array[this._length] = 0;

    return this._length;
  }

  length(): number {
    return this._length;
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
    for (let i = 0; i < this._length; i++) {
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
    for (let i = 0; i < this._length; i++) {
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
    for (let i = 0; i < this._length; i++) {
      sum += this.array[i];
    }

    return sum;
  }

  mean(): number {
    const sum = this.sum();
    return sum / this._length;
  }

  clear() {
    for (let i = 0; i < this._length; i++) {
      this.array[i] = 0;
    }
    this._length = 0;
  }

  at(index: number): number {
    let indx = 0;

    if (index < 0) {
      indx = this._length - index;
    } else {
      indx = index;
    }

    if (indx > this._length - 1) {
      throw OutOfBounds;
    }

    return this.array[indx];
  }

  popHead(): number {
    for (let i = 0; i < this._length; i++) {
      const j = i + 1;
      if (j >= this._length) {
        break;
      }
      this.array[i] = this.array[j];
      this.array[j] = 0;
    }

    return this._length--;
  }

  // Returns the time the sorting took in milliseconds
  sort(): number {
    if (this.isEmpty || this.containsOne) {
      return 0;
    }

    const start = Date.now();

    // Bubble sort only over the used portion of the internal array
    for (let i = 0; i < this._length - 1; i++) {
      let swapped = false;
      for (let j = 0; j < this._length - 1 - i; j++) {
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
    if (end > this._length - 1) {
      throw OutOfBounds;
    }

    if (start < 0) {
      throw OutOfBounds;
    }

    if (start > end) {
      throw StartBiggerThanEnd;
    }

    const arr = [];

    for (let i = 0; i < this._length; i++) {
      if (i >= start && i <= end) {
        arr[i - start] = this.array[i];
      }
    }

    return arr;
  }

  // I don't give a shit about this anymore
}
