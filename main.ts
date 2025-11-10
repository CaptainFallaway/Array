import { AllocatedStack } from "./array.ts";

const ll = new AllocatedStack(10);

function randomNum() {
	return Math.floor(Math.random() * (10 + 10) - 10);
}

ll.fill(() => randomNum());

console.log(ll.toString(true));

ll.sort();

console.log(ll.toString(true));
