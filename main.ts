import { AllocatedArray } from "./array.ts";

const ll = new AllocatedArray(250);

function randomNum(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min) + min);
}

const blah = new Array(250).fill(0).map(() => randomNum(-1000, 1000));

ll.merge(blah);

const time = ll.sort();

console.log(ll);
console.log(time);
