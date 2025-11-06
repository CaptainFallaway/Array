import { Vector } from "./array.ts";

const ll = new Vector(10);

const log = console.log;

log(ll.length());

ll.push(10);

log(ll.length());
log(ll);

ll.push(20);

log(ll.length());
log(ll);

const thing = ll.pop();

log(thing);
log(ll);
