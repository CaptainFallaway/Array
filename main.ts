import { AllocatedStack } from "./array.ts";

const ll = new AllocatedStack(10);

function randomNum() {
	return Math.floor(Math.random() * 100);
}

ll.fill(() => randomNum());

ll.cut(0, 5);

console.log(ll);

ll.sort();

console.log(ll);
