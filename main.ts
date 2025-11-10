import { AllocatedStack } from "./array.ts";

const ll = new AllocatedStack(10);

console.log(ll);
console.log(ll.length);

ll.cut(0, 4);

console.log(ll);
console.log(ll.length);
