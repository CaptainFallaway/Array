import { AllocatedStack } from "./array.ts";

const ll = new AllocatedStack(10);

ll.merge(new Array(10).fill(0).map((_, i) => i + 1));

console.log(ll);

ll.cut(0, 4);

console.log(ll);
