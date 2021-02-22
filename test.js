import ErrorFinder from './ErrorFinder.js';

let r = await new ErrorFinder().seek(9);
console.log(r);