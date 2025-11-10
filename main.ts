import { AllocatedStack } from "./array.ts";

const ll = new AllocatedStack(10);

ll.fill((i) => i + 1);

ll.cut(0, 4);

console.log(ll.toString(true));
