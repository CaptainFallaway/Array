import { Slice } from "./array.ts";

const ll = new Slice(10);

function randomNum(max: number, min: number) {
	return Math.floor(Math.random() * (max + min) - min);
}

ll.fill((i) => i + 1);

const between = ll.between(0, 5);
console.log(between);

console.log(ll.details());

ll.sort();

console.log(ll.details());
