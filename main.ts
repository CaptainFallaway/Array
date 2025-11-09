import { AllocatedArray } from "./array.ts";

const ll = new AllocatedArray(10);

const log = console.log;

ll.push(10);
ll.push(20);
log(ll);

const thing = ll.at(-2);

log(ll);
log(thing);

ll.clear();

log(ll);
