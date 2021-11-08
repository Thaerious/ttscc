/**
 * Return the first object in a bredth-first-search of child nodes that 
 * has a matching key:value pair.
 * Will return obj if it has the matching key:value pair.
 * @param {*} obj
 * @param {*} key
 * @param {*} value
 * @param {*} test (key, value) test function defaults to equivalency
 * @returns
 */
function bfsObject(obj, key, value, test) {
    test = test ?? (i => i === value);

    if (typeof obj !== "object") return undefined;
    const queue = [obj];

    while (queue.length > 0) {
        const current = queue.shift();
        if (test(current[key])) return current;

        for (const prop of Object.keys(current)) {
            if (typeof current[prop] == "object") {
                queue.push(current[prop]);
            }
        }
    }
}

export default bfsObject;