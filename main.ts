import { Slice } from "./array.ts";

const ll = new Slice(10);

function randomNum() {
	return Math.floor(Math.random() * 100);
}

ll.fill(() => randomNum());

console.log(ll);

ll.sort();

console.log(ll.details());
