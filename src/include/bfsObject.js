/**
 * Return the first object in a breadth-first-search of child objects that 
 * for a matching key:value pair.
 * Will return the root object if it has the matching key:value pair.
 * Will return undefined if no match is found.
 * The 'test' function accepts the value of key when it is found on an object.
 * It defaults to simple equivalency.
 * @param {*} root
 * @param {*} key
 * @param {*} value
 * @param {*} test (value) test function defaults for equivalency
 * @returns
 */
function bfsObject(root, key, value, test) {
    test = test ?? (i => i === value);

    if (typeof root !== "object") return undefined;
    const queue = [root];

    while (queue.length > 0) {
        const current = queue.shift();
        if (test(current[key])) return current;

        for (const prop of Object.keys(current))
            if (typeof current[prop] == "object")
                queue.push(current[prop]);
    }
    return undefined;
}

export default bfsObject;